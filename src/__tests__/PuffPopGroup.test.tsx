import { render, screen, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { PuffPopGroup, type PuffPopEffect } from '../index';

describe('PuffPopGroup', () => {
  describe('Rendering', () => {
    it('renders all children', () => {
      render(
        <PuffPopGroup>
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
        </PuffPopGroup>
      );

      expect(screen.getByText('First')).toBeTruthy();
      expect(screen.getByText('Second')).toBeTruthy();
      expect(screen.getByText('Third')).toBeTruthy();
    });

    it('renders with testID', () => {
      render(
        <PuffPopGroup testID="group-container">
          <Text>Child 1</Text>
          <Text>Child 2</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('group-container')).toBeTruthy();
    });

    it('renders empty group without error', () => {
      const { toJSON } = render(
        <PuffPopGroup testID="empty-group">
          {[]}
        </PuffPopGroup>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('renders single child', () => {
      render(
        <PuffPopGroup testID="single-child">
          <Text>Only Child</Text>
        </PuffPopGroup>
      );

      expect(screen.getByText('Only Child')).toBeTruthy();
    });
  });

  describe('Stagger Animation', () => {
    it('applies staggerDelay to children', () => {
      render(
        <PuffPopGroup staggerDelay={100} testID="stagger-group">
          <Text>Item 1</Text>
          <Text>Item 2</Text>
          <Text>Item 3</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('stagger-group')).toBeTruthy();
    });

    it('applies initialDelay before first child', () => {
      render(
        <PuffPopGroup initialDelay={500} testID="initial-delay">
          <Text>Delayed Item 1</Text>
          <Text>Delayed Item 2</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('initial-delay')).toBeTruthy();
    });
  });

  describe('Stagger Directions', () => {
    const directions = ['forward', 'reverse', 'center', 'edges'] as const;

    directions.forEach((direction) => {
      it(`renders with "${direction}" stagger direction`, () => {
        render(
          <PuffPopGroup staggerDirection={direction} testID={`direction-${direction}`}>
            <Text>Item 1</Text>
            <Text>Item 2</Text>
            <Text>Item 3</Text>
            <Text>Item 4</Text>
            <Text>Item 5</Text>
          </PuffPopGroup>
        );

        expect(screen.getByTestId(`direction-${direction}`)).toBeTruthy();
      });
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
      it(`applies "${effect}" effect to all children`, () => {
        render(
          <PuffPopGroup effect={effect} testID={`group-effect-${effect}`}>
            <Text>Effect Child 1</Text>
            <Text>Effect Child 2</Text>
          </PuffPopGroup>
        );

        expect(screen.getByTestId(`group-effect-${effect}`)).toBeTruthy();
      });
    });
  });

  describe('Layout Props', () => {
    it('renders horizontally when horizontal prop is true', () => {
      render(
        <PuffPopGroup horizontal testID="horizontal-group">
          <View><Text>H1</Text></View>
          <View><Text>H2</Text></View>
          <View><Text>H3</Text></View>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('horizontal-group')).toBeTruthy();
    });

    it('applies gap between children', () => {
      render(
        <PuffPopGroup gap={10} testID="gap-group">
          <View><Text>G1</Text></View>
          <View><Text>G2</Text></View>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('gap-group')).toBeTruthy();
    });

    it('combines horizontal and gap props', () => {
      render(
        <PuffPopGroup horizontal gap={20} testID="horizontal-gap">
          <View><Text>HG1</Text></View>
          <View><Text>HG2</Text></View>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('horizontal-gap')).toBeTruthy();
    });

    it('applies custom style to container', () => {
      render(
        <PuffPopGroup 
          style={{ padding: 10, backgroundColor: 'blue' }} 
          testID="styled-group"
        >
          <Text>Styled Child</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('styled-group')).toBeTruthy();
    });
  });

  describe('Callbacks', () => {
    it('calls onAnimationStart when first child starts animating', async () => {
      const onAnimationStart = jest.fn();

      render(
        <PuffPopGroup onAnimationStart={onAnimationStart} testID="group-start">
          <Text>Start 1</Text>
          <Text>Start 2</Text>
        </PuffPopGroup>
      );

      await waitFor(() => {
        expect(onAnimationStart).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onAnimationComplete when all children finish animating', async () => {
      const onAnimationComplete = jest.fn();

      render(
        <PuffPopGroup 
          onAnimationComplete={onAnimationComplete} 
          staggerDelay={10}
          testID="group-complete"
        >
          <Text>Complete 1</Text>
          <Text>Complete 2</Text>
        </PuffPopGroup>
      );

      await waitFor(() => {
        expect(onAnimationComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Visibility Control', () => {
    it('respects visible prop', () => {
      render(
        <PuffPopGroup visible={true} testID="visible-group">
          <Text>Visible Child</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('visible-group')).toBeTruthy();
    });

    it('respects animateOnMount prop', () => {
      render(
        <PuffPopGroup animateOnMount={false} testID="no-animate-mount">
          <Text>No Animate Child</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('no-animate-mount')).toBeTruthy();
    });
  });

  describe('Skeleton Mode', () => {
    it('applies skeleton mode to all children', () => {
      render(
        <PuffPopGroup skeleton={true} testID="skeleton-group">
          <Text>Skeleton 1</Text>
          <Text>Skeleton 2</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('skeleton-group')).toBeTruthy();
    });

    it('applies non-skeleton mode to all children', async () => {
      render(
        <PuffPopGroup skeleton={false}>
          <Text>Non-Skeleton 1</Text>
          <Text>Non-Skeleton 2</Text>
        </PuffPopGroup>
      );

      await waitFor(() => {
        expect(screen.getByText('Non-Skeleton 1')).toBeTruthy();
        expect(screen.getByText('Non-Skeleton 2')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('respects respectReduceMotion prop', () => {
      render(
        <PuffPopGroup respectReduceMotion={true} testID="reduce-motion-group">
          <Text>Reduce Motion Child</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('reduce-motion-group')).toBeTruthy();
    });
  });

  describe('Complex Scenarios', () => {
    it('handles dynamic children', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      
      render(
        <PuffPopGroup testID="dynamic-group">
          {items.map((item) => (
            <Text key={item}>Item {item}</Text>
          ))}
        </PuffPopGroup>
      );

      items.forEach((item) => {
        expect(screen.getByText(`Item ${item}`)).toBeTruthy();
      });
    });

    it('handles nested views as children', () => {
      render(
        <PuffPopGroup testID="nested-group">
          <View>
            <Text>Nested 1</Text>
            <Text>Nested 1.1</Text>
          </View>
          <View>
            <Text>Nested 2</Text>
          </View>
        </PuffPopGroup>
      );

      expect(screen.getByText('Nested 1')).toBeTruthy();
      expect(screen.getByText('Nested 1.1')).toBeTruthy();
      expect(screen.getByText('Nested 2')).toBeTruthy();
    });

    it('works with all props combined', () => {
      const onStart = jest.fn();
      const onComplete = jest.fn();

      render(
        <PuffPopGroup
          effect="slideUp"
          duration={300}
          staggerDelay={50}
          initialDelay={100}
          easing="spring"
          skeleton={true}
          visible={true}
          animateOnMount={true}
          staggerDirection="center"
          horizontal={true}
          gap={8}
          onAnimationStart={onStart}
          onAnimationComplete={onComplete}
          respectReduceMotion={true}
          style={{ margin: 10 }}
          testID="all-props-group"
        >
          <View><Text>All Props 1</Text></View>
          <View><Text>All Props 2</Text></View>
          <View><Text>All Props 3</Text></View>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('all-props-group')).toBeTruthy();
      expect(screen.getByText('All Props 1')).toBeTruthy();
      expect(screen.getByText('All Props 2')).toBeTruthy();
      expect(screen.getByText('All Props 3')).toBeTruthy();
    });
  });

  describe('Exit Animation', () => {
    it('accepts exitEffect prop', () => {
      render(
        <PuffPopGroup 
          effect="scale" 
          exitEffect="fade" 
          testID="group-exit-effect"
        >
          <Text>Exit 1</Text>
          <Text>Exit 2</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('group-exit-effect')).toBeTruthy();
    });

    it('accepts exitDuration prop', () => {
      render(
        <PuffPopGroup 
          duration={400} 
          exitDuration={200} 
          testID="group-exit-duration"
        >
          <Text>Exit Duration 1</Text>
          <Text>Exit Duration 2</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('group-exit-duration')).toBeTruthy();
    });

    it('accepts exitEasing prop', () => {
      render(
        <PuffPopGroup 
          easing="easeOut" 
          exitEasing="easeIn" 
          testID="group-exit-easing"
        >
          <Text>Exit Easing 1</Text>
          <Text>Exit Easing 2</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('group-exit-easing')).toBeTruthy();
    });

    it('accepts exitDelay prop', () => {
      render(
        <PuffPopGroup 
          exitDelay={100} 
          testID="group-exit-delay"
        >
          <Text>Exit Delay 1</Text>
          <Text>Exit Delay 2</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('group-exit-delay')).toBeTruthy();
    });

    it('accepts all exit props together', () => {
      render(
        <PuffPopGroup 
          effect="scale"
          duration={400}
          easing="easeOut"
          exitEffect="slideDown"
          exitDuration={200}
          exitEasing="easeIn"
          exitDelay={50}
          testID="group-all-exit-props"
        >
          <Text>All Exit 1</Text>
          <Text>All Exit 2</Text>
          <Text>All Exit 3</Text>
        </PuffPopGroup>
      );

      expect(screen.getByTestId('group-all-exit-props')).toBeTruthy();
      expect(screen.getByText('All Exit 1')).toBeTruthy();
      expect(screen.getByText('All Exit 2')).toBeTruthy();
      expect(screen.getByText('All Exit 3')).toBeTruthy();
    });
  });
});
