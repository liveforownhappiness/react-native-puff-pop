import { useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { PuffPop, type PuffPopEffect } from 'react-native-puff-pop';

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
      <Text style={styles.subtitle}>🎉 Entrance Animation Effects</Text>

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

      {/* All Animation Effects */}
      <Text style={styles.sectionTitle}>Animation Effects</Text>

      {EFFECTS.map((effect, index) => (
        <PuffPop
          key={`${effect}-${key}`}
          effect={effect}
          delay={index * 100}
          duration={500}
          skeleton={skeletonMode}
          easing={effect === 'bounce' ? 'bounce' : 'easeOut'}
        >
          <View style={styles.effectCard}>
            <Text style={styles.effectIcon}>{getEffectIcon(effect)}</Text>
            <View style={styles.effectInfo}>
              <Text style={styles.effectName}>{effect}</Text>
              <Text style={styles.effectDesc}>{getEffectDescription(effect)}</Text>
            </View>
          </View>
        </PuffPop>
      ))}

      {/* Staggered Animation Example */}
      <Text style={styles.sectionTitle}>Staggered Animation</Text>
      <View style={styles.staggerContainer}>
        {[0, 1, 2, 3, 4].map((i) => (
          <PuffPop
            key={`stagger-${i}-${key}`}
            effect="scale"
            delay={i * 80}
            duration={400}
            skeleton={skeletonMode}
          >
            <View style={[styles.staggerBox, { backgroundColor: getColor(i) }]}>
              <Text style={styles.staggerText}>{i + 1}</Text>
            </View>
          </PuffPop>
        ))}
      </View>

      {/* Card Example */}
      <Text style={styles.sectionTitle}>Card Example</Text>
      <PuffPop
        key={`card-${key}`}
        effect="zoom"
        delay={200}
        duration={600}
        skeleton={skeletonMode}
        easing="spring"
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✨ Welcome!</Text>
          <Text style={styles.cardText}>
            This card uses the zoom effect with spring easing for a delightful
            entrance animation. Try different effects by modifying the code!
          </Text>
          <TouchableOpacity style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </PuffPop>

      {/* Easing Types */}
      <Text style={styles.sectionTitle}>Easing Types</Text>
      <View style={styles.easingContainer}>
        {(['linear', 'easeIn', 'easeOut', 'easeInOut', 'spring', 'bounce'] as const).map(
          (easing, index) => (
            <PuffPop
              key={`easing-${easing}-${key}`}
              effect="scale"
              delay={index * 100}
              duration={600}
              skeleton={skeletonMode}
              easing={easing}
            >
              <View style={styles.easingBox}>
                <Text style={styles.easingText}>{easing}</Text>
              </View>
            </PuffPop>
          )
        )}
      </View>

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
  footer: {
    height: 60,
  },
});

