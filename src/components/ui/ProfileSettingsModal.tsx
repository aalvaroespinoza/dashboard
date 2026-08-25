/**
 * ProfileSettingsModal.tsx
 * Modal de Perfil de Usuario y Ajustes Rápidos estilo iOS 18 Sheet.
 * Permite cambiar nombre, avatar memoji, ver métricas del sistema (RPG, Racha, Tareas)
 * y acceder a toggles rápidos de tema y sincronización iCloud.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import {
  X,
  User,
  Sparkles,
  Shield,
  CheckCircle2,
  Zap,
  Cloud,
  Moon,
  Sun,
  Settings as SettingsIcon,
  Check,
} from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useHabitsStore } from '../../features/habits/stores/useHabitsStore';
import { useTasksStore } from '../../store/useTasksStore';
import { useSyncStore } from '../../store/useSyncStore';
import { AppleEmoji } from './AppleEmoji';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';

interface ProfileSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
}

const PRESET_AVATARS = [
  '👨‍💻', '🚀', '⚡', '🧠', '🎯', '🎨',
  '🕶️', '🦾', '🦁', '🔥', '🏔️', '🪐',
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  visible,
  onClose,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    userName,
    userAvatar,
    userTitle,
    updateProfile,
    themeMode,
    toggleTheme,
    setActiveModule,
  } = useAppStore();

  const rpgProfile = useHabitsStore((state) => state.rpgProfile);
  const tasks = useTasksStore((state) => state.tasks);
  const { hasCredentials, isSyncing, triggerSync } = useSyncStore();

  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState(userAvatar);
  const [title, setTitle] = useState(userTitle);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(userName);
      setAvatar(userAvatar);
      setTitle(userTitle);
      setIsSaved(false);
    }
  }, [visible, userName, userAvatar, userTitle]);

  const completedTasksCount = tasks.filter((t) => t.is_completed).length;

  const handleSave = async () => {
    await updateProfile({
      userName: name.trim() || 'Álvaro',
      userAvatar: avatar,
      userTitle: title.trim() || 'Product Designer & Dev',
    });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 520,
            backgroundColor: theme.card,
            borderRadius: 28,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 18,
            ...createShadow('#000000', { width: 0, height: 8 }, isDark ? 0.35 : 0.08, 16),
          }}
        >
          {/* Header del Modal */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <User size={18} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} />
              <Text style={{ fontSize: 18, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                Perfil & Preferencias
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color={theme.text.secondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
            {/* 1. Vista Previa del Avatar y Nombre */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.cardSecondary,
                padding: 16,
                borderRadius: 20,
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: isDark ? 'rgba(10, 132, 255, 0.18)' : 'rgba(0, 122, 255, 0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light,
                }}
              >
                <AppleEmoji emoji={avatar} size={38} />
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Tu nombre..."
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    fontSize: 18,
                    fontFamily: IOS_FONTS.bold,
                    color: theme.text.primary,
                    padding: 0,
                  }}
                />
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Título o rol profesional..."
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    fontSize: 12,
                    fontFamily: IOS_FONTS.regular,
                    color: theme.text.secondary,
                    padding: 0,
                  }}
                />
              </View>
            </View>

            {/* 2. Selector de Avatares Preseleccionables */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Elegir Avatar
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {PRESET_AVATARS.map((av) => {
                  const isSelected = avatar === av;
                  return (
                    <Pressable
                      key={av}
                      onPress={() => setAvatar(av)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(10, 132, 255, 0.25)' : 'rgba(0, 122, 255, 0.15)')
                          : theme.cardSecondary,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected
                          ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light)
                          : theme.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppleEmoji emoji={av} size={24} />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Métricas y Logros del Usuario (RPG & Productividad) */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Estadísticas del Sistema
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* Nivel RPG */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.cardSecondary,
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 4,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Shield size={14} color={isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light} />
                    <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
                      Nivel RPG
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                    Lvl {rpgProfile.level || 1}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light }}>
                    {rpgProfile.rank_title || 'Aprendiz'}
                  </Text>
                </View>

                {/* Tareas Completadas */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.cardSecondary,
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 4,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} color={isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light} />
                    <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
                      Completadas
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, fontFamily: IOS_FONTS.bold, color: theme.text.primary, fontVariant: ['tabular-nums'] }}>
                    {completedTasksCount}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
                    Tareas totales
                  </Text>
                </View>

                {/* Racha Activa */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.cardSecondary,
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 4,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Zap size={14} color={isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light} />
                    <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
                      Racha
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, fontFamily: IOS_FONTS.bold, color: theme.text.primary, fontVariant: ['tabular-nums'] }}>
                    14 días
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light }}>
                    Fuego activo 🔥
                  </Text>
                </View>
              </View>
            </View>

            {/* 4. Atajos y Preferencias Rápidas */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Accesos Directos
              </Text>
              <View
                style={{
                  backgroundColor: theme.cardSecondary,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.border,
                  overflow: 'hidden',
                }}
              >
                {/* Switch Modo Oscuro / Claro */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {isDark ? <Moon size={16} color={APPLE_ACCENT.indigo.dark} /> : <Sun size={16} color={APPLE_ACCENT.orange.light} />}
                    <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.semibold, color: theme.text.primary }}>
                      Modo Oscuro OLED
                    </Text>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#E5E5EA', true: '#30D158' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={{ height: 1, backgroundColor: theme.border }} />

                {/* Botón Ir a Ajustes Completos */}
                <Pressable
                  onPress={() => {
                    onClose();
                    setActiveModule('settings');
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <SettingsIcon size={16} color={theme.text.secondary} />
                    <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.semibold, color: theme.text.primary }}>
                      Ajustes del Sistema & Base de Datos
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
                    Abrir →
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Botón Guardar */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              backgroundColor: isSaved ? '#34C759' : (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light),
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              marginTop: 4,
            })}
          >
            {isSaved ? (
              <>
                <Check size={18} color="#FFFFFF" strokeWidth={3} />
                <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: '#FFFFFF' }}>
                  Guardado
                </Text>
              </>
            ) : (
              <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: '#FFFFFF' }}>
                Guardar Cambios
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
