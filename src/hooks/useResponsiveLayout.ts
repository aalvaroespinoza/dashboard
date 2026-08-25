import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayoutInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isTablet: boolean;
  isLargeTablet: boolean; // 11" tablets (e.g. Huawei MatePad 11" with 2560x1600 or >= 1000px viewport)
  aspectRatio: number;
  navMode: 'rail' | 'bottomBar';
  contentPadding: number;
  gridColumns: number;
  cardMinWidth: number;
}

/**
 * useResponsiveLayout.ts
 * Hook universal de responsive design adaptativo para Tablets de 11" (Huawei MatePad SE / iPad Pro)
 * y soporte dinámico de rotación (Landscape 16:10 vs Portrait).
 */
export function useResponsiveLayout(): ResponsiveLayoutInfo {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isPortrait = !isLandscape;
  const maxDim = Math.max(width, height);
  const minDim = Math.min(width, height);

  // Tablet detection: min dimension >= 600px
  const isTablet = minDim >= 600;
  // Large 11" tablet detection: max dimension >= 1000px
  const isLargeTablet = maxDim >= 1000;

  const aspectRatio = width / (height || 1);

  // Navigation rail on landscape or large tablet landscape; Bottom bar on compact portrait
  const navMode: 'rail' | 'bottomBar' = isLandscape && width >= 700 ? 'rail' : 'bottomBar';

  // Content padding based on screen size
  const contentPadding = isLandscape ? (isLargeTablet ? 24 : 18) : 16;

  // Grid columns for Bento Grids
  const gridColumns = isLandscape ? (width >= 1200 ? 3 : 2) : (width >= 600 ? 2 : 1);

  // Responsive card minimum width
  const cardMinWidth = isLandscape ? (width >= 1200 ? 320 : 280) : (width >= 600 ? 260 : 220);

  return {
    width,
    height,
    isLandscape,
    isPortrait,
    isTablet,
    isLargeTablet,
    aspectRatio,
    navMode,
    contentPadding,
    gridColumns,
    cardMinWidth,
  };
}
