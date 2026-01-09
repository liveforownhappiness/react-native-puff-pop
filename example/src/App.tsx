import { useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { PuffPop, PuffPopGroup, type PuffPopEffect } from 'react-native-puff-pop';

const EFFECTS: PuffPopEffect[] = [
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

// Wrapper component for tappable replay
function TappablePuffPop({
  id,
  effect,
  delay,
  duration,
  skeleton,
  easing,
  globalKey,
  children,
  loop,
  loopDelay,
}: {
  id: string;
  effect: PuffPopEffect;
  delay?: number;
  duration?: number;
  skeleton: boolean;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring' | 'bounce';
  globalKey: number;
  children: React.ReactNode;
  loop?: boolean | number;
  loopDelay?: number;
}) {
  const [localKey, setLocalKey] = useState(0);

  const handleTap = useCallback(() => {
    setLocalKey((prev) => prev + 1);
  }, []);

  return (
    <Pressable onPress={handleTap}>
      <PuffPop
        key={`${id}-${globalKey}-${localKey}-${skeleton}`}
        effect={effect}
        delay={delay}
        duration={duration}
        skeleton={skeleton}
        easing={easing}
        loop={loop}
        loopDelay={loopDelay}
      >
        {children}
      </PuffPop>
    </Pressable>
  );
}

export default function App() {
  const [key, setKey] = useState(0);
  const [skeletonMode, setSkeletonMode] = useState(true);

  const replay = useCallback(() => {
    setKey((prev) => prev + 1);
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>React Native PuffPop</Text>
      <Text style={styles.subtitle}>🎉 Tap any item to replay!</Text>

      {/* Control Buttons */}
      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.replayButton} onPress={replay}>
          <Text style={styles.replayButtonText}>🔄 Replay All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            skeletonMode ? styles.toggleActive : styles.toggleInactive,
          ]}
          onPress={() => setSkeletonMode(!skeletonMode)}
        >
          <Text style={styles.toggleButtonText}>
            {skeletonMode ? '🦴 Skeleton: ON' : '📏 Skeleton: OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        {skeletonMode
          ? 'Space is reserved before animation'
          : 'Height expands from 0, pushing content below'}
      </Text>

      {/* Combined Effects: Rotate + Scale */}
      <Text style={styles.sectionTitle}>Combined: Rotate + Scale</Text>
      <View style={styles.combinedContainer}>
        <TappablePuffPop
          id="combined-1"
          effect="rotateScale"
          delay={0}
          duration={800}
          skeleton={skeletonMode}
          easing="spring"
          globalKey={key}
        >
          <View style={[styles.combinedBox, styles.combinedBox1]}>
            <Text style={styles.combinedIcon}>🌀</Text>
            <Text style={styles.combinedText}>Spring</Text>
          </View>
        </TappablePuffPop>

        <TappablePuffPop
          id="combined-2"
          effect="rotateScale"
          delay={150}
          duration={800}
          skeleton={skeletonMode}
          easing="easeOut"
          globalKey={key}
        >
          <View style={[styles.combinedBox, styles.combinedBox2]}>
            <Text style={styles.combinedIcon}>🎯</Text>
            <Text style={styles.combinedText}>EaseOut</Text>
          </View>
        </TappablePuffPop>

        <TappablePuffPop
          id="combined-3"
          effect="rotateScale"
          delay={300}
          duration={800}
          skeleton={skeletonMode}
          easing="bounce"
          globalKey={key}
        >
          <View style={[styles.combinedBox, styles.combinedBox3]}>
            <Text style={styles.combinedIcon}>🎪</Text>
            <Text style={styles.combinedText}>Bounce</Text>
          </View>
        </TappablePuffPop>
      </View>

      {/* All Animation Effects */}
      <Text style={styles.sectionTitle}>Animation Effects</Text>

      {EFFECTS.map((effect, index) => (
        <TappablePuffPop
          key={effect}
          id={effect}
          effect={effect}
          delay={index * 100}
          duration={500}
          skeleton={skeletonMode}
          easing={effect === 'bounce' ? 'bounce' : 'easeOut'}
          globalKey={key}
        >
          <View style={styles.effectCard}>
            <Text style={styles.effectIcon}>{getEffectIcon(effect)}</Text>
            <View style={styles.effectInfo}>
              <Text style={styles.effectName}>{effect}</Text>
              <Text style={styles.effectDesc}>{getEffectDescription(effect)}</Text>
            </View>
          </View>
        </TappablePuffPop>
      ))}

      {/* Staggered Animation Example */}
      <Text style={styles.sectionTitle}>Staggered Animation</Text>
      <View style={styles.staggerContainer}>
        {[0, 1, 2, 3, 4].map((i) => (
          <TappablePuffPop
            key={`stagger-${i}`}
            id={`stagger-${i}`}
            effect="scale"
            delay={i * 80}
            duration={400}
            skeleton={skeletonMode}
            globalKey={key}
          >
            <View style={[styles.staggerBox, { backgroundColor: getColor(i) }]}>
              <Text style={styles.staggerText}>{i + 1}</Text>
            </View>
          </TappablePuffPop>
        ))}
      </View>

      {/* Card Example */}
      <Text style={styles.sectionTitle}>Card Example</Text>
      <TappablePuffPop
        id="card"
        effect="zoom"
        delay={200}
        duration={600}
        skeleton={skeletonMode}
        easing="spring"
        globalKey={key}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✨ Welcome!</Text>
          <Text style={styles.cardText}>
            This card uses the zoom effect with spring easing for a delightful
            entrance animation. Tap to replay!
          </Text>
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Get Started</Text>
          </View>
        </View>
      </TappablePuffPop>

      {/* Loop Animation */}
      <Text style={styles.sectionTitle}>Loop Animation</Text>
      <View style={styles.loopContainer}>
        <PuffPop
          key={`loop-infinite-${key}-${skeletonMode}`}
          effect="rotate"
          duration={1000}
          skeleton={skeletonMode}
          loop={true}
        >
          <View style={[styles.loopBox, styles.loopBox1]}>
            <Text style={styles.loopIcon}>🔄</Text>
            <Text style={styles.loopText}>Infinite</Text>
          </View>
        </PuffPop>

        <PuffPop
          key={`loop-3-${key}-${skeletonMode}`}
          effect="bounce"
          duration={600}
          skeleton={skeletonMode}
          loop={3}
          loopDelay={200}
        >
          <View style={[styles.loopBox, styles.loopBox2]}>
            <Text style={styles.loopIcon}>3️⃣</Text>
            <Text style={styles.loopText}>3 times</Text>
          </View>
        </PuffPop>

        <PuffPop
          key={`loop-delay-${key}-${skeletonMode}`}
          effect="scale"
          duration={400}
          skeleton={skeletonMode}
          loop={true}
          loopDelay={800}
        >
          <View style={[styles.loopBox, styles.loopBox3]}>
            <Text style={styles.loopIcon}>⏱️</Text>
            <Text style={styles.loopText}>With Delay</Text>
          </View>
        </PuffPop>
      </View>

      {/* Easing Types */}
      <Text style={styles.sectionTitle}>Easing Types</Text>
      <View style={styles.easingContainer}>
        {(['linear', 'easeIn', 'easeOut', 'easeInOut', 'spring', 'bounce'] as const).map(
          (easing, index) => (
            <TappablePuffPop
              key={`easing-${easing}`}
              id={`easing-${easing}`}
              effect="scale"
              delay={index * 100}
              duration={600}
              skeleton={skeletonMode}
              easing={easing}
              globalKey={key}
            >
              <View style={styles.easingBox}>
                <Text style={styles.easingText}>{easing}</Text>
              </View>
            </TappablePuffPop>
          )
        )}
      </View>

      {/* PuffPopGroup Demo */}
      <Text style={styles.sectionTitle}>PuffPopGroup</Text>
      <Text style={styles.groupHint}>Auto-staggered animations for multiple children</Text>

      {/* Forward Direction */}
      <Text style={styles.groupSubtitle}>Forward (default)</Text>
      <PuffPopGroup
        key={`group-forward-${key}-${skeletonMode}`}
        staggerDelay={80}
        effect="slideUp"
        duration={400}
        skeleton={skeletonMode}
        horizontal
        gap={10}
      >
        <View style={[styles.groupBox, styles.groupBox1]}>
          <Text style={styles.groupNumber}>1</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox2]}>
          <Text style={styles.groupNumber}>2</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox3]}>
          <Text style={styles.groupNumber}>3</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox4]}>
          <Text style={styles.groupNumber}>4</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox5]}>
          <Text style={styles.groupNumber}>5</Text>
        </View>
      </PuffPopGroup>

      {/* Reverse Direction */}
      <Text style={styles.groupSubtitle}>Reverse</Text>
      <PuffPopGroup
        key={`group-reverse-${key}-${skeletonMode}`}
        staggerDelay={80}
        staggerDirection="reverse"
        effect="scale"
        duration={400}
        skeleton={skeletonMode}
        horizontal
        gap={10}
      >
        <View style={[styles.groupBox, styles.groupBox1]}>
          <Text style={styles.groupNumber}>1</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox2]}>
          <Text style={styles.groupNumber}>2</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox3]}>
          <Text style={styles.groupNumber}>3</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox4]}>
          <Text style={styles.groupNumber}>4</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox5]}>
          <Text style={styles.groupNumber}>5</Text>
        </View>
      </PuffPopGroup>

      {/* Center Direction */}
      <Text style={styles.groupSubtitle}>Center (outward)</Text>
      <PuffPopGroup
        key={`group-center-${key}-${skeletonMode}`}
        staggerDelay={100}
        staggerDirection="center"
        effect="zoom"
        duration={500}
        easing="spring"
        skeleton={skeletonMode}
        horizontal
        gap={10}
      >
        <View style={[styles.groupBox, styles.groupBox1]}>
          <Text style={styles.groupNumber}>1</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox2]}>
          <Text style={styles.groupNumber}>2</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox3]}>
          <Text style={styles.groupNumber}>3</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox4]}>
          <Text style={styles.groupNumber}>4</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox5]}>
          <Text style={styles.groupNumber}>5</Text>
        </View>
      </PuffPopGroup>

      {/* Edges Direction */}
      <Text style={styles.groupSubtitle}>Edges (inward)</Text>
      <PuffPopGroup
        key={`group-edges-${key}-${skeletonMode}`}
        staggerDelay={100}
        staggerDirection="edges"
        effect="fade"
        duration={400}
        skeleton={skeletonMode}
        horizontal
        gap={10}
      >
        <View style={[styles.groupBox, styles.groupBox1]}>
          <Text style={styles.groupNumber}>1</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox2]}>
          <Text style={styles.groupNumber}>2</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox3]}>
          <Text style={styles.groupNumber}>3</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox4]}>
          <Text style={styles.groupNumber}>4</Text>
        </View>
        <View style={[styles.groupBox, styles.groupBox5]}>
          <Text style={styles.groupNumber}>5</Text>
        </View>
      </PuffPopGroup>

      {/* Vertical Group */}
      <Text style={styles.groupSubtitle}>Vertical Layout</Text>
      <PuffPopGroup
        key={`group-vertical-${key}-${skeletonMode}`}
        staggerDelay={100}
        effect="slideLeft"
        duration={400}
        skeleton={skeletonMode}
        gap={8}
      >
        <View style={styles.groupListItem}>
          <Text style={styles.groupListIcon}>📱</Text>
          <Text style={styles.groupListText}>First Item</Text>
        </View>
        <View style={styles.groupListItem}>
          <Text style={styles.groupListIcon}>💻</Text>
          <Text style={styles.groupListText}>Second Item</Text>
        </View>
        <View style={styles.groupListItem}>
          <Text style={styles.groupListIcon}>🎮</Text>
          <Text style={styles.groupListText}>Third Item</Text>
        </View>
      </PuffPopGroup>

      <View style={styles.footer} />
    </ScrollView>
  );
}

