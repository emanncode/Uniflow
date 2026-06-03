import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { Theme } from '@/constants/Theme';

interface UniflowLogoProps {
  size?: number;
  showWordmark?: boolean;
  color?: string;
}

export default function UniflowLogo({
  size = 32,
  showWordmark = true,
  color = Theme.colors.brand,
}: UniflowLogoProps) {
  return (
    <View style={styles.container}>
      {/* ── icon mark ── */}
      <Svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
      >
        {/* outer U shape */}
        <Path
          d="M6 6 L6 20 Q6 28 16 28 Q26 28 26 20 L26 6"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* flow line 1 — short, left */}
        <Line
          x1="10" y1="13"
          x2="16" y2="13"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* flow line 2 — full, middle */}
        <Line
          x1="10" y1="18"
          x2="22" y2="18"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* flow dot — right end brand */}
        <Circle
          cx="25"
          cy="18"
          r="2"
          fill={color}
        />
      </Svg>

      {/* ── wordmark ── */}
      {showWordmark && (
        <View style={styles.wordmarkContainer}>
          <Text style={[styles.wordmarkText, { fontSize: size * 0.7 }]}>
            uni<Text style={{ color }}>flow</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmarkContainer: {
    marginLeft: 4,
  },
  wordmarkText: {
    fontWeight: '800',
    letterSpacing: -1,
    color: Theme.colors.textPrimary,
  },
});

