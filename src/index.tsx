import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  Children,
  type ReactNode,
  type ReactElement,
} from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Easing,
  AccessibilityInfo,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/**
 * Animation effect types for PuffPop
 */
export type PuffPopEffect =
  | 'scale' // Scale from center (점에서 커지면서 나타남)
  | 'rotate' // Rotate while appearing (회전하면서 나타남)
  | 'fade' // Simple fade in
  | 'slideUp' // Slide from bottom
  | 'slideDown' // Slide from top
  | 'slideLeft' // Slide from right
  | 'slideRight' // Slide from left
  | 'bounce' // Bounce effect with overshoot
  | 'flip' // 3D flip effect
  | 'zoom' // Zoom with slight overshoot
  | 'rotateScale'; // Rotate + Scale combined

/**
 * Easing function types
 */
export type PuffPopEasing =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'spring'
  | 'bounce';

export interface PuffPopProps {
  /**
   * Children to animate
   */
  children: ReactNode;

  /**
   * Animation effect type
   * @default 'scale'
   */
  effect?: PuffPopEffect;

  /**
   * Animation duration in milliseconds
   * @default 400
   */
  duration?: number;

  /**
   * Delay before animation starts in milliseconds
   * @default 0
   */
  delay?: number;

  /**
   * Easing function for animation
   * @default 'easeOut'
   */
  easing?: PuffPopEasing;

  /**
   * If true, reserves space for children before animation (skeleton mode)
   * If false, children height starts at 0 and expands, pushing content below
   * @default true
   */
  skeleton?: boolean;

  /**
   * Whether to trigger animation (set to true to animate)
   * @default true
   */
  visible?: boolean;

  /**
   * Callback when animation completes
   */
  onAnimationComplete?: () => void;

  /**
   * Custom style for the container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Whether to animate on mount
   * @default true
   */
  animateOnMount?: boolean;

  /**
   * Loop the animation
   * - true: loop infinitely
   * - number: loop specific number of times
   * @default false
   */
  loop?: boolean | number;

  /**
   * Delay between loop iterations in milliseconds
   * @default 0
   */
  loopDelay?: number;

  /**
   * Callback when animation starts
   */
  onAnimationStart?: () => void;

  /**
   * Respect system reduce motion accessibility setting
   * When true and reduce motion is enabled, animations will be instant
   * @default true
   */
  respectReduceMotion?: boolean;

  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * Get easing function based on type
 */
function getEasing(type: PuffPopEasing): (value: number) => number {
  switch (type) {
    case 'linear':
      return Easing.linear;
    case 'easeIn':
      return Easing.in(Easing.ease);
    case 'easeOut':
      return Easing.out(Easing.ease);
    case 'easeInOut':
      return Easing.inOut(Easing.ease);
    case 'spring':
      return Easing.out(Easing.back(1.5));
    case 'bounce':
      return Easing.bounce;
    default:
      return Easing.out(Easing.ease);
  }
}

/**
 * PuffPop - Animate children with beautiful entrance effects
 */
export function PuffPop({
  children,
  effect = 'scale',
  duration = 400,
  delay = 0,
  easing = 'easeOut',
  skeleton = true,
  visible = true,
  onAnimationComplete,
  onAnimationStart,
  style,
  animateOnMount = true,
  loop = false,
  loopDelay = 0,
  respectReduceMotion = true,
  testID,
}: PuffPopProps): ReactElement {
  // Animation values
  const opacity = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const scale = useRef(new Animated.Value(animateOnMount ? getInitialScale(effect) : 1)).current;
  const rotate = useRef(new Animated.Value(animateOnMount ? getInitialRotate(effect) : 0)).current;
  const translateX = useRef(new Animated.Value(animateOnMount ? getInitialTranslateX(effect) : 0)).current;
  const translateY = useRef(new Animated.Value(animateOnMount ? getInitialTranslateY(effect) : 0)).current;
  
  // For non-skeleton mode
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);
  const loopAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reduce motion accessibility support
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    if (!respectReduceMotion) return;

    const checkReduceMotion = async () => {
      const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      setIsReduceMotionEnabled(reduceMotion);
    };

