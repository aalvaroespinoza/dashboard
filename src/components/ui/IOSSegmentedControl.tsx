import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { IOS_SPRINGS } from '../../styles/animations';
import { IOS_COLORS } from '../../styles/theme';
import { useAppStore } from '../../store/useAppStore';

export interface SegmentTab<T extends string = string> {
  id: T;
  label: string;
  badge?: number | string;
}

export interface IOSSegmentedControlProps<T extends string = string> {
  tabs: SegmentTab<T>[];
  selectedTab: T;
  onTabChange: (tabId: T) => void;
  style?: StyleProp<ViewStyle>;
  isDark?: boolean;
}

interface TabLayout {
  x: number;
  width: number;
}

export function IOSSegmentedControl<T extends string = string>({
  tabs,
  selectedTab,
  onTabChange,
  style,
  isDark: propIsDark,
}: IOSSegmentedControlProps<T>) {
  const { themeMode } = useAppStore();
  const isDark = propIsDark !== undefined ? propIsDark : themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});

  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Almacenar el índice actual
  const selectedIndex = tabs.findIndex((t) => t.id === selectedTab);

  const handleTabLayout = (tabId: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => {
      const updated = { ...prev, [tabId]: { x, width } };
      return updated;
    });
  };

  useEffect(() => {
    const currentLayout = tabLayouts[selectedTab];
    if (currentLayout) {
      translateX.value = withSpring(currentLayout.x, IOS_SPRINGS.snappy);
      indicatorWidth.value = withSpring(currentLayout.width, IOS_SPRINGS.snappy);
      opacity.value = withSpring(1, IOS_SPRINGS.snappy);
    }
  }, [selectedTab, tabLayouts]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: indicatorWidth.value,
      opacity: opacity.value,
    };
  });

  return (
    <View
      style={[
        {
          position: 'relative',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
          borderRadius: 14,
          padding: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {/* Pastilla Deslizante Animada con Spring Motion */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 3,
            bottom: 3,
            left: 0,
            backgroundColor: isDark ? '#3A3A3C' : '#FFFFFF',
            borderRadius: 11,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1.5 },
            shadowOpacity: isDark ? 0.3 : 0.12,
            shadowRadius: 3,
            elevation: 2,
          },
          animatedPillStyle,
        ]}
      />

      {/* Botones de Tabs */}
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            onLayout={(e) => handleTabLayout(tab.id, e)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 11,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
              zIndex: 2,
            })}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: isSelected ? '700' : '500',
                color: isSelected
                  ? isDark
                    ? '#FFFFFF'
                    : '#000000'
                  : theme.text.secondary,
                textAlign: 'center',
              }}
            >
              {tab.label}
            </Text>

            {tab.badge !== undefined && (
              <View
                style={{
                  backgroundColor: isSelected
                    ? isDark
                      ? '#48484A'
                      : '#E5E5EA'
                    : isDark
                    ? '#3A3A3C'
                    : '#D1D1D6',
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: isSelected ? theme.text.primary : theme.text.secondary,
                  }}
                >
                  {tab.badge}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
