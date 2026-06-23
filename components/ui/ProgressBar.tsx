import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/lib/theme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 8,
  color = colors.light.primary,
  backgroundColor = colors.light.surfaceSecondary,
  showLabel = false,
  label,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{label || `${clampedProgress}%`}</Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              height,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.xs,
  },
  labelText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    fontWeight: '500',
  },
  track: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});
