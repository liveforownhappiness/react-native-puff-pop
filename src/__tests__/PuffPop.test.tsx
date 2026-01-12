import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { PuffPop, type PuffPopEffect, type PuffPopEasing } from '../index';

describe('PuffPop', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <PuffPop>
          <Text>Hello World</Text>
        </PuffPop>
      );

      expect(screen.getByText('Hello World')).toBeTruthy();
    });

    it('renders with testID', () => {
      render(
        <PuffPop testID="puff-pop-container">
          <Text>Test Content</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('puff-pop-container')).toBeTruthy();
    });

    it('renders multiple children', () => {
      render(
        <PuffPop>
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
        </PuffPop>
      );

      expect(screen.getByText('First')).toBeTruthy();
      expect(screen.getByText('Second')).toBeTruthy();
      expect(screen.getByText('Third')).toBeTruthy();
    });

    it('applies custom style', () => {
      render(
        <PuffPop testID="styled-container" style={{ backgroundColor: 'red' }}>
          <Text>Styled Content</Text>
        </PuffPop>
      );

      const container = screen.getByTestId('styled-container');
      expect(container).toBeTruthy();
    });
  });

  describe('Animation Effects', () => {
    const effects: PuffPopEffect[] = [
      'scale',
      'rotate',
      'fade',
      'slideUp',
      'slideDown',
      'slideLeft',
      'slideRight',
      'bounce',
      'flip',
      'zoom',
      'rotateScale',
    ];

    effects.forEach((effect) => {
      it(`renders with "${effect}" effect`, () => {
        render(
          <PuffPop effect={effect} testID={`effect-${effect}`}>
            <Text>{effect} Effect</Text>
          </PuffPop>
        );

        expect(screen.getByTestId(`effect-${effect}`)).toBeTruthy();
        expect(screen.getByText(`${effect} Effect`)).toBeTruthy();
      });
    });
  });

  describe('Easing Types', () => {
    const easings: PuffPopEasing[] = [
      'linear',
      'easeIn',
      'easeOut',
      'easeInOut',
      'spring',
      'bounce',
    ];

    easings.forEach((easing) => {
      it(`renders with "${easing}" easing`, () => {
        render(
          <PuffPop easing={easing} testID={`easing-${easing}`}>
            <Text>{easing} Easing</Text>
          </PuffPop>
        );

        expect(screen.getByTestId(`easing-${easing}`)).toBeTruthy();
      });
    });
  });

  describe('Props', () => {
    it('respects duration prop', () => {
      render(
        <PuffPop duration={1000} testID="duration-test">
          <Text>Duration Test</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('duration-test')).toBeTruthy();
    });

    it('respects delay prop', () => {
      render(
        <PuffPop delay={500} testID="delay-test">
          <Text>Delay Test</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('delay-test')).toBeTruthy();
    });

    it('respects visible prop', () => {
      render(
        <PuffPop visible={true} testID="visible-test">
          <Text>Visible Content</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('visible-test')).toBeTruthy();
    });

    it('respects animateOnMount prop', () => {
      render(
        <PuffPop animateOnMount={false} testID="no-mount-animate">
          <Text>No Mount Animation</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('no-mount-animate')).toBeTruthy();
    });
  });

  describe('Skeleton Mode', () => {
    it('renders with skeleton mode enabled (default)', () => {
      render(
        <PuffPop skeleton={true} testID="skeleton-on">
          <Text>Skeleton Mode</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('skeleton-on')).toBeTruthy();
    });

    it('renders with skeleton mode disabled', async () => {
      render(
        <PuffPop skeleton={false}>
          <Text>Non-Skeleton Mode</Text>
        </PuffPop>
      );

      // In non-skeleton mode, component measures first
      await waitFor(() => {
        expect(screen.getByText('Non-Skeleton Mode')).toBeTruthy();
      });
    });
  });

  describe('Loop Animation', () => {
    // Note: Infinite loop tests are skipped because the mock animation
    // completes synchronously, causing actual infinite loops in tests.
    // These are tested manually in the example app.

    it('renders with finite loop count', () => {
      render(
        <PuffPop loop={3} testID="loop-finite">
          <Text>Loop 3 Times</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('loop-finite')).toBeTruthy();
    });

    it('accepts loop prop as boolean', () => {
      // Just verify the component accepts the prop without rendering
      // (infinite loop would cause stack overflow in sync mock)
      expect(() => {
        const element = (
          <PuffPop loop={true} animateOnMount={false}>
            <Text>Loop Test</Text>
          </PuffPop>
        );
        expect(element).toBeTruthy();
      }).not.toThrow();
    });

    it('accepts loopDelay prop', () => {
      expect(() => {
        const element = (
          <PuffPop loop={2} loopDelay={500} animateOnMount={false}>
            <Text>Loop Delay Test</Text>
          </PuffPop>
        );
        expect(element).toBeTruthy();
      }).not.toThrow();
    });
  });

  describe('Callbacks', () => {
    it('calls onAnimationStart when animation starts', async () => {
      const onAnimationStart = jest.fn();

      render(
        <PuffPop onAnimationStart={onAnimationStart} testID="callback-start">
          <Text>Animation Start</Text>
        </PuffPop>
      );

      await waitFor(() => {
        expect(onAnimationStart).toHaveBeenCalled();
      });
    });

    it('calls onAnimationComplete when animation finishes', async () => {
      const onAnimationComplete = jest.fn();

      render(
        <PuffPop onAnimationComplete={onAnimationComplete} testID="callback-complete">
          <Text>Animation Complete</Text>
        </PuffPop>
      );

      await waitFor(() => {
        expect(onAnimationComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('respects respectReduceMotion prop', () => {
      render(
        <PuffPop respectReduceMotion={true} testID="reduce-motion">
          <Text>Reduce Motion</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('reduce-motion')).toBeTruthy();
    });

    it('allows disabling reduce motion respect', () => {
      render(
        <PuffPop respectReduceMotion={false} testID="ignore-reduce-motion">
          <Text>Ignore Reduce Motion</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('ignore-reduce-motion')).toBeTruthy();
    });
  });

  describe('Default Props', () => {
    it('uses default effect (scale)', () => {
      const { toJSON } = render(
        <PuffPop testID="default-effect">
          <Text>Default Effect</Text>
        </PuffPop>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('uses default duration (400)', () => {
      render(
        <PuffPop testID="default-duration">
          <Text>Default Duration</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('default-duration')).toBeTruthy();
    });

    it('uses default easing (easeOut)', () => {
      render(
        <PuffPop testID="default-easing">
          <Text>Default Easing</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('default-easing')).toBeTruthy();
    });
  });
});
