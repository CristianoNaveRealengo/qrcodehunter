import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { borders, colors, shadows, spacing, typography } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
        };
      case 'success':
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          borderColor: colors.warning,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          minHeight: 36,
        };
      case 'medium':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          minHeight: 44,
        };
      case 'large':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          minHeight: 52,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          minHeight: 44,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return typography.sizes.sm;
      case 'medium':
        return typography.sizes.md;
      case 'large':
        return typography.sizes.lg;
      default:
        return typography.sizes.md;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textSize = getTextSize();
  const iconSize = getIconSize();

  const buttonStyle = [
    styles.button,
    variantStyles,
    sizeStyles,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    shadows.medium,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    { fontSize: textSize },
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={colors.surface}
        />
      );
    }

    const iconElement = icon ? (
      <Icon
        name={icon}
        size={iconSize}
        color={colors.surface}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    ) : null;

    const textElement = (
      <Text style={buttonTextStyle} numberOfLines={1}>
        {title}
      </Text>
    );

    if (iconPosition === 'left') {
      return (
        <>
          {iconElement}
          {textElement}
        </>
      );
    } else {
      return (
        <>
          {textElement}
          {iconElement}
        </>
      );
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borders.radius.md,
    borderWidth: borders.width.medium,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: colors.textMuted,
    borderColor: colors.textMuted,
    opacity: 0.6,
  },
  text: {
    color: colors.surface,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default Button;