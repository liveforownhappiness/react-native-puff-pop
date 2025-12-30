import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type ReactElement,
} from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Easing,
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
  style,
  animateOnMount = true,
  loop = false,
  loopDelay = 0,
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
      const easingFn = getEasing(easing);
      // When skeleton is false, we animate height which doesn't support native driver
      // So we must use JS driver for all animations in that case
      const useNative = skeleton;
      const config = {
        duration,
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
      if (['scale', 'bounce', 'zoom', 'rotateScale', 'flip'].includes(effect)) {
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
      if (['rotate', 'rotateScale', 'flip'].includes(effect)) {
        const targetRotate = toVisible ? 0 : getInitialRotate(effect);
        animations.push(
          Animated.timing(rotate, {
            toValue: targetRotate,
            ...config,
          })
        );
      }

      // TranslateX animation
      if (['slideLeft', 'slideRight'].includes(effect)) {
        const targetX = toVisible ? 0 : getInitialTranslateX(effect);
        animations.push(
          Animated.timing(translateX, {
            toValue: targetX,
            ...config,
          })
        );
      }

      // TranslateY animation
      if (['slideUp', 'slideDown', 'bounce'].includes(effect)) {
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
            duration,
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
        }

        const loopCount = typeof loop === 'number' ? loop : -1;
        let currentIteration = 0;

        const runLoop = () => {
          resetValues();
          animation.start(({ finished }) => {
            if (finished) {
              currentIteration++;
              if (loopCount === -1 || currentIteration < loopCount) {
                // Add delay between loops if specified
                if (loopDelay > 0) {
                  setTimeout(runLoop, loopDelay);
                } else {
                  runLoop();
                }
              } else if (onAnimationComplete) {
                onAnimationComplete();
              }
            }
          });
        };

        // Store reference and start
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
      duration,
      easing,
      effect,
      measuredHeight,
      onAnimationComplete,
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

  // Cleanup loop animation on unmount
  useEffect(() => {
    return () => {
      if (loopAnimationRef.current) {
        loopAnimationRef.current.stop();
      }
    };
  }, []);

  // For non-skeleton mode, measure first
  if (!skeleton && measuredHeight === null) {
    return (
      <View style={styles.measureContainer} onLayout={onLayout}>
        <View style={styles.hidden}>{children}</View>
      </View>
    );
  }

  // Build transform based on effect
  const getTransform = () => {
    const hasScale = ['scale', 'bounce', 'zoom', 'rotateScale', 'flip'].includes(effect);
    const hasRotate = ['rotate', 'rotateScale'].includes(effect);
    const hasFlip = effect === 'flip';
    const hasTranslateX = ['slideLeft', 'slideRight'].includes(effect);
    const hasTranslateY = ['slideUp', 'slideDown', 'bounce'].includes(effect);

    const transforms = [];

    if (hasScale) {
      transforms.push({ scale });
    }

    if (hasRotate) {
      transforms.push({
        rotate: rotate.interpolate({
          inputRange: [-360, 0, 360],
          outputRange: ['-360deg', '0deg', '360deg'],
        }),
      });
    }

    if (hasFlip) {
      transforms.push({
        rotateY: rotate.interpolate({
          inputRange: [-180, 0],
          outputRange: ['-180deg', '0deg'],
        }),
      });
    }

    if (hasTranslateX) {
      transforms.push({ translateX });
    }

    if (hasTranslateY) {
      transforms.push({ translateY });
    }

    return transforms.length > 0 ? transforms : undefined;
  };

  const animatedStyle = {
    opacity,
    transform: getTransform(),
  };

  // Container style for non-skeleton mode
  const containerAnimatedStyle = !skeleton && measuredHeight !== null
    ? { height: animatedHeight, overflow: 'hidden' as const }
    : {};

  return (
    <Animated.View style={[styles.container, style, containerAnimatedStyle]}>
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
});

export default PuffPop;