function getEffectIcon(effect: PuffPopEffect): string {
  const icons: Record<PuffPopEffect, string> = {
    scale: '🔍',
    rotate: '🔄',
    fade: '👻',
    slideUp: '⬆️',
    slideDown: '⬇️',
    slideLeft: '⬅️',
    slideRight: '➡️',
    bounce: '🏀',
    flip: '🪙',
    zoom: '🔎',
    rotateScale: '🌀',
  };
  return icons[effect];
}

function getEffectDescription(effect: PuffPopEffect): string {
  const descriptions: Record<PuffPopEffect, string> = {
    scale: 'Scale from center point',
    rotate: '360° rotation while appearing',
    fade: 'Simple fade in effect',
    slideUp: 'Slide in from bottom',
    slideDown: 'Slide in from top',
    slideLeft: 'Slide in from right',
    slideRight: 'Slide in from left',
    bounce: 'Bouncy entrance effect',
    flip: '3D flip animation',
    zoom: 'Zoom with overshoot',
    rotateScale: 'Rotate + Scale combined',
  };
  return descriptions[effect];
}

function getColor(index: number): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  return colors[index % colors.length]!;
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  container: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  replayButton: {
    flex: 1,
    backgroundColor: '#6c5ce7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  replayButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#00b894',
  },
  toggleInactive: {
    backgroundColor: '#636e72',
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    marginTop: 20,
  },
  effectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  effectIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  effectInfo: {
    flex: 1,
  },
  effectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  effectDesc: {
    fontSize: 13,
    color: '#888',
  },
  staggerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  staggerBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staggerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6c5ce7',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: '#aaa',
    lineHeight: 24,
    marginBottom: 20,
  },
  cardButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  combinedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  combinedBox: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  combinedBox1: {
    backgroundColor: '#e056fd',
  },
  combinedBox2: {
    backgroundColor: '#686de0',
  },
  combinedBox3: {
    backgroundColor: '#30336b',
  },
  combinedIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  combinedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  loopBox: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loopBox1: {
    backgroundColor: '#00cec9',
  },
  loopBox2: {
    backgroundColor: '#fdcb6e',
  },
  loopBox3: {
    backgroundColor: '#e17055',
  },
  loopIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  loopText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  easingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  easingBox: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  easingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  groupHint: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  groupSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 12,
    marginTop: 8,
  },
  groupBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupBox1: {
    backgroundColor: '#FF6B6B',
  },
  groupBox2: {
    backgroundColor: '#4ECDC4',
  },
  groupBox3: {
    backgroundColor: '#45B7D1',
  },
  groupBox4: {
    backgroundColor: '#96CEB4',
  },
  groupBox5: {
    backgroundColor: '#FFEAA7',
  },
  groupNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  groupListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  groupListIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  groupListText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    height: 60,
  },
});
