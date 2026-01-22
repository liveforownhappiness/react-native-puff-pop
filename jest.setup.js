// Mock react-native modules
jest.mock('react-native', () => {
  const React = require('react');
  
  // Create a mock Animated.Value class
  class MockAnimatedValue {
    constructor(value) {
      this._value = value;
      this._listeners = [];
    }

    setValue(value) {
      this._value = value;
    }

    interpolate(config) {
      return this;
    }

    addListener(callback) {
      this._listeners.push(callback);
      return { remove: () => {} };
    }
  }

  const Animated = {
    View: ({ children, style, testID, ...props }) => {
      const { createElement } = require('react');
      return createElement('View', { style, testID, ...props }, children);
    },
    Value: MockAnimatedValue,
    timing: (value, config) => ({
      start: (callback) => {
        if (value && typeof value.setValue === 'function') {
          value.setValue(config.toValue);
        }
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }),
    spring: (value, config) => ({
      start: (callback) => {
        if (value && typeof value.setValue === 'function') {
          value.setValue(config.toValue);
        }
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }),
    parallel: (animations) => ({
      start: (callback) => {
        animations.forEach((anim) => anim?.start?.());
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }),
    sequence: (animations) => ({
      start: (callback) => {
        animations.forEach((anim) => anim?.start?.());
        callback?.({ finished: true });
      },
      stop: jest.fn(),
    }),
    delay: () => ({
      start: (callback) => callback?.({ finished: true }),
      stop: jest.fn(),
    }),
  };

  const View = ({ children, style, testID, onLayout, ...props }) => {
    const { createElement, useEffect } = require('react');
    
    useEffect(() => {
      if (onLayout) {
        onLayout({ nativeEvent: { layout: { height: 100, width: 100, x: 0, y: 0 } } });
      }
    }, [onLayout]);
    
    return createElement('View', { style, testID, ...props }, children);
  };

  const Text = ({ children, style, ...props }) => {
    const { createElement } = require('react');
    return createElement('Text', { style, ...props }, children);
  };

  const StyleSheet = {
    create: (styles) => styles,
    flatten: (style) => {
      if (!style) return {};
      if (Array.isArray(style)) {
        return style.reduce((acc, s) => ({ ...acc, ...StyleSheet.flatten(s) }), {});
      }
      return style;
    },
  };

  const Easing = {
    linear: (t) => t,
    ease: (t) => t,
    in: (easing) => easing,
    out: (easing) => easing,
    inOut: (easing) => easing,
    back: () => (t) => t,
    bounce: (t) => t,
    elastic: () => (t) => t,
  };

  const AccessibilityInfo = {
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  };

  return {
    View,
    Text,
    Animated,
    StyleSheet,
    Easing,
    AccessibilityInfo,
    Platform: { OS: 'ios' },
  };
});
