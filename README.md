# react-native-puff-pop 🎉

A React Native animation library for revealing children components with beautiful puff and pop effects.

Works with both **React Native CLI** and **Expo** projects - no native dependencies required!

![npm](https://img.shields.io/npm/v/react-native-puff-pop)
![license](https://img.shields.io/npm/l/react-native-puff-pop)

## Demo

<p align="center">
  <img src="./assets/demo.gif" alt="React Native PuffPop Demo" width="320" />
</p>

## Features

- 🎬 **11 Animation Effects**: scale, rotate, fade, slideUp, slideDown, slideLeft, slideRight, bounce, flip, zoom, rotateScale
- 🎯 **Exit Animations**: Different effects for enter and exit animations
- 🦴 **Skeleton Mode**: Reserve space before animation or expand from zero height
- ⚡ **Native Driver Support**: Smooth 60fps animations
- 🎯 **Easy to Use**: Just wrap your components with `<PuffPop>`
- 📱 **Cross Platform**: Works on iOS, Android, and Web
- 🔧 **TypeScript**: Full TypeScript support with type definitions

## Installation

```bash
# Using npm
npm install react-native-puff-pop

# Using yarn
yarn add react-native-puff-pop
```

## Usage

### Basic Usage

```tsx
import { PuffPop } from 'react-native-puff-pop';

function App() {
  return (
    <PuffPop>
      <View style={styles.card}>
        <Text>Hello, PuffPop!</Text>
      </View>
    </PuffPop>
  );
}
```

### With Different Effects

```tsx
// Scale from center (default)
<PuffPop effect="scale">
  <YourComponent />
</PuffPop>

// Rotate while appearing
<PuffPop effect="rotate">
  <YourComponent />
</PuffPop>

// Rotate + Scale combined
<PuffPop effect="rotateScale" easing="spring">
  <YourComponent />
</PuffPop>

// Bounce effect
<PuffPop effect="bounce" duration={600}>
  <YourComponent />
</PuffPop>

// Slide from bottom
<PuffPop effect="slideUp">
  <YourComponent />
</PuffPop>

// 3D Flip effect
<PuffPop effect="flip">
  <YourComponent />
</PuffPop>
```

### Skeleton Mode

By default, `skeleton={true}` reserves space for the component before animation:

```tsx
// Reserves space (default)
<PuffPop skeleton={true}>
  <YourComponent />
</PuffPop>

// Expands from zero height, pushing content below
<PuffPop skeleton={false}>
  <YourComponent />
</PuffPop>
```

### Staggered Animations

Use `PuffPopGroup` for easy staggered animations:

```tsx
import { PuffPopGroup } from 'react-native-puff-pop';

// Simple stagger
<PuffPopGroup staggerDelay={100} effect="scale">
  <Card title="First" />
  <Card title="Second" />
  <Card title="Third" />
</PuffPopGroup>

// With different directions
<PuffPopGroup staggerDelay={80} staggerDirection="reverse">
  <Item />
  <Item />
  <Item />
</PuffPopGroup>

// Horizontal layout with gap
<PuffPopGroup horizontal gap={12} effect="slideUp">
  <Avatar />
  <Avatar />
  <Avatar />
</PuffPopGroup>
```

Or use manual delays with `PuffPop`:

```tsx
<View>
  <PuffPop delay={0}>
    <Card title="First" />
  </PuffPop>
  <PuffPop delay={100}>
    <Card title="Second" />
  </PuffPop>
  <PuffPop delay={200}>
    <Card title="Third" />
  </PuffPop>
</View>
```

### Controlled Visibility

```tsx
function App() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button title="Toggle" onPress={() => setVisible(!visible)} />
      <PuffPop visible={visible} animateOnMount={false}>
        <YourComponent />
      </PuffPop>
    </>
  );
}
```

### Loop Animation

```tsx
// Loop infinitely
<PuffPop effect="rotate" loop={true}>
  <LoadingSpinner />
</PuffPop>

// Loop 3 times
<PuffPop effect="bounce" loop={3}>
  <NotificationBadge />
</PuffPop>

// Loop with delay between iterations
<PuffPop effect="scale" loop={true} loopDelay={500}>
  <PulsingDot />
</PuffPop>
```

### Exit Animation

Use different effects for enter and exit animations:

```tsx
// Scale in, fade out
<PuffPop 
  effect="scale" 
  exitEffect="fade"
  visible={isVisible}
>
  <Modal />
</PuffPop>

// Slide up to enter, slide down to exit
<PuffPop 
  effect="slideUp" 
  exitEffect="slideDown"
  exitDuration={200}
  visible={isVisible}
>
  <Toast />
</PuffPop>

// Different timing for enter and exit
<PuffPop 
  effect="zoom"
  duration={400}
  easing="spring"
  exitEffect="fade"
  exitDuration={150}
  exitEasing="easeIn"
  exitDelay={50}
  visible={isVisible}
>
  <Notification />
</PuffPop>
```

With `PuffPopGroup`:

```tsx
<PuffPopGroup
  effect="slideUp"
  exitEffect="fade"
  exitDuration={150}
  staggerDelay={50}
  visible={isVisible}
>
  <ListItem />
  <ListItem />
  <ListItem />
</PuffPopGroup>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Children to animate |
| `effect` | `PuffPopEffect` | `'scale'` | Animation effect type |
| `duration` | `number` | `400` | Animation duration in ms |
| `delay` | `number` | `0` | Delay before animation starts in ms |
| `easing` | `PuffPopEasing` | `'easeOut'` | Easing function |
| `skeleton` | `boolean` | `true` | Reserve space before animation |
| `visible` | `boolean` | `true` | Control visibility |
| `animateOnMount` | `boolean` | `true` | Animate when component mounts |
| `onAnimationStart` | `() => void` | - | Callback when animation starts |
| `onAnimationComplete` | `() => void` | - | Callback when animation completes |
| `style` | `ViewStyle` | - | Custom container style |
| `loop` | `boolean \| number` | `false` | Loop animation (true=infinite, number=times) |
| `loopDelay` | `number` | `0` | Delay between loop iterations in ms |
| `respectReduceMotion` | `boolean` | `true` | Respect system reduce motion setting |
| `testID` | `string` | - | Test ID for testing purposes |
| `exitEffect` | `PuffPopEffect` | - | Animation effect for exit (defaults to enter effect) |
| `exitDuration` | `number` | - | Duration for exit animation (defaults to duration) |
| `exitEasing` | `PuffPopEasing` | - | Easing for exit animation (defaults to easing) |
| `exitDelay` | `number` | `0` | Delay before exit animation starts in ms |

### PuffPopGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Children to animate with stagger effect |
| `effect` | `PuffPopEffect` | `'scale'` | Animation effect for all children |
| `duration` | `number` | `400` | Animation duration for each child in ms |
| `staggerDelay` | `number` | `100` | Delay between each child's animation in ms |
| `initialDelay` | `number` | `0` | Delay before the first child animates in ms |
| `easing` | `PuffPopEasing` | `'easeOut'` | Easing function for all children |
| `skeleton` | `boolean` | `true` | Reserve space before animation |
| `visible` | `boolean` | `true` | Control visibility of all children |
| `animateOnMount` | `boolean` | `true` | Animate when component mounts |
| `onAnimationStart` | `() => void` | - | Callback when first child starts animating |
| `onAnimationComplete` | `() => void` | - | Callback when all children complete |
| `style` | `ViewStyle` | - | Custom container style |
| `staggerDirection` | `'forward' \| 'reverse' \| 'center' \| 'edges'` | `'forward'` | Direction of stagger animation |
| `horizontal` | `boolean` | `false` | Render children in horizontal layout |
| `gap` | `number` | - | Gap between children |
| `respectReduceMotion` | `boolean` | `true` | Respect system reduce motion setting |
| `testID` | `string` | - | Test ID for testing purposes |
| `exitEffect` | `PuffPopEffect` | - | Exit animation effect for all children |
| `exitDuration` | `number` | - | Exit duration for all children |
| `exitEasing` | `PuffPopEasing` | - | Exit easing for all children |
| `exitDelay` | `number` | `0` | Exit delay for all children |

### Animation Effects (`PuffPopEffect`)

| Effect | Description |
|--------|-------------|
| `scale` | Scale from center point |
| `rotate` | Full rotation (360°) while appearing |
| `fade` | Simple fade in |
| `slideUp` | Slide from bottom |
| `slideDown` | Slide from top |
| `slideLeft` | Slide from right |
| `slideRight` | Slide from left |
| `bounce` | Bounce effect with overshoot |
| `flip` | 3D flip effect |
| `zoom` | Zoom with slight overshoot |
| `rotateScale` | Rotate + Scale combined |

### Easing Types (`PuffPopEasing`)

| Easing | Description |
|--------|-------------|
| `linear` | Linear animation |
| `easeIn` | Slow start |
| `easeOut` | Slow end |
| `easeInOut` | Slow start and end |
| `spring` | Spring-like effect |
| `bounce` | Bouncing effect |

## Skeleton Mode Explained

### `skeleton={true}` (default)
The component reserves its full space immediately, and only the visual appearance animates. This is useful when you don't want layout shifts.

### `skeleton={false}`
The component's height starts at 0 and expands during animation, pushing other content below it. This creates a more dynamic entrance effect.

## Accessibility

PuffPop respects the system's "Reduce Motion" accessibility setting by default. When users have enabled reduce motion in their device settings, animations will be instant (0 duration) to avoid discomfort.

```tsx
// Respect reduce motion setting (default)
<PuffPop respectReduceMotion={true}>
  <YourComponent />
</PuffPop>

// Ignore reduce motion setting (always animate)
<PuffPop respectReduceMotion={false}>
  <YourComponent />
</PuffPop>
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
