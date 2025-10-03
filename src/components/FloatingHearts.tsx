import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface FloatingHeartsProps {
  count?: number;
  duration?: number;
}

export default function FloatingHearts({ count = 15, duration = 3000 }: FloatingHeartsProps) {
  const hearts = useRef(
    Array.from({ length: count }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
      startX: Math.random() * width,
      delay: Math.random() * 1000,
      size: 20 + Math.random() * 30,
      rotation: Math.random() * 360,
    }))
  ).current;

  useEffect(() => {
    const animations = hearts.map((heart) => {
      const wobbleDistance = (Math.random() - 0.5) * 100;

      return Animated.parallel([
        Animated.timing(heart.translateY, {
          toValue: -height,
          duration: duration + Math.random() * 1000,
          delay: heart.delay,
          useNativeDriver: true,
        }),
        Animated.timing(heart.translateX, {
          toValue: wobbleDistance,
          duration: duration,
          delay: heart.delay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(heart.scale, {
            toValue: 1,
            duration: 300,
            delay: heart.delay,
            useNativeDriver: true,
          }),
          Animated.timing(heart.scale, {
            toValue: 0,
            duration: 300,
            delay: duration - 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(heart.opacity, {
          toValue: 0,
          duration: duration,
          delay: heart.delay,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(100, animations).start();
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {hearts.map((heart, index) => (
        <Animated.View
          key={index}
          style={[
            styles.heart,
            {
              left: heart.startX,
              transform: [
                { translateY: heart.translateY },
                { translateX: heart.translateX },
                { scale: heart.scale },
                { rotate: `${heart.rotation}deg` },
              ],
              opacity: heart.opacity,
            },
          ]}>
          <Ionicons name="heart" size={heart.size} color="#FF6B9D" />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  heart: {
    position: 'absolute',
    bottom: 0,
  },
});
