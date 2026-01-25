import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
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
  | 'rotateScale' // Rotate + Scale combined
  | 'shake' // Shake left-right (흔들림 효과)
  | 'pulse' // Pulse scale effect (맥박처럼 커졌다 작아짐)
  | 'swing' // Swing like pendulum (시계추처럼 흔들림)
  | 'wobble' // Wobble with tilt (기울어지며 이동)
  | 'elastic'; // Elastic stretch effect (탄성 효과)

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

/**
 * Anchor point for scale/rotate transformations
 * Determines the origin point of the transformation
 */
export type PuffPopAnchorPoint =
  | 'center' // Default center point
  | 'top' // Top center
  | 'bottom' // Bottom center
  | 'left' // Left center
  | 'right' // Right center
  | 'topLeft' // Top left corner
  | 'topRight' // Top right corner
  | 'bottomLeft' // Bottom left corner
  | 'bottomRight'; // Bottom right corner

/**
 * Spring animation configuration
 * Used when useSpring is true for physics-based animations
 */
export interface PuffPopSpringConfig {
  /**
   * Controls the spring stiffness. Higher values = faster, snappier animation
   * @default 100
   */
  tension?: number;

  /**
   * Controls the spring damping. Higher values = less oscillation
   * @default 10
   */
  friction?: number;

  /**
   * Animation speed multiplier
   * @default 12
   */
  speed?: number;

  /**
   * Controls the bounciness. Higher values = more bouncy
   * @default 8
   */
  bounciness?: number;
}

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

  // ============ Exit Animation Settings ============

  /**
   * Animation effect type when hiding (exit animation)
   * If not specified, uses the reverse of the enter effect
   */
  exitEffect?: PuffPopEffect;

  /**
   * Animation duration for exit animation in milliseconds
   * If not specified, uses the same duration as enter animation
   */
  exitDuration?: number;

  /**
   * Easing function for exit animation
   * If not specified, uses the same easing as enter animation
   */
  exitEasing?: PuffPopEasing;

  /**
   * Delay before exit animation starts in milliseconds
   * @default 0
   */
  exitDelay?: number;

  // ============ Custom Initial Values ============

  /**
   * Custom initial opacity value (0-1)
   * Overrides the default initial opacity for the effect
   */
  initialOpacity?: number;

  /**
   * Custom initial scale value
   * Overrides the default initial scale for effects like 'scale', 'zoom', 'bounce'
   */
  initialScale?: number;

  /**
   * Custom initial rotation value in degrees
   * Overrides the default initial rotation for effects like 'rotate', 'rotateScale'
   */
  initialRotate?: number;

  /**
   * Custom initial translateX value in pixels
   * Overrides the default initial translateX for effects like 'slideLeft', 'slideRight'
   */
  initialTranslateX?: number;

  /**
   * Custom initial translateY value in pixels
   * Overrides the default initial translateY for effects like 'slideUp', 'slideDown'
   */
  initialTranslateY?: number;

  // ============ Reverse Mode ============

  /**
   * If true, reverses the animation direction
   * - slideUp becomes slide from top
   * - slideLeft becomes slide from left
   * - rotate spins clockwise instead of counter-clockwise
   * @default false
   */
  reverse?: boolean;

  // ============ Animation Intensity ============

  /**
   * Animation intensity multiplier (0-1)
   * Controls how far/much elements move during animation
   * - 1 = full animation (default)
   * - 0.5 = half the movement distance
   * - 0 = no movement (instant appear)
   * @default 1
   */
  intensity?: number;

  // ============ Anchor Point ============

  /**
   * Anchor point for scale/rotate transformations
   * Determines the origin point of the transformation
   * - 'center' = default center point
   * - 'top', 'bottom', 'left', 'right' = edge centers
   * - 'topLeft', 'topRight', 'bottomLeft', 'bottomRight' = corners
   * @default 'center'
   */
  anchorPoint?: PuffPopAnchorPoint;

  // ============ Spring Animation ============

  /**
   * Use spring physics-based animation instead of timing
   * Provides more natural, bouncy animations
   * @default false
   */
  useSpring?: boolean;

  /**
   * Spring animation configuration
   * Only used when useSpring is true
   */
  springConfig?: PuffPopSpringConfig;
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
 * Get effect flags for any effect type
 * Returns flags indicating which transforms are needed for the effect
 */
