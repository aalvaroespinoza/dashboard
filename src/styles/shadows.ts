import { Platform, ViewStyle } from 'react-native';

/**
 * Helper multiplataforma para generar sombras sin warnings de deprecación en React Native Web.
 * En Web usa 'boxShadow' estándar CSS.
 * En iOS / Android usa las propiedades nativas shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation.
 */
export function createShadow(
  color: string = '#000000',
  offset: { width: number; height: number } = { width: 0, height: 2 },
  opacity: number = 0.1,
  radius: number = 4,
  elevation: number = 2
): ViewStyle {
  if (Platform.OS === 'web') {
    // Si el color es hex corto o largo, lo aplicamos con opacidad si es necesario
    let shadowColorCss = color;
    if (color.startsWith('#') && color.length === 7 && opacity < 1) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      shadowColorCss = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else if (color === '#000' || color === '#000000') {
      shadowColorCss = `rgba(0, 0, 0, ${opacity})`;
    }

    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px ${shadowColorCss}`,
    } as any;
  }

  if (Platform.OS === 'android') {
    // En Android / HarmonyOS, sombras con elevation > 3 saturan el GPU pipeline.
    // Limitamos la elevación a valores ligeros (máx 2) para fluidez de 60fps constante.
    return {
      elevation: Math.min(2, Math.max(0, elevation)),
    };
  }

  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}
