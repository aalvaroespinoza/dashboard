import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Home,
  Bus,
  Utensils,
  Film,
  Tag,
  Briefcase,
  Zap,
  Coffee,
  ShoppingBag,
} from 'lucide-react-native';
import { IOS_COLORS } from '../../../styles/theme';

export interface CategoryItem {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  iconName?: string;
}

interface CategoryBreakdownListProps {
  categories: CategoryItem[];
  onSelectCategory?: (id: string) => void;
  isDark?: boolean;
}

const getCategoryIcon = (name: string, iconName?: string) => {
  const n = (iconName || name).toLowerCase();
  if (n.includes('vivienda') || n.includes('alquiler') || n.includes('home')) return Home;
  if (n.includes('transporte') || n.includes('colectivo') || n.includes('bus')) return Bus;
  if (n.includes('comida') || n.includes('supermercado') || n.includes('food')) return Utensils;
  if (n.includes('entretenimiento') || n.includes('ocio') || n.includes('film')) return Film;
  if (n.includes('servicios') || n.includes('zap')) return Zap;
  if (n.includes('café') || n.includes('coffee')) return Coffee;
  if (n.includes('compras') || n.includes('shopping')) return ShoppingBag;
  if (n.includes('salario') || n.includes('briefcase')) return Briefcase;
  return Tag;
};

export const CategoryBreakdownList: React.FC<CategoryBreakdownListProps> = ({
  categories,
  onSelectCategory,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const formatCurrency = (val: number) => `$${val.toLocaleString('es-AR')}`;

  const defaultCategories: CategoryItem[] = [
    { id: 'cat-viv', name: 'Vivienda', amount: 450000, percentage: 40, color: IOS_COLORS.orange },
    { id: 'cat-trans', name: 'Transporte', amount: 200000, percentage: 18, color: IOS_COLORS.cyan },
    { id: 'cat-com', name: 'Comida', amount: 180000, percentage: 16, color: IOS_COLORS.yellow },
    { id: 'cat-ent', name: 'Entretenimiento', amount: 120000, percentage: 11, color: IOS_COLORS.red },
    { id: 'cat-otr', name: 'Otros', amount: 70000, percentage: 6, color: theme.text.tertiary },
  ];

  const listToRender = categories.length > 0 ? categories : defaultCategories;

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary, marginBottom: 16 }}>
        Categorías
      </Text>

      <View style={{ gap: 14 }}>
        {listToRender.map((cat) => {
          const Icon = getCategoryIcon(cat.name, cat.iconName);

          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelectCategory?.(cat.id)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              {/* Izquierda: Icono circular temático + Nombre */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: `${cat.color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} color={cat.color} />
                </View>

                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text.primary }}>
                  {cat.name}
                </Text>
              </View>

              {/* Derecha: Monto + Porcentaje */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: theme.text.primary,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatCurrency(cat.amount)}
                </Text>

                <View
                  style={{
                    minWidth: 42,
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary }}>
                    {cat.percentage}%
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
