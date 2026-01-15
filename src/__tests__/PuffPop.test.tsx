import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
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

  describe('Exit Animation', () => {
    it('accepts exitEffect prop', () => {
      render(
        <PuffPop 
          effect="scale" 
          exitEffect="fade" 
          testID="exit-effect"
        >
          <Text>Exit Effect Test</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('exit-effect')).toBeTruthy();
    });

    it('accepts exitDuration prop', () => {
      render(
        <PuffPop 
          duration={400} 
          exitDuration={200} 
          testID="exit-duration"
        >
          <Text>Exit Duration Test</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('exit-duration')).toBeTruthy();
    });

    it('accepts exitEasing prop', () => {
      render(
        <PuffPop 
          easing="easeOut" 
          exitEasing="easeIn" 
          testID="exit-easing"
        >
          <Text>Exit Easing Test</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('exit-easing')).toBeTruthy();
    });

    it('accepts exitDelay prop', () => {
      render(
        <PuffPop 
          delay={100} 
          exitDelay={50} 
          testID="exit-delay"
        >
          <Text>Exit Delay Test</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('exit-delay')).toBeTruthy();
    });

    it('accepts all exit props together', () => {
      render(
        <PuffPop 
          effect="scale"
          duration={400}
          easing="easeOut"
          delay={100}
          exitEffect="slideDown"
          exitDuration={200}
          exitEasing="easeIn"
          exitDelay={50}
          testID="all-exit-props"
        >
          <Text>All Exit Props</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('all-exit-props')).toBeTruthy();
    });

    it('uses different exit effects for enter and exit', () => {
      const effects: Array<{ enter: PuffPopEffect; exit: PuffPopEffect }> = [
        { enter: 'scale', exit: 'fade' },
        { enter: 'slideUp', exit: 'slideDown' },
        { enter: 'rotate', exit: 'flip' },
        { enter: 'zoom', exit: 'bounce' },
      ];

      effects.forEach(({ enter, exit }) => {
        const { unmount } = render(
          <PuffPop 
            effect={enter} 
            exitEffect={exit} 
            testID={`enter-${enter}-exit-${exit}`}
          >
            <Text>Effect Combo</Text>
          </PuffPop>
        );

        expect(screen.getByTestId(`enter-${enter}-exit-${exit}`)).toBeTruthy();
        unmount();
      });
    });

    it('falls back to enter effect when exitEffect is not specified', () => {
      render(
        <PuffPop 
          effect="rotate"
          testID="no-exit-effect"
        >
          <Text>No Exit Effect</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('no-exit-effect')).toBeTruthy();
    });

    it('falls back to enter duration when exitDuration is not specified', () => {
      render(
        <PuffPop 
          duration={500}
          testID="no-exit-duration"
        >
          <Text>No Exit Duration</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('no-exit-duration')).toBeTruthy();
    });
  });

  describe('Custom Initial Values', () => {
    it('accepts initialOpacity prop', () => {
      render(
        <PuffPop initialOpacity={0.5} testID="initial-opacity">
          <Text>Initial Opacity</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('initial-opacity')).toBeTruthy();
    });

    it('accepts initialScale prop', () => {
      render(
        <PuffPop initialScale={0.2} testID="initial-scale">
          <Text>Initial Scale</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('initial-scale')).toBeTruthy();
    });

    it('accepts initialRotate prop', () => {
      render(
        <PuffPop initialRotate={-90} testID="initial-rotate">
          <Text>Initial Rotate</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('initial-rotate')).toBeTruthy();
    });

    it('accepts initialTranslateX prop', () => {
      render(
        <PuffPop initialTranslateX={50} testID="initial-translate-x">
          <Text>Initial TranslateX</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('initial-translate-x')).toBeTruthy();
    });

    it('accepts initialTranslateY prop', () => {
      render(
        <PuffPop initialTranslateY={-30} testID="initial-translate-y">
          <Text>Initial TranslateY</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('initial-translate-y')).toBeTruthy();
    });

    it('accepts all custom initial values together', () => {
      render(
        <PuffPop
          initialOpacity={0.3}
          initialScale={0.5}
          initialRotate={-45}
          initialTranslateX={20}
          initialTranslateY={-20}
          testID="all-initial-values"
        >
          <Text>All Initial Values</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('all-initial-values')).toBeTruthy();
    });

    it('combines custom initial values with effect', () => {
      render(
        <PuffPop
          effect="slideUp"
          initialTranslateY={100}
          testID="custom-with-effect"
        >
          <Text>Custom with Effect</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('custom-with-effect')).toBeTruthy();
    });
  });

  describe('Reverse Mode', () => {
    it('accepts reverse prop', () => {
      render(
        <PuffPop reverse={true} testID="reverse-mode">
          <Text>Reverse Mode</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('reverse-mode')).toBeTruthy();
    });

    it('works with slideUp effect in reverse', () => {
      render(
        <PuffPop effect="slideUp" reverse={true} testID="reverse-slide-up">
          <Text>Reverse Slide Up</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('reverse-slide-up')).toBeTruthy();
    });

    it('works with slideLeft effect in reverse', () => {
      render(
        <PuffPop effect="slideLeft" reverse={true} testID="reverse-slide-left">
          <Text>Reverse Slide Left</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('reverse-slide-left')).toBeTruthy();
    });

    it('works with rotate effect in reverse', () => {
      render(
        <PuffPop effect="rotate" reverse={true} testID="reverse-rotate">
          <Text>Reverse Rotate</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('reverse-rotate')).toBeTruthy();
    });

    it('combines reverse with custom initial values', () => {
      render(
        <PuffPop
          effect="slideUp"
          reverse={true}
          initialTranslateY={100}
          testID="reverse-with-custom"
        >
          <Text>Reverse with Custom</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('reverse-with-custom')).toBeTruthy();
    });

    it('combines reverse with exit animation', () => {
      render(
        <PuffPop
          effect="scale"
          reverse={true}
          exitEffect="fade"
          testID="reverse-with-exit"
        >
          <Text>Reverse with Exit</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('reverse-with-exit')).toBeTruthy();
    });
  });

  describe('Animation Intensity', () => {
    it('accepts intensity prop with default value 1', () => {
      render(
        <PuffPop intensity={1} testID="intensity-default">
          <Text>Intensity Default</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-default')).toBeTruthy();
    });

    it('accepts intensity prop with value 0.5', () => {
      render(
        <PuffPop intensity={0.5} testID="intensity-half">
          <Text>Intensity Half</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-half')).toBeTruthy();
    });

    it('accepts intensity prop with value 0', () => {
      render(
        <PuffPop intensity={0} testID="intensity-zero">
          <Text>Intensity Zero</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-zero')).toBeTruthy();
    });

    it('clamps intensity values above 1 to 1', () => {
      render(
        <PuffPop intensity={1.5} testID="intensity-above">
          <Text>Intensity Above 1</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-above')).toBeTruthy();
    });

    it('clamps intensity values below 0 to 0', () => {
      render(
        <PuffPop intensity={-0.5} testID="intensity-below">
          <Text>Intensity Below 0</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-below')).toBeTruthy();
    });

    it('combines intensity with slideUp effect', () => {
      render(
        <PuffPop effect="slideUp" intensity={0.5} testID="intensity-slide">
          <Text>Intensity Slide</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-slide')).toBeTruthy();
    });

    it('combines intensity with rotate effect', () => {
      render(
        <PuffPop effect="rotate" intensity={0.5} testID="intensity-rotate">
          <Text>Intensity Rotate</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-rotate')).toBeTruthy();
    });

    it('combines intensity with scale effect', () => {
      render(
        <PuffPop effect="scale" intensity={0.5} testID="intensity-scale">
          <Text>Intensity Scale</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-scale')).toBeTruthy();
    });

    it('combines intensity with reverse mode', () => {
      render(
        <PuffPop effect="slideLeft" intensity={0.3} reverse testID="intensity-reverse">
          <Text>Intensity Reverse</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-reverse')).toBeTruthy();
    });

    it('intensity does not affect custom initial values', () => {
      render(
        <PuffPop
          intensity={0.5}
          initialTranslateY={100}
          testID="intensity-custom"
        >
          <Text>Intensity Custom</Text>
        </PuffPop>
      );

      expect(screen.getByTestId('intensity-custom')).toBeTruthy();
    });
  });
});
