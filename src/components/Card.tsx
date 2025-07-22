import React from 'react';
import {
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { borders, colors, shadows, spacing } from '../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  borderRadius?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'medium',
  shadow = 'medium',
  backgroundColor = colors.surface,
  borderRadius = borders.radius.md,
}) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return { padding: spacing.sm };
      case 'medium':
        return { padding: spacing.lg };
      case 'large':
        return { padding: spacing.xl };
      default:
        return { padding: spacing.lg };
    }
  };

  const getShadowStyles = () => {
    switch (shadow) {
      case 'none':
        return {};
      case 'small':
        return shadows.small;
      case 'medium':
        return shadows.medium;
      case 'large':
        return shadows.large;
      default:
        return shadows.medium;
    }
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor,
      borderRadius,
    },
    getPaddingStyles(),
    getShadowStyles(),
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
  },
});

export default Card;