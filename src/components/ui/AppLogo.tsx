import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Circle,
} from 'react-native-svg';

export interface AppLogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  showBorder?: boolean;
}

/**
 * AppLogo.tsx
 * Logotipo Vectorial de MiHub con diseño geométrico y estética Apple iOS / One UI.
 *
 * - Contenedor: Squircle de curvatura continua (rx=24 en base 100x100) con fondo obsidiana profundo (#121216 -> #181820).
 * - Borde: Ambient light gradient sutil con resplandor superior.
 * - Glifo central: "M" geométrica con curvas continuas y Núcleo Hub central con gradiente Indigo a Cyan (#5E5CE6 -> #64D2FF).
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  style,
  showBorder = true,
}) => {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          {/* Fondo Obsidiana con profundidad */}
          <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1A1A22" />
            <Stop offset="50%" stopColor="#121216" />
            <Stop offset="100%" stopColor="#0B0B0E" />
          </LinearGradient>

          {/* Borde con luz superior suave */}
          <LinearGradient id="borderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.28)" />
            <Stop offset="40%" stopColor="rgba(255, 255, 255, 0.08)" />
            <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
          </LinearGradient>

          {/* Gradiente Principal del Glifo (iOS Indigo -> Electric Cyan) */}
          <LinearGradient id="glyphGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6366F1" />
            <Stop offset="45%" stopColor="#5E5CE6" />
            <Stop offset="80%" stopColor="#0A84FF" />
            <Stop offset="100%" stopColor="#64D2FF" />
          </LinearGradient>

          {/* Gradiente Núcleo Hub */}
          <LinearGradient id="hubCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#64D2FF" />
            <Stop offset="100%" stopColor="#00F5D4" />
          </LinearGradient>

          {/* Resplandor sutil detrás del Hub */}
          <RadialGradient id="coreGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="rgba(100, 210, 255, 0.25)" />
            <Stop offset="100%" stopColor="rgba(100, 210, 255, 0)" />
          </RadialGradient>
        </Defs>

        {/* 1. Squircle Base */}
        <Rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="23"
          ry="23"
          fill="url(#bgGrad)"
          stroke={showBorder ? 'url(#borderGrad)' : 'none'}
          strokeWidth="1.5"
        />

        {/* Resplandor difuso central */}
        <Circle cx="50" cy="54" r="28" fill="url(#coreGlow)" />

        {/* 2. Glifo Geométrico "M" Continua */}
        <Path
          d="M 27 68 L 27 40 C 27 31 34.5 25.5 42 31.5 L 50 38 L 58 31.5 C 65.5 25.5 73 31 73 40 L 73 68"
          stroke="url(#glyphGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Vértice Central / Conector Hacia el Núcleo */}
        <Path
          d="M 50 38 L 50 51"
          stroke="url(#glyphGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 4. Núcleo "Hub" (Anillo Interconectado + Centro Luminous) */}
        <Circle
          cx="50"
          cy="58"
          r="9.5"
          fill="#121216"
          stroke="url(#glyphGrad)"
          strokeWidth="3.5"
        />
        <Circle
          cx="50"
          cy="58"
          r="4.5"
          fill="url(#hubCoreGrad)"
        />
      </Svg>
    </View>
  );
};