    checkReduceMotion();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      subscription.remove();
    };
  }, [respectReduceMotion]);

  // Effective duration (0 if reduce motion is enabled)
  const effectiveDuration = respectReduceMotion && isReduceMotionEnabled ? 0 : duration;

  // Memoize effect type checks to avoid repeated includes() calls
  const effectFlags = useMemo(() => ({
    hasScale: ['scale', 'bounce', 'zoom', 'rotateScale', 'flip'].includes(effect),
    hasRotate: ['rotate', 'rotateScale'].includes(effect),
    hasFlip: effect === 'flip',
    hasTranslateX: ['slideLeft', 'slideRight'].includes(effect),
    hasTranslateY: ['slideUp', 'slideDown', 'bounce'].includes(effect),
    hasRotateEffect: ['rotate', 'rotateScale', 'flip'].includes(effect),
  }), [effect]);

  // Memoize interpolations to avoid recreating on every render
  const rotateInterpolation = useMemo(() => 
    rotate.interpolate({
      inputRange: [-360, 0, 360],
      outputRange: ['-360deg', '0deg', '360deg'],
    }), [rotate]);

  const flipInterpolation = useMemo(() => 
    rotate.interpolate({
      inputRange: [-180, 0],
      outputRange: ['-180deg', '0deg'],
    }), [rotate]);

  // Handle layout measurement for non-skeleton mode
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!skeleton && measuredHeight === null) {
        const { height } = event.nativeEvent.layout;
        setMeasuredHeight(height);
      }
    },
    [skeleton, measuredHeight]
  );

  // Animate function
  const animate = useCallback(
    (toVisible: boolean) => {
      // Call onAnimationStart callback
      if (toVisible && onAnimationStart) {
        onAnimationStart();
      }

      const easingFn = getEasing(easing);
      // When skeleton is false, we animate height which doesn't support native driver
      // So we must use JS driver for all animations in that case
      const useNative = skeleton;
      const config = {
        duration: effectiveDuration,
        easing: easingFn,
        useNativeDriver: useNative,
      };

      const animations: Animated.CompositeAnimation[] = [];

      // Opacity animation
      animations.push(
        Animated.timing(opacity, {
          toValue: toVisible ? 1 : 0,
          ...config,
        })
      );

      // Scale animation
      if (effectFlags.hasScale) {
        const targetScale = toVisible ? 1 : getInitialScale(effect);
        animations.push(
          Animated.timing(scale, {
            toValue: targetScale,
            ...config,
            easing: effect === 'bounce' ? Easing.bounce : easingFn,
          })
        );
      }

      // Rotate animation
      if (effectFlags.hasRotate || effectFlags.hasFlip) {
        const targetRotate = toVisible ? 0 : getInitialRotate(effect);
        animations.push(
          Animated.timing(rotate, {
            toValue: targetRotate,
            ...config,
          })
        );
      }

      // TranslateX animation
      if (effectFlags.hasTranslateX) {
        const targetX = toVisible ? 0 : getInitialTranslateX(effect);
        animations.push(
          Animated.timing(translateX, {
            toValue: targetX,
            ...config,
          })
        );
      }

      // TranslateY animation
      if (effectFlags.hasTranslateY) {
        const targetY = toVisible ? 0 : getInitialTranslateY(effect);
        animations.push(
          Animated.timing(translateY, {
            toValue: targetY,
            ...config,
          })
        );
      }

      // Height animation for non-skeleton mode
      if (!skeleton && measuredHeight !== null) {
        const targetHeight = toVisible ? measuredHeight : 0;
        animations.push(
          Animated.timing(animatedHeight, {
            toValue: targetHeight,
            duration: effectiveDuration,
            easing: easingFn,
            useNativeDriver: false,
          })
        );
      }

      // Run animations with delay
      const parallelAnimation = Animated.parallel(animations);

      // Reset values function for looping
      const resetValues = () => {
        opacity.setValue(0);
        scale.setValue(getInitialScale(effect));
        rotate.setValue(getInitialRotate(effect));
        translateX.setValue(getInitialTranslateX(effect));
        translateY.setValue(getInitialTranslateY(effect));
        if (!skeleton && measuredHeight !== null) {
          animatedHeight.setValue(0);
        }
      };

      // Build the animation sequence
      let animation: Animated.CompositeAnimation;
      
      if (delay > 0) {
        animation = Animated.sequence([
          Animated.delay(delay),
          parallelAnimation,
        ]);
      } else {
        animation = parallelAnimation;
      }

      // Handle loop option
      if (toVisible && loop) {
        // Stop any existing loop animation
        if (loopAnimationRef.current) {
          loopAnimationRef.current.stop();
          loopAnimationRef.current = null;
        }
        // Clear any existing timeout
        if (loopTimeoutRef.current) {
          clearTimeout(loopTimeoutRef.current);
          loopTimeoutRef.current = null;
        }

        const loopCount = typeof loop === 'number' ? loop : -1;
        let currentIteration = 0;

        const runLoop = () => {
          resetValues();
          // Store the current animation reference so it can be stopped
          loopAnimationRef.current = animation;
          animation.start(({ finished }) => {
            if (finished) {
              currentIteration++;
              if (loopCount === -1 || currentIteration < loopCount) {
                // Add delay between loops if specified
                if (loopDelay > 0) {
                  // Clear any existing timeout before setting a new one
                  if (loopTimeoutRef.current) {
                    clearTimeout(loopTimeoutRef.current);
                  }
                  loopTimeoutRef.current = setTimeout(runLoop, loopDelay);
                } else {
                  runLoop();
                }
              } else {
                // Loop finished, clear reference
                loopAnimationRef.current = null;
                if (onAnimationComplete) {
                  onAnimationComplete();
                }
              }
            }
          });
        };

        // Start the loop
        runLoop();
      } else {
        // Stop any existing loop animation
        if (loopAnimationRef.current) {
          loopAnimationRef.current.stop();
          loopAnimationRef.current = null;
        }

        animation.start(() => {
          if (toVisible && onAnimationComplete) {
            onAnimationComplete();
          }
        });
      }
    },
    [
      delay,
      effectiveDuration,
      easing,
      effect,
      effectFlags,
      measuredHeight,
      onAnimationComplete,
      onAnimationStart,
      opacity,
      rotate,
      scale,
      skeleton,
      translateX,
      translateY,
      animatedHeight,
      loop,
      loopDelay,
    ]
  );

  // Handle initial mount animation
  useEffect(() => {
    if (animateOnMount && !hasAnimated.current && visible) {
      hasAnimated.current = true;
      animate(true);
    }
  }, [animate, animateOnMount, visible]);

  // Handle visibility changes after mount
  useEffect(() => {
    if (hasAnimated.current) {
      animate(visible);
    }
  }, [visible, animate]);

  // Cleanup loop animation and timeout on unmount
  useEffect(() => {
    return () => {
      if (loopAnimationRef.current) {
        loopAnimationRef.current.stop();
      }
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  // Memoize transform array to avoid recreating on every render
  // IMPORTANT: All hooks must be called before any conditional returns
  const transform = useMemo(() => {
    const { hasScale, hasRotate, hasFlip, hasTranslateX, hasTranslateY } = effectFlags;
    const transforms = [];

    if (hasScale) {
      transforms.push({ scale });
    }

    if (hasRotate) {
      transforms.push({ rotate: rotateInterpolation });
    }

    if (hasFlip) {
      transforms.push({ rotateY: flipInterpolation });
    }

    if (hasTranslateX) {
      transforms.push({ translateX });
    }

    if (hasTranslateY) {
      transforms.push({ translateY });
    }

    return transforms.length > 0 ? transforms : undefined;
  }, [effectFlags, scale, rotateInterpolation, flipInterpolation, translateX, translateY]);

  // Memoize animated style
  const animatedStyle = useMemo(() => ({
    opacity,
    transform,
  }), [opacity, transform]);

  // Memoize container style for non-skeleton mode
  const containerAnimatedStyle = useMemo(() => {
    if (!skeleton && measuredHeight !== null) {
      return { 
        height: animatedHeight, 
        overflow: effectFlags.hasRotateEffect ? 'visible' as const : 'hidden' as const 
      };
    }
    return {};
  }, [skeleton, measuredHeight, animatedHeight, effectFlags.hasRotateEffect]);

  // For non-skeleton mode, measure first (after all hooks)
  if (!skeleton && measuredHeight === null) {
    return (
      <View style={styles.measureContainer} onLayout={onLayout}>
        <View style={styles.hidden}>{children}</View>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[styles.container, style, containerAnimatedStyle]}
      testID={testID}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Animated.View>
  );
}

/**
 * Get initial scale value based on effect
 */
function getInitialScale(effect: PuffPopEffect): number {
  switch (effect) {
    case 'scale':
    case 'rotateScale':
      return 0;
    case 'bounce':
      return 0.3;
    case 'zoom':
      return 0.5;
    case 'flip':
      return 0.8;
    default:
      return 1;
  }
}

/**
 * Get initial rotate value based on effect
 */
function getInitialRotate(effect: PuffPopEffect): number {
  switch (effect) {
    case 'rotate':
      return -360;
    case 'rotateScale':
      return -180;
    case 'flip':
      return -180;
    default:
      return 0;
  }
}

/**
 * Get initial translateX value based on effect
 */
function getInitialTranslateX(effect: PuffPopEffect): number {
  switch (effect) {
    case 'slideLeft':
      return 100;
    case 'slideRight':
      return -100;
    default:
      return 0;
  }
}

/**
 * Get initial translateY value based on effect
 */
function getInitialTranslateY(effect: PuffPopEffect): number {
  switch (effect) {
    case 'slideUp':
      return 50;
    case 'slideDown':
      return -50;
    case 'bounce':
      return 30;
    default:
      return 0;
  }
}

const styles = StyleSheet.create({
  container: {},
  measureContainer: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
  hidden: {
    opacity: 0,
  },
  groupContainer: {},
});

/**
 * Props for PuffPopGroup component
 */
export interface PuffPopGroupProps {
  /**
   * Children to animate with stagger effect
   */
  children: ReactNode;

  /**
   * Animation effect type applied to all children
   * @default 'scale'
   */
  effect?: PuffPopEffect;

  /**
   * Base animation duration in milliseconds for each child
   * @default 400
   */
  duration?: number;

  /**
   * Delay between each child's animation start in milliseconds
   * @default 100
   */
  staggerDelay?: number;

  /**
   * Initial delay before the first child animates in milliseconds
   * @default 0
   */
  initialDelay?: number;

  /**
   * Easing function for all children
   * @default 'easeOut'
   */
  easing?: PuffPopEasing;

  /**
   * If true, reserves space for children before animation
   * @default true
   */
  skeleton?: boolean;

  /**
   * Whether children are visible
   * @default true
   */
  visible?: boolean;

  /**
   * Whether to animate on mount
   * @default true
   */
  animateOnMount?: boolean;

  /**
   * Callback when all children animations complete
   */
  onAnimationComplete?: () => void;

  /**
   * Callback when the first child animation starts
   */
  onAnimationStart?: () => void;

  /**
   * Custom style for the group container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Respect system reduce motion accessibility setting
   * @default true
   */
  respectReduceMotion?: boolean;

  /**
   * Test ID for testing purposes
   */
  testID?: string;

  /**
   * Direction of stagger animation
   * - 'forward': First to last child
   * - 'reverse': Last to first child
   * - 'center': From center outward
   * - 'edges': From edges toward center
   * @default 'forward'
   */
  staggerDirection?: 'forward' | 'reverse' | 'center' | 'edges';

  /**
   * If true, children are rendered in a row (horizontal layout)
   * @default false
   */
  horizontal?: boolean;

  /**
   * Gap between children (uses flexbox gap)
   */
  gap?: number;
}

/**
 * PuffPopGroup - Animate multiple children with staggered entrance effects
 * 
 * @example
 * ```tsx
 * <PuffPopGroup staggerDelay={100} effect="scale">
 *   <Card title="First" />
 *   <Card title="Second" />
 *   <Card title="Third" />
 * </PuffPopGroup>
 * ```
 */
export function PuffPopGroup({
  children,
  effect = 'scale',
  duration = 400,
  staggerDelay = 100,
  initialDelay = 0,
  easing = 'easeOut',
  skeleton = true,
  visible = true,
  animateOnMount = true,
  onAnimationComplete,
  onAnimationStart,
  style,
  respectReduceMotion = true,
  testID,
  staggerDirection = 'forward',
  horizontal = false,
  gap,
}: PuffPopGroupProps): ReactElement {
  const childArray = Children.toArray(children);
  const childCount = childArray.length;
  const completedCount = useRef(0);
  const hasCalledStart = useRef(false);

  // Calculate delay for each child based on stagger direction
  const getChildDelay = useCallback(
    (index: number): number => {
      let delayIndex: number;

      switch (staggerDirection) {
        case 'reverse':
          delayIndex = childCount - 1 - index;
          break;
        case 'center': {
          const center = (childCount - 1) / 2;
          delayIndex = Math.abs(index - center);
          break;
        }
        case 'edges': {
          const center = (childCount - 1) / 2;
          delayIndex = center - Math.abs(index - center);
          break;
        }
        case 'forward':
        default:
          delayIndex = index;
          break;
      }

      return initialDelay + delayIndex * staggerDelay;
    },
    [childCount, initialDelay, staggerDelay, staggerDirection]
  );

  // Handle individual child animation complete
  const handleChildComplete = useCallback(() => {
    completedCount.current += 1;
    if (completedCount.current >= childCount && onAnimationComplete) {
      onAnimationComplete();
    }
  }, [childCount, onAnimationComplete]);

  // Handle first child animation start
  const handleChildStart = useCallback(() => {
    if (!hasCalledStart.current && onAnimationStart) {
      hasCalledStart.current = true;
      onAnimationStart();
    }
  }, [onAnimationStart]);

  // Reset counters when visibility changes
  useEffect(() => {
    if (visible) {
      completedCount.current = 0;
      hasCalledStart.current = false;
    }
  }, [visible]);

  const containerStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexDirection: horizontal ? 'row' : 'column',
    };
    if (gap !== undefined) {
      baseStyle.gap = gap;
    }
    return baseStyle;
  }, [horizontal, gap]);

  return (
    <View style={[styles.groupContainer, containerStyle, style]} testID={testID}>
      {childArray.map((child, index) => (
        <PuffPop
          key={index}
          effect={effect}
          duration={duration}
          delay={getChildDelay(index)}
          easing={easing}
          skeleton={skeleton}
          visible={visible}
          animateOnMount={animateOnMount}
          onAnimationComplete={handleChildComplete}
          onAnimationStart={index === 0 ? handleChildStart : undefined}
          respectReduceMotion={respectReduceMotion}
        >
          {child}
        </PuffPop>
      ))}
    </View>
  );
}

export default PuffPop;

