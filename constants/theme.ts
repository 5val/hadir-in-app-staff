/**
 * Hadir-In Theme - Color Palette & Typography
 * Konsisten dengan hadir-in-web-admin untuk kesatuan ekosistem
 */

import { Platform } from 'react-native';

// ============================================
// BRAND COLORS (Sesuai dengan hadir-in-web-admin)
// ============================================
export const BrandColors = {
  // Primary Navy Blue - Main brand color
  navy: '#2D377F',           // RGB: 45, 55, 127
  navyDark: '#1E285A',       // Darker Navy
  navyLight: '#4A5499',      // Lighter Navy
  
  // Secondary Cyan - Accent & highlights
  cyan: '#4DD0E1',           // RGB: 77, 208, 225
  cyanLight: '#64E6F5',      // Lighter Cyan
  cyanDark: '#00BCD4',       // Darker Cyan
  
  // Accent Lime Green - Success states
  lime: '#9CCC65',           // RGB: 156, 204, 101
  limeLight: '#BADC80',      // Lighter Lime
  limeDark: '#7CB342',       // Darker Lime
};

// ============================================
// SEMANTIC COLORS
// ============================================
export const SemanticColors = {
  success: '#22C55E',        // Green-500
  successLight: '#86EFAC',
  successBg: '#F0FDF4',
  
  warning: '#F59E0B',        // Amber-500
  warningLight: '#FCD34D',
  warningBg: '#FFFBEB',
  
  error: '#EF4444',          // Red-500
  errorLight: '#FCA5A5',
  errorBg: '#FEF2F2',
  
  info: '#3B82F6',           // Blue-500
  infoLight: '#93C5FD',
  infoBg: '#EFF6FF',
};

// ============================================
// NEUTRAL COLORS (Slate-based)
// ============================================
export const NeutralColors = {
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  white: '#FFFFFF',
  black: '#000000',
};

// ============================================
// THEME COLORS (Light & Dark Mode)
// ============================================
export const Colors = {
  light: {
    // Base
    text: NeutralColors.slate900,
    textSecondary: NeutralColors.slate600,
    textMuted: NeutralColors.slate400,
    background: NeutralColors.white,
    backgroundSecondary: NeutralColors.slate50,
    surface: NeutralColors.white,
    surfaceHover: NeutralColors.slate50,
    
    // Brand
    primary: BrandColors.navy,
    primaryDark: BrandColors.navyDark,
    secondary: BrandColors.cyan,
    accent: BrandColors.lime,
    
    // Border & Divider
    border: NeutralColors.slate200,
    borderLight: NeutralColors.slate100,
    divider: NeutralColors.slate200,
    
    // Interactive
    tint: BrandColors.navy,
    icon: NeutralColors.slate500,
    tabIconDefault: NeutralColors.slate400,
    tabIconSelected: BrandColors.navy,
    
    // Input
    inputBackground: NeutralColors.white,
    inputBorder: NeutralColors.slate300,
    inputFocus: BrandColors.navy,
    placeholder: NeutralColors.slate400,
    
    // Card
    cardBackground: NeutralColors.white,
    cardBorder: NeutralColors.slate200,
    cardShadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    // Base
    text: NeutralColors.slate50,
    textSecondary: NeutralColors.slate300,
    textMuted: NeutralColors.slate500,
    background: NeutralColors.slate900,
    backgroundSecondary: NeutralColors.slate800,
    surface: NeutralColors.slate800,
    surfaceHover: NeutralColors.slate700,
    
    // Brand
    primary: BrandColors.cyan,
    primaryDark: BrandColors.navy,
    secondary: BrandColors.cyan,
    accent: BrandColors.lime,
    
    // Border & Divider
    border: NeutralColors.slate700,
    borderLight: NeutralColors.slate800,
    divider: NeutralColors.slate700,
    
    // Interactive
    tint: BrandColors.cyan,
    icon: NeutralColors.slate400,
    tabIconDefault: NeutralColors.slate500,
    tabIconSelected: BrandColors.cyan,
    
    // Input
    inputBackground: NeutralColors.slate800,
    inputBorder: NeutralColors.slate600,
    inputFocus: BrandColors.cyan,
    placeholder: NeutralColors.slate500,
    
    // Card
    cardBackground: NeutralColors.slate800,
    cardBorder: NeutralColors.slate700,
    cardShadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// ============================================
// GRADIENT PRESETS
// ============================================
export const Gradients = {
  primary: [BrandColors.navy, BrandColors.navyDark],
  primaryCyan: [BrandColors.navy, BrandColors.cyan],
  cyanLime: [BrandColors.cyan, BrandColors.lime],
  backgroundLight: ['#F8FAFC', '#F1F5F9', '#E0F7FA'],
  backgroundDark: [NeutralColors.slate900, NeutralColors.slate800],
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