function getEffectFlags(eff: PuffPopEffect) {
  return {
    hasScale: ['scale', 'bounce', 'zoom', 'rotateScale', 'flip', 'pulse', 'elastic'].includes(eff),
    hasRotate: ['rotate', 'rotateScale', 'swing', 'wobble'].includes(eff),
    hasFlip: eff === 'flip',
    hasTranslateX: ['slideLeft', 'slideRight', 'shake', 'wobble'].includes(eff),
    hasTranslateY: ['slideUp', 'slideDown', 'bounce'].includes(eff),
    hasRotateEffect: ['rotate', 'rotateScale', 'flip', 'swing', 'wobble'].includes(eff),
    // Special effects that need sequence animation
    isShake: eff === 'shake',
    isPulse: eff === 'pulse',
    isSwing: eff === 'swing',
    isWobble: eff === 'wobble',
    isElastic: eff === 'elastic',
  };
}

/**
 * Get anchor point offset multipliers
 * Returns { x: -1 to 1, y: -1 to 1 } where 0 is center
 */
function getAnchorPointOffset(anchorPoint: PuffPopAnchorPoint): { x: number; y: number } {
  switch (anchorPoint) {
    case 'top':
      return { x: 0, y: -0.5 };
    case 'bottom':
      return { x: 0, y: 0.5 };
    case 'left':
      return { x: -0.5, y: 0 };
    case 'right':
      return { x: 0.5, y: 0 };
    case 'topLeft':
      return { x: -0.5, y: -0.5 };
    case 'topRight':
      return { x: 0.5, y: -0.5 };
    case 'bottomLeft':
      return { x: -0.5, y: 0.5 };
    case 'bottomRight':
      return { x: 0.5, y: 0.5 };
    case 'center':
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Props comparison function for PuffPop memoization
 * Performs shallow comparison of props to prevent unnecessary re-renders
 */
function arePuffPopPropsEqual(
  prevProps: PuffPopProps,
  nextProps: PuffPopProps
): boolean {
  // Compare primitive props
  if (
    prevProps.effect !== nextProps.effect ||
    prevProps.duration !== nextProps.duration ||
    prevProps.delay !== nextProps.delay ||
    prevProps.easing !== nextProps.easing ||
    prevProps.skeleton !== nextProps.skeleton ||
    prevProps.visible !== nextProps.visible ||
    prevProps.animateOnMount !== nextProps.animateOnMount ||
    prevProps.loop !== nextProps.loop ||
    prevProps.loopDelay !== nextProps.loopDelay ||
    prevProps.respectReduceMotion !== nextProps.respectReduceMotion ||
    prevProps.testID !== nextProps.testID ||
    prevProps.reverse !== nextProps.reverse ||
    prevProps.intensity !== nextProps.intensity ||
    prevProps.anchorPoint !== nextProps.anchorPoint ||
    prevProps.useSpring !== nextProps.useSpring ||
    prevProps.exitEffect !== nextProps.exitEffect ||
    prevProps.exitDuration !== nextProps.exitDuration ||
    prevProps.exitEasing !== nextProps.exitEasing ||
    prevProps.exitDelay !== nextProps.exitDelay ||
    prevProps.initialOpacity !== nextProps.initialOpacity ||
    prevProps.initialScale !== nextProps.initialScale ||
    prevProps.initialRotate !== nextProps.initialRotate ||
    prevProps.initialTranslateX !== nextProps.initialTranslateX ||
    prevProps.initialTranslateY !== nextProps.initialTranslateY
  ) {
    return false;
  }

  // Compare springConfig object (shallow)
  if (prevProps.springConfig !== nextProps.springConfig) {
    if (
      !prevProps.springConfig ||
      !nextProps.springConfig ||
      prevProps.springConfig.tension !== nextProps.springConfig.tension ||
      prevProps.springConfig.friction !== nextProps.springConfig.friction ||
      prevProps.springConfig.speed !== nextProps.springConfig.speed ||
      prevProps.springConfig.bounciness !== nextProps.springConfig.bounciness
    ) {
      return false;
    }
  }

  // Compare callbacks (reference equality - if changed, should re-render)
  if (
    prevProps.onAnimationStart !== nextProps.onAnimationStart ||
    prevProps.onAnimationComplete !== nextProps.onAnimationComplete
  ) {
    return false;
  }

  // Style comparison - if style prop changes, re-render
  // Note: Deep comparison of style is expensive, so we use reference equality
  if (prevProps.style !== nextProps.style) {
    return false;
  }

  // Children comparison - if children change, re-render
  if (prevProps.children !== nextProps.children) {
    return false;
  }

  return true;
}

/**
 * PuffPop - Animate children with beautiful entrance effects
 */
function PuffPopComponent({
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
  // Exit animation settings
  exitEffect,
  exitDuration,
  exitEasing,
  exitDelay = 0,
  // Custom initial values
  initialOpacity,
  initialScale,
  initialRotate,
  initialTranslateX,
  initialTranslateY,
  // Reverse mode
  reverse = false,
  // Animation intensity
  intensity = 1,
  // Anchor point
  anchorPoint = 'center',
  // Spring animation
  useSpring = false,
  springConfig,
}: PuffPopProps): ReactElement {
  // Clamp intensity between 0 and 1
  const clampedIntensity = Math.max(0, Math.min(1, intensity));

  // Helper to get initial value with custom override, reverse, and intensity support
  const getInitialOpacityValue = () => initialOpacity ?? 0;
  const getInitialScaleValue = (eff: PuffPopEffect) => {
    if (initialScale !== undefined) return initialScale;
    const baseScale = getInitialScale(eff, reverse);
    // Scale goes from baseScale to 1, so we interpolate: 1 - (1 - baseScale) * intensity
    return 1 - (1 - baseScale) * clampedIntensity;
  };
  const getInitialRotateValue = (eff: PuffPopEffect) => {
    if (initialRotate !== undefined) return initialRotate;
    return getInitialRotate(eff, reverse) * clampedIntensity;
  };
  const getInitialTranslateXValue = (eff: PuffPopEffect) => {
    if (initialTranslateX !== undefined) return initialTranslateX;
    return getInitialTranslateX(eff, reverse) * clampedIntensity;
  };
  const getInitialTranslateYValue = (eff: PuffPopEffect) => {
    if (initialTranslateY !== undefined) return initialTranslateY;
    return getInitialTranslateY(eff, reverse) * clampedIntensity;
  };

  // Animation values
  const opacity = useRef(new Animated.Value(animateOnMount ? getInitialOpacityValue() : 1)).current;
  const scale = useRef(new Animated.Value(animateOnMount ? getInitialScaleValue(effect) : 1)).current;
  const rotate = useRef(new Animated.Value(animateOnMount ? getInitialRotateValue(effect) : 0)).current;
  const translateX = useRef(new Animated.Value(animateOnMount ? getInitialTranslateXValue(effect) : 0)).current;
  const translateY = useRef(new Animated.Value(animateOnMount ? getInitialTranslateYValue(effect) : 0)).current;
  
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
  const effectiveExitDuration = respectReduceMotion && isReduceMotionEnabled ? 0 : (exitDuration ?? duration);

  // Memoize effect type checks to avoid repeated includes() calls
  const effectFlags = useMemo(() => getEffectFlags(effect), [effect]);
  
  // Exit effect flags (use exitEffect if specified, otherwise same as enter effect)
  const exitEffectFlags = useMemo(() => 
    exitEffect ? getEffectFlags(exitEffect) : effectFlags
  , [exitEffect, effectFlags]);

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

      // Determine which effect settings to use based on direction
      const currentEffect = toVisible ? effect : (exitEffect ?? effect);
      const currentDuration = toVisible ? effectiveDuration : effectiveExitDuration;
      const currentEasing = toVisible ? easing : (exitEasing ?? easing);
      const currentDelay = toVisible ? delay : exitDelay;
      const currentFlags = toVisible ? effectFlags : exitEffectFlags;

      const easingFn = getEasing(currentEasing);
      // When skeleton is false, we animate height which doesn't support native driver
      // So we must use JS driver for all animations in that case
      const useNative = skeleton;
      
      // Spring configuration
      const springConf = {
        tension: springConfig?.tension ?? 100,
        friction: springConfig?.friction ?? 10,
        speed: springConfig?.speed,
        bounciness: springConfig?.bounciness,
        useNativeDriver: useNative,
      };

      const timingConfig = {
        duration: currentDuration,
        easing: easingFn,
        useNativeDriver: useNative,
      };

      // Helper to create animation (spring or timing)
      const createAnimation = (
        value: Animated.Value,
        toValue: number,
        customEasing?: (t: number) => number
      ): Animated.CompositeAnimation => {
        if (useSpring) {
          return Animated.spring(value, {
            toValue,
            ...springConf,
          });
        }
        return Animated.timing(value, {
          toValue,
          ...timingConfig,
          ...(customEasing ? { easing: customEasing } : {}),
        });
      };

      const animations: Animated.CompositeAnimation[] = [];

      // Opacity animation (always use timing for opacity for smoother fade)
      animations.push(
        Animated.timing(opacity, {
          toValue: toVisible ? 1 : 0,
          ...timingConfig,
        })
      );

      // Scale animation
      if (currentFlags.hasScale) {
        const targetScale = toVisible ? 1 : getInitialScaleValue(currentEffect);
        // Special easing for different effects
        let scaleEasing = easingFn;
        if (currentEffect === 'bounce') {
          scaleEasing = Easing.bounce;
        } else if (currentEffect === 'elastic') {
          scaleEasing = Easing.elastic(1.5);
        } else if (currentEffect === 'pulse') {
          scaleEasing = Easing.out(Easing.back(3));
        }
        animations.push(createAnimation(scale, targetScale, scaleEasing));
      }

      // Rotate animation
      if (currentFlags.hasRotate || currentFlags.hasFlip) {
        const targetRotate = toVisible ? 0 : getInitialRotateValue(currentEffect);
        // Special easing for swing and wobble
        let rotateEasing = easingFn;
        if (currentEffect === 'swing') {
          rotateEasing = Easing.elastic(1.2);
        } else if (currentEffect === 'wobble') {
          rotateEasing = Easing.elastic(1.5);
        }
        animations.push(createAnimation(rotate, targetRotate, rotateEasing));
      }

      // TranslateX animation
      if (currentFlags.hasTranslateX) {
        const targetX = toVisible ? 0 : getInitialTranslateXValue(currentEffect);
        // Special easing for shake and wobble
        let translateXEasing = easingFn;
        if (currentEffect === 'shake') {
          translateXEasing = Easing.elastic(3);
        } else if (currentEffect === 'wobble') {
          translateXEasing = Easing.elastic(1.5);
        }
        animations.push(createAnimation(translateX, targetX, translateXEasing));
      }

      // TranslateY animation
      if (currentFlags.hasTranslateY) {
        const targetY = toVisible ? 0 : getInitialTranslateYValue(currentEffect);
        animations.push(createAnimation(translateY, targetY));
      }

      // Height animation for non-skeleton mode (always use timing)
      if (!skeleton && measuredHeight !== null) {
        const targetHeight = toVisible ? measuredHeight : 0;
        animations.push(
          Animated.timing(animatedHeight, {
            toValue: targetHeight,
            duration: currentDuration,
            easing: easingFn,
            useNativeDriver: false,
          })
        );
      }

      // Run animations with delay
      const parallelAnimation = Animated.parallel(animations);

      // Reset values function for looping
      const resetValues = () => {
        opacity.setValue(getInitialOpacityValue());
        scale.setValue(getInitialScaleValue(effect));
        rotate.setValue(getInitialRotateValue(effect));
        translateX.setValue(getInitialTranslateXValue(effect));
        translateY.setValue(getInitialTranslateYValue(effect));
        if (!skeleton && measuredHeight !== null) {
          animatedHeight.setValue(0);
        }
      };

      // Build the animation sequence
      let animation: Animated.CompositeAnimation;
      
      if (currentDelay > 0) {
        animation = Animated.sequence([
          Animated.delay(currentDelay),
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
      effectiveExitDuration,
      easing,
      effect,
      effectFlags,
      exitEffect,
      exitEffectFlags,
      exitEasing,
      exitDelay,
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
      useSpring,
      springConfig,
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

  // Calculate anchor point offset (using 100px as base size for skeleton mode)
  const anchorOffset = useMemo(() => {
    const offset = getAnchorPointOffset(anchorPoint);
    // Use measured height if available, otherwise use 100px as base
    const baseSize = measuredHeight ?? 100;
    return {
      x: offset.x * baseSize,
      y: offset.y * baseSize,
    };
  }, [anchorPoint, measuredHeight]);

  // Memoize transform array to avoid recreating on every render
  // IMPORTANT: All hooks must be called before any conditional returns
  const transform = useMemo(() => {
    const { hasScale, hasRotate, hasFlip, hasTranslateX, hasTranslateY } = effectFlags;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transforms: any[] = [];
    const needsAnchorOffset = anchorPoint !== 'center' && (hasScale || hasRotate || hasFlip);

    // Step 1: Move to anchor point (negative offset)
    if (needsAnchorOffset) {
      if (anchorOffset.x !== 0) {
        transforms.push({ translateX: -anchorOffset.x });
      }
      if (anchorOffset.y !== 0) {
        transforms.push({ translateY: -anchorOffset.y });
      }
    }

    // Step 2: Apply scale/rotate transforms
    if (hasScale) {
      transforms.push({ scale });
    }

    if (hasRotate) {
      transforms.push({ rotate: rotateInterpolation });
    }

    if (hasFlip) {
      transforms.push({ rotateY: flipInterpolation });
    }

    // Step 3: Move back from anchor point (positive offset)
    if (needsAnchorOffset) {
      if (anchorOffset.x !== 0) {
        transforms.push({ translateX: anchorOffset.x });
      }
      if (anchorOffset.y !== 0) {
        transforms.push({ translateY: anchorOffset.y });
      }
    }

    // Step 4: Apply other translate transforms
    if (hasTranslateX) {
      transforms.push({ translateX });
    }

    if (hasTranslateY) {
      transforms.push({ translateY });
    }

    return transforms.length > 0 ? transforms : undefined;
  }, [effectFlags, scale, rotateInterpolation, flipInterpolation, translateX, translateY, anchorPoint, anchorOffset]);

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

// Memoize PuffPop to prevent unnecessary re-renders
export const PuffPop = memo(PuffPopComponent, arePuffPopPropsEqual);

/**
 * Get initial scale value based on effect
 */
function getInitialScale(effect: PuffPopEffect, _reverse = false): number {
  // Scale doesn't change with reverse (parameter kept for consistent API)
  switch (effect) {
    case 'scale':
    case 'rotateScale':
    case 'elastic':
      return 0;
    case 'bounce':
      return 0.3;
    case 'zoom':
      return 0.5;
    case 'flip':
      return 0.8;
    case 'pulse':
      return 0.6;
    default:
      return 1;
  }
}

/**
 * Get initial rotate value based on effect
 */
function getInitialRotate(effect: PuffPopEffect, reverse = false): number {
  const multiplier = reverse ? -1 : 1;
  switch (effect) {
    case 'rotate':
      return -360 * multiplier;
    case 'rotateScale':
      return -180 * multiplier;
    case 'flip':
      return -180 * multiplier;
    case 'swing':
      return -15 * multiplier;
    case 'wobble':
      return -5 * multiplier;
    default:
      return 0;
  }
}

/**
 * Get initial translateX value based on effect
 */
function getInitialTranslateX(effect: PuffPopEffect, reverse = false): number {
  const multiplier = reverse ? -1 : 1;
  switch (effect) {
    case 'slideLeft':
      return 100 * multiplier;
    case 'slideRight':
      return -100 * multiplier;
    case 'shake':
      return -10 * multiplier;
    case 'wobble':
      return -25 * multiplier;
    default:
      return 0;
  }
}

/**
 * Get initial translateY value based on effect
 */
function getInitialTranslateY(effect: PuffPopEffect, reverse = false): number {
  const multiplier = reverse ? -1 : 1;
  switch (effect) {
    case 'slideUp':
      return 50 * multiplier;
    case 'slideDown':
      return -50 * multiplier;
    case 'bounce':
      return 30 * multiplier;
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

  // ============ Custom Initial Values ============

  /**
   * Custom initial opacity value (0-1) for all children
   */
  initialOpacity?: number;

  /**
   * Custom initial scale value for all children
   */
  initialScale?: number;

  /**
   * Custom initial rotation value in degrees for all children
   */
  initialRotate?: number;

  /**
   * Custom initial translateX value in pixels for all children
   */
  initialTranslateX?: number;

  /**
   * Custom initial translateY value in pixels for all children
   */
  initialTranslateY?: number;

  // ============ Reverse Mode ============

  /**
   * If true, reverses the animation direction for all children
   * @default false
   */
  reverse?: boolean;

  // ============ Animation Intensity ============

  /**
   * Animation intensity multiplier (0-1) for all children
   * Controls how far/much elements move during animation
   * @default 1
   */
  intensity?: number;

  // ============ Anchor Point ============

  /**
   * Anchor point for scale/rotate transformations for all children
   * @default 'center'
   */
  anchorPoint?: PuffPopAnchorPoint;

  // ============ Spring Animation ============

  /**
   * Use spring physics-based animation for all children
   * @default false
   */
  useSpring?: boolean;

  /**
   * Spring animation configuration for all children
   */
  springConfig?: PuffPopSpringConfig;

  // ============ Exit Animation Settings ============

  /**
   * Animation effect type when hiding (exit animation) for all children
   * If not specified, uses the reverse of the enter effect
   */
  exitEffect?: PuffPopEffect;

  /**
   * Animation duration for exit animation in milliseconds for all children
   * If not specified, uses the same duration as enter animation
   */
  exitDuration?: number;

  /**
   * Easing function for exit animation for all children
   * If not specified, uses the same easing as enter animation
   */
  exitEasing?: PuffPopEasing;

  /**
   * Delay before exit animation starts in milliseconds
   * @default 0
   */
  exitDelay?: number;

  /**
   * Delay between each child's exit animation start in milliseconds
   * If not specified, all children exit simultaneously
   * @default 0
   */
  exitStaggerDelay?: number;

  /**
   * Direction of exit stagger animation
   * - 'forward': First to last child
   * - 'reverse': Last to first child (most natural for exit)
   * - 'center': From center outward
   * - 'edges': From edges toward center
   * @default 'reverse'
   */
  exitStaggerDirection?: 'forward' | 'reverse' | 'center' | 'edges';
}

/**
 * Props comparison function for PuffPopGroup memoization
 * Performs shallow comparison of props to prevent unnecessary re-renders
 */
function arePuffPopGroupPropsEqual(
  prevProps: PuffPopGroupProps,
  nextProps: PuffPopGroupProps
): boolean {
  // Compare primitive props
  if (
    prevProps.effect !== nextProps.effect ||
    prevProps.duration !== nextProps.duration ||
    prevProps.staggerDelay !== nextProps.staggerDelay ||
    prevProps.initialDelay !== nextProps.initialDelay ||
    prevProps.easing !== nextProps.easing ||
    prevProps.skeleton !== nextProps.skeleton ||
    prevProps.visible !== nextProps.visible ||
    prevProps.animateOnMount !== nextProps.animateOnMount ||
    prevProps.respectReduceMotion !== nextProps.respectReduceMotion ||
    prevProps.testID !== nextProps.testID ||
    prevProps.staggerDirection !== nextProps.staggerDirection ||
    prevProps.horizontal !== nextProps.horizontal ||
    prevProps.gap !== nextProps.gap ||
    prevProps.reverse !== nextProps.reverse ||
    prevProps.intensity !== nextProps.intensity ||
    prevProps.anchorPoint !== nextProps.anchorPoint ||
    prevProps.useSpring !== nextProps.useSpring ||
    prevProps.exitEffect !== nextProps.exitEffect ||
    prevProps.exitDuration !== nextProps.exitDuration ||
    prevProps.exitEasing !== nextProps.exitEasing ||
    prevProps.exitDelay !== nextProps.exitDelay ||
    prevProps.exitStaggerDelay !== nextProps.exitStaggerDelay ||
    prevProps.exitStaggerDirection !== nextProps.exitStaggerDirection ||
    prevProps.initialOpacity !== nextProps.initialOpacity ||
    prevProps.initialScale !== nextProps.initialScale ||
    prevProps.initialRotate !== nextProps.initialRotate ||
    prevProps.initialTranslateX !== nextProps.initialTranslateX ||
    prevProps.initialTranslateY !== nextProps.initialTranslateY
  ) {
    return false;
  }

  // Compare springConfig object (shallow)
  if (prevProps.springConfig !== nextProps.springConfig) {
    if (
      !prevProps.springConfig ||
      !nextProps.springConfig ||
      prevProps.springConfig.tension !== nextProps.springConfig.tension ||
      prevProps.springConfig.friction !== nextProps.springConfig.friction ||
      prevProps.springConfig.speed !== nextProps.springConfig.speed ||
      prevProps.springConfig.bounciness !== nextProps.springConfig.bounciness
    ) {
      return false;
    }
  }

  // Compare callbacks
  if (
    prevProps.onAnimationStart !== nextProps.onAnimationStart ||
    prevProps.onAnimationComplete !== nextProps.onAnimationComplete
  ) {
    return false;
  }

  // Style comparison
  if (prevProps.style !== nextProps.style) {
    return false;
  }

  // Children comparison - if children change, re-render
  if (prevProps.children !== nextProps.children) {
    return false;
  }

  return true;
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
function PuffPopGroupComponent({
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
  // Custom initial values
  initialOpacity,
  initialScale,
  initialRotate,
  initialTranslateX,
  initialTranslateY,
  // Reverse mode
  reverse,
  // Animation intensity
  intensity,
  // Anchor point
  anchorPoint,
  // Spring animation
  useSpring,
  springConfig,
  // Exit animation settings
  exitEffect,
  exitDuration,
  exitEasing,
  exitDelay,
  exitStaggerDelay = 0,
  exitStaggerDirection = 'reverse',
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

  // Calculate exit delay for each child based on exit stagger direction
  const getChildExitDelay = useCallback(
    (index: number): number => {
      if (exitStaggerDelay === 0) {
        return exitDelay ?? 0;
      }

      let delayIndex: number;

      switch (exitStaggerDirection) {
        case 'forward':
          delayIndex = index;
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
        case 'reverse':
        default:
          // Reverse is default for exit (last in, first out)
          delayIndex = childCount - 1 - index;
          break;
      }

      return (exitDelay ?? 0) + delayIndex * exitStaggerDelay;
    },
    [childCount, exitDelay, exitStaggerDelay, exitStaggerDirection]
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
          initialOpacity={initialOpacity}
          initialScale={initialScale}
          initialRotate={initialRotate}
          initialTranslateX={initialTranslateX}
          initialTranslateY={initialTranslateY}
          reverse={reverse}
          intensity={intensity}
          anchorPoint={anchorPoint}
          useSpring={useSpring}
          springConfig={springConfig}
          exitEffect={exitEffect}
          exitDuration={exitDuration}
          exitEasing={exitEasing}
          exitDelay={getChildExitDelay(index)}
        >
          {child}
        </PuffPop>
      ))}
    </View>
  );
}

// Memoize PuffPopGroup to prevent unnecessary re-renders
export const PuffPopGroup = memo(PuffPopGroupComponent, arePuffPopGroupPropsEqual);

export default PuffPop;

