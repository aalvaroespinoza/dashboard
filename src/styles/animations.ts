import { WithSpringConfig } from 'react-native-reanimated';

/**
 * Presets de física Spring oficiales estilo iOS (UIKit / SwiftUI)
 */
export const IOS_SPRINGS: Record<'snappy' | 'bouncy' | 'smooth' | 'interactive' | 'subtle', WithSpringConfig> = {
  /**
   * Snappy: Para botones, chips, píldoras y checkboxes. Respuesta rápida y precisa.
   */
  snappy: {
    damping: 18,
    stiffness: 220,
    mass: 0.8,
  },

  /**
   * Bouncy: Para modales, popups, diálogos y cards expansibles.
   */
  bouncy: {
    damping: 14,
    stiffness: 160,
    mass: 1,
  },

  /**
   * Smooth: Para transiciones de layout, sliders, segmented controls y carruseles.
   */
  smooth: {
    damping: 24,
    stiffness: 180,
    mass: 1,
  },

  /**
   * Interactive: Para gestos de arrastre directos con el dedo.
   */
  interactive: {
    damping: 20,
    stiffness: 300,
    mass: 0.6,
  },

  /**
   * Subtle: Para cambios de elevación o sombras muy suaves.
   */
  subtle: {
    damping: 30,
    stiffness: 200,
    mass: 1,
  },
};
