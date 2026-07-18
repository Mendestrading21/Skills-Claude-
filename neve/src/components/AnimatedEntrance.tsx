import React, { useEffect, useMemo } from 'react';
import { Animated } from 'react-native';

export type AnimatedEntranceProps = {
  children: React.ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  /** Vertical travel distance in px. */
  from?: number;
  style?: object;
};

/** Fade + rise entrance used to make screens feel fluid on mount. */
export function AnimatedEntrance({ children, delay = 0, from = 10, style }: AnimatedEntranceProps) {
  const progress = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [from, 0] });

  return (
    <Animated.View style={[{ opacity: progress, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
