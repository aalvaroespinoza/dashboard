/**
 * ListIconRenderer.tsx
 * Renderizador unificado para íconos de listas de recordatorios.
 *
 * Soporta de forma transparente:
 * 1. Emojis de Apple (vía AppleEmoji con CDN de alta resolución)
 * 2. Identificadores de Lucide Icons (list, graduation-cap, user, shopping-cart, briefcase, etc.)
 * 3. Fallback a ícono predeterminado de lista si no se especifica
 */

import React from 'react';
import { View } from 'react-native';
import {
  List,
  GraduationCap,
  User,
  ShoppingCart,
  Folder,
  Briefcase,
  Book,
  Bookmark,
  Heart,
  Star,
  Home,
  Code,
  Dumbbell,
  Music,
  Sparkles,
  Coffee,
  Car,
  Plane,
  Smile,
  Tag,
  CheckSquare,
  Zap,
  Flame,
  DollarSign,
  Sun,
  Shield,
  Award,
} from 'lucide-react-native';
import { AppleEmoji } from './AppleEmoji';

interface ListIconRendererProps {
  icon?: string | null;
  color?: string;
  size?: number;
}

const LUCIDE_ICON_MAP: Record<string, React.ElementType> = {
  'list': List,
  'graduation-cap': GraduationCap,
  'utn': GraduationCap,
  'user': User,
  'personal': User,
  'shopping-cart': ShoppingCart,
  'shopping': ShoppingCart,
  'cart': ShoppingCart,
  'folder': Folder,
  'briefcase': Briefcase,
  'work': Briefcase,
  'book': Book,
  'study': Book,
  'bookmark': Bookmark,
  'heart': Heart,
  'star': Star,
  'home': Home,
  'code': Code,
  'dumbbell': Dumbbell,
  'fitness': Dumbbell,
  'music': Music,
  'sparkles': Sparkles,
  'coffee': Coffee,
  'car': Car,
  'plane': Plane,
  'smile': Smile,
  'tag': Tag,
  'check-square': CheckSquare,
  'zap': Zap,
  'flame': Flame,
  'dollar': DollarSign,
  'sun': Sun,
  'shield': Shield,
  'award': Award,
};

// Regex para detectar si el string contiene un emoji Unicode
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

export const ListIconRenderer: React.FC<ListIconRendererProps> = ({
  icon,
  color = '#FFFFFF',
  size = 18,
}) => {
  if (!icon) {
    return <List size={size} color={color} strokeWidth={2.5} />;
  }

  const trimmed = icon.trim();

  // 1. Si es un emoji Unicode real
  if (EMOJI_REGEX.test(trimmed)) {
    return <AppleEmoji emoji={trimmed} size={size + 2} />;
  }

  // 2. Si es una clave de Lucide Icon
  const normalizedKey = trimmed.toLowerCase();
  const IconComponent = LUCIDE_ICON_MAP[normalizedKey];

  if (IconComponent) {
    return <IconComponent size={size} color={color} strokeWidth={2.5} />;
  }

  // 3. Fallback genérico
  return <List size={size} color={color} strokeWidth={2.5} />;
};
