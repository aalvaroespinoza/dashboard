import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import {
  Bell,
  Volume2,
  Cloud,
  Globe,
  Clock,
  Download,
  Trash2,
  ShieldCheck,
  Smartphone,
  X,
  AlertTriangle,
} from 'lucide-react-native';
import { useHabitsStore } from '../stores/useHabitsStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritSettingsTabProps {
  isDark?: boolean;
}

export const GritSettingsTab: React.FC<GritSettingsTabProps> = ({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { habits, logsMap, resetAllData } = useHabitsStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  const handleExport = () => {
    const data = {
      app: 'Grit Habits Clone',
      version: '5.8.1',
      exportDate: '2026-08-24T19:00:00.000Z',
      habits,
      logs: logsMap,
    };
    setExportedJson(JSON.stringify(data, null, 2));
  };

  const handleConfirmReset = async () => {
    await resetAllData();
    setIsResetConfirmOpen(false);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24, gap: 24, maxWidth: 860 }}
    >
      {/* 1. Header */}
      <View>
        <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.6 }}>
          Configuración
        </Text>
        <Text style={{ fontSize: 13, color: theme.text.secondary, marginTop: 2 }}>
          Preferencias de la aplicación y gestión de datos locales
        </Text>
      </View>

      {/* 2. Sección: Notificaciones & Táctil */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 22,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 14,
          ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 4),
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
          Preferencias Generales
        </Text>

        {/* Notificaciones */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                Recordatorios & Globos
              </Text>
              <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                Alarmas locales programadas con expo-notifications
              </Text>
            </View>
          </View>
          <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ false: theme.border, true: '#34C759' }} thumbColor="#FFFFFF" />
        </View>

        <View style={{ height: 1, backgroundColor: theme.border }} />

        {/* Sonidos Táctiles */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: IOS_COLORS.blue, alignItems: 'center', justifyContent: 'center' }}>
              <Volume2 size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                Sonidos de Completado
              </Text>
              <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                Audio chime al tildar hábitos o terminar bloques
              </Text>
            </View>
          </View>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ false: theme.border, true: '#34C759' }} thumbColor="#FFFFFF" />
        </View>

        <View style={{ height: 1, backgroundColor: theme.border }} />

        {/* Feedback Háptico */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: IOS_COLORS.purple, alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                Feedback Háptico
              </Text>
              <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                Micro-vibraciones en botones y checks
              </Text>
            </View>
          </View>
          <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} trackColor={{ false: theme.border, true: '#34C759' }} thumbColor="#FFFFFF" />
        </View>
      </View>

      {/* 3. Sección: Rutina y Región */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 22,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 14,
          ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 4),
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
          Región y Horarios
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#34C759', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} color="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
              Idioma y Formato
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.secondary }}>
            Español (Argentina)
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: theme.border }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FF9500', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                Inicio del Día
              </Text>
              <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                Hora en que se renuevan las metas diarias
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.secondary }}>
            04:00 AM
          </Text>
        </View>
      </View>

      {/* 4. Sección: Exportación y Gestión de Base de Datos */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 22,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 14,
          ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 4),
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
          Almacenamiento Local (SQLite)
        </Text>

        {/* Exportar JSON */}
        <Pressable
          onPress={handleExport}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: IOS_COLORS.blue, alignItems: 'center', justifyContent: 'center' }}>
              <Download size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                Exportar Historial para Análisis
              </Text>
              <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                Genera archivo JSON con todos los hábitos y logs
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={{ height: 1, backgroundColor: theme.border }} />

        {/* Borrar Todo */}
        <Pressable
          onPress={() => setIsResetConfirmOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 59, 48, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={16} color="#FF3B30" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FF3B30' }}>
                Restablecer Datos de Hábitos
              </Text>
              <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                Reinicia la base de datos de Grit a su estado inicial
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Modal de Confirmación de Reseteo */}
      <Modal visible={isResetConfirmOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View
            style={{
              width: '90%',
              maxWidth: 420,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
              alignItems: 'center',
            }}
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 59, 48, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} color="#FF3B30" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, textAlign: 'center' }}>
              ¿Restablecer datos de Hábitos?
            </Text>

            <Text style={{ fontSize: 13, color: theme.text.secondary, textAlign: 'center', lineHeight: 18 }}>
              Esta acción borrará los registros creados y resembrará las categorías predeterminadas de Grit al 24 de agosto de 2026.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 }}>
              <Pressable
                onPress={() => setIsResetConfirmOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.cardSecondary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmReset}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: '#FF3B30',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                  Restablecer
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Vista de Exportación JSON */}
      <Modal visible={Boolean(exportedJson)} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View
            style={{
              width: '90%',
              maxWidth: 580,
              maxHeight: '80%',
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 14,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary }}>
                Exportación JSON
              </Text>
              <Pressable onPress={() => setExportedJson(null)}>
                <X size={18} color={theme.text.secondary} />
              </Pressable>
            </View>

            <ScrollView
              style={{
                backgroundColor: theme.cardSecondary,
                borderRadius: 12,
                padding: 12,
                maxHeight: 350,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: theme.text.primary,
                  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                }}
              >
                {exportedJson}
              </Text>
            </ScrollView>

            <Pressable
              onPress={() => setExportedJson(null)}
              style={{
                backgroundColor: IOS_COLORS.blue,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                Cerrar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
