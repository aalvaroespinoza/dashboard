/**
 * SettingsScreen.tsx
 * Panel de Ajustes y Configuración de MiHub iPadOS 18
 *
 * Incluye:
 * 1. Sincronización iCloud (CalDAV)
 * 2. Gestión de Base de Datos (Backup JSON, Importar JSON, Reset Selectivo)
 * 3. Preferencias de Cursado & Transporte
 * 4. Apariencia y Registro de Sincronización
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import {
  Cloud,
  Lock,
  Key,
  Mail,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Database,
  Moon,
  Sun,
  Download,
  Upload,
  Bus,
  Check,
  X,
  GraduationCap,
} from 'lucide-react-native';
import { useSyncStore } from '../store/useSyncStore';
import { useAppStore } from '../store/useAppStore';
import { useTasksStore } from '../store/useTasksStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useHabitsStore } from '../features/habits/stores/useHabitsStore';
import { useTodaySchedule } from '../features/bus/hooks/useTodaySchedule';
import { backupService } from '../services/backupService';
import { settingsRepo } from '../db/repositories/settingsRepo';
import { IOS_COLORS } from '../styles/theme';
import { createShadow } from '../styles/shadows';

export const SettingsScreen: React.FC = () => {
  const { themeMode, toggleTheme } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    appleId,
    serverUrl,
    hasCredentials,
    isSyncing,
    syncLogs,
    loadCredentials,
    saveCredentials,
    clearCredentials,
    triggerSync,
  } = useSyncStore();

  const {
    cursaArquitectura,
    setCursaArquitectura,
    duermeEnCordoba,
    setDuermeEnCordoba,
  } = useTodaySchedule();

  const [inputAppleId, setInputAppleId] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputServerUrl, setInputServerUrl] = useState('https://caldav.icloud.com');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modales de Backup / Restore
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [backupJsonText, setBackupJsonText] = useState('');
  const [importJsonText, setImportJsonText] = useState('');

  useEffect(() => {
    loadCredentials().then(() => {
      setInputAppleId(appleId);
      setInputServerUrl(serverUrl);
    });
  }, [appleId, serverUrl]);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSaveCredentials = async () => {
    if (!inputAppleId.trim() || !inputPassword.trim()) {
      showStatus('Por favor completa el Apple ID y la contraseña de aplicación.', 'error');
      return;
    }

    try {
      await saveCredentials(inputAppleId.trim(), inputPassword.trim(), inputServerUrl.trim());
      showStatus('¡Credenciales guardadas con éxito en SecureStore!');
    } catch (e: any) {
      showStatus(`Error guardando: ${e.message}`, 'error');
    }
  };

  const handleExportBackup = async () => {
    try {
      const json = await backupService.exportToJson();
      setBackupJsonText(json);
      setIsExportModalOpen(true);
    } catch (e: any) {
      showStatus(`Error al exportar: ${e.message}`, 'error');
    }
  };

  const handleImportBackup = async () => {
    if (!importJsonText.trim()) return;
    try {
      await backupService.importFromJson(importJsonText);
      // Recargar todos los stores
      await Promise.all([
        useTasksStore.getState().loadTasksAndLists(),
        useCalendarStore.getState().loadEvents(),
        useFinanceStore.getState().loadFinanceData(),
        useHabitsStore.getState().loadHabitsData(),
      ]);
      setIsImportModalOpen(false);
      setImportJsonText('');
      showStatus('¡Copia de seguridad restaurada exitosamente!');
    } catch (e: any) {
      Alert.alert('Error al importar', e.message);
    }
  };

  const handleSelectiveReset = (module: 'tasks' | 'calendar' | 'habits' | 'finances' | 'all', label: string) => {
    Alert.alert(
      `Restablecer ${label}`,
      `¿Estás seguro de que deseas vaciar los datos de ${label}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            try {
              await backupService.resetModule(module);
              if (module === 'tasks' || module === 'all') await useTasksStore.getState().loadTasksAndLists();
              if (module === 'calendar' || module === 'all') await useCalendarStore.getState().loadEvents();
              if (module === 'habits' || module === 'all') await useHabitsStore.getState().loadHabitsData();
              if (module === 'finances' || module === 'all') await useFinanceStore.getState().loadFinanceData();
              showStatus(`Módulo ${label} restablecido correctamente.`);
            } catch (e: any) {
              showStatus(`Error: ${e.message}`, 'error');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#000000' : theme.background }}
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      {/* Banner de Estado */}
      {statusMessage && (
        <View
          style={{
            backgroundColor: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 199, 89, 0.15)',
            borderColor: statusMessage.type === 'error' ? '#EF4444' : '#34C759',
            borderWidth: 1,
            borderRadius: 14,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {statusMessage.type === 'error' ? (
            <AlertTriangle size={18} color="#EF4444" />
          ) : (
            <CheckCircle size={18} color="#34C759" />
          )}
          <Text style={{ color: statusMessage.type === 'error' ? '#EF4444' : '#34C759', fontWeight: '800', fontSize: 13 }}>
            {statusMessage.text}
          </Text>
        </View>
      )}

      {/* Grid de 2 Columnas para Tablet iPadOS 18 */}
      <View style={{ flexDirection: 'row', gap: 20, alignItems: 'flex-start' }}>
        {/* COLUMNA IZQUIERDA: iCloud CalDAV + Cursado */}
        <View style={{ flex: 1, gap: 20 }}>
          {/* 1. Sincronización iCloud (CalDAV) */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 22,
              padding: 22,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
              ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.2 : 0.04, 6),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(0, 122, 255, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Cloud size={20} color="#007AFF" />
              </View>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary }}>
                  Sincronización iCloud (CalDAV)
                </Text>
                <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                  Conexión directa con Apple Reminders & Apple Calendar
                </Text>
              </View>
            </View>

            {/* Guía Contraseña de Aplicación */}
            <View
              style={{
                backgroundColor: theme.cardSecondary,
                borderRadius: 12,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#007AFF',
              }}
            >
              <Text style={{ fontSize: 12, color: theme.text.secondary, lineHeight: 17 }}>
                <Text style={{ fontWeight: '800', color: theme.text.primary }}>Seguridad:</Text> Usá una <Text style={{ fontWeight: '800', color: '#007AFF' }}>Contraseña de Aplicación</Text> generada en appleid.apple.com. Se cifra localmente con SecureStore.
              </Text>
            </View>

            {/* Formulario */}
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>
                  Apple ID (Correo)
                </Text>
                <TextInput
                  value={inputAppleId}
                  onChangeText={setInputAppleId}
                  placeholder="usuario@icloud.com"
                  placeholderTextColor={theme.text.tertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: '700',
                    color: theme.text.primary,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>
                  Contraseña de Aplicación
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.cardSecondary, borderRadius: 10, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 12 }}>
                  <TextInput
                    value={inputPassword}
                    onChangeText={setInputPassword}
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    placeholderTextColor={theme.text.tertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      fontSize: 13,
                      fontWeight: '700',
                      color: theme.text.primary,
                    }}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Text style={{ fontSize: 11, color: '#007AFF', fontWeight: '800' }}>
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Botones Guardar & Sincronizar */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <Pressable
                  onPress={handleSaveCredentials}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    flex: 1,
                    minHeight: 44,
                    backgroundColor: '#007AFF',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>
                    Guardar Credenciales
                  </Text>
                </Pressable>

                {hasCredentials && (
                  <Pressable
                    onPress={clearCredentials}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : '#FEE2E2',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={16} color="#FF3B30" />
                  </Pressable>
                )}
              </View>

              {hasCredentials && (
                <Pressable
                  onPress={triggerSync}
                  disabled={isSyncing}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    minHeight: 44,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 12,
                    gap: 8,
                  })}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <RefreshCw size={15} color="#007AFF" />
                  )}
                  <Text style={{ color: theme.text.primary, fontWeight: '800', fontSize: 13 }}>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* 2. Configuración de Cursado & Transporte */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 22,
              padding: 22,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255, 45, 85, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Bus size={20} color="#FF2D55" />
              </View>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary }}>
                  Preferencias de Cursado & Transporte
                </Text>
                <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                  Ajustes del motor de recomendaciones horarias
                </Text>
              </View>
            </View>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary }}>
                    Cursa Arquitectura los Martes
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    Habilita la salida temprana de las 06:30 hs
                  </Text>
                </View>
                <Switch
                  value={cursaArquitectura}
                  onValueChange={setCursaArquitectura}
                  trackColor={{ false: theme.border, true: '#007AFF' }}
                />
              </View>

              <View style={{ height: 1, backgroundColor: theme.border }} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary }}>
                    Duerme en Córdoba los Viernes
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    Oculta el colectivo de vuelta hacia Despeñaderos
                  </Text>
                </View>
                <Switch
                  value={duermeEnCordoba}
                  onValueChange={setDuermeEnCordoba}
                  trackColor={{ false: theme.border, true: '#AF52DE' }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* COLUMNA DERECHA: Gestión de Base de Datos + Logs CalDAV */}
        <View style={{ flex: 1, gap: 20 }}>
          {/* 3. Panel de Base de Datos (Backup, Restore, Reset) */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 22,
              padding: 22,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
              ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.2 : 0.04, 6),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(52, 199, 89, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={20} color="#34C759" />
              </View>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary }}>
                  Gestión de Base de Datos Local
                </Text>
                <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                  Copia de seguridad en JSON y mantenimiento
                </Text>
              </View>
            </View>

            {/* Botones Backup y Restore */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={handleExportBackup}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  flex: 1,
                  minHeight: 44,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  gap: 6,
                })}
              >
                <Download size={15} color="#34C759" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.primary }}>
                  Exportar JSON
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsImportModalOpen(true)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  flex: 1,
                  minHeight: 44,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 12,
                  gap: 6,
                })}
              >
                <Upload size={15} color="#007AFF" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.primary }}>
                  Importar JSON
                </Text>
              </Pressable>
            </View>

            {/* Resets Selectivos */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                Restablecer Módulos Selectivamente
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Pressable
                  onPress={() => handleSelectiveReset('tasks', 'Recordatorios')}
                  style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7', borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
                    Vaciar Tareas
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectiveReset('calendar', 'Calendario')}
                  style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7', borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
                    Vaciar Eventos
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectiveReset('habits', 'Hábitos')}
                  style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7', borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
                    Vaciar Hábitos
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectiveReset('finances', 'Finanzas')}
                  style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7', borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
                    Vaciar Finanzas
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectiveReset('all', 'Base de Datos Completa')}
                  style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255, 59, 48, 0.15)', borderWidth: 1, borderColor: '#FF3B30' }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '900', color: '#FF3B30' }}>
                    Reset Completo
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* 4. Logs de Sincronización CalDAV */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 22,
              padding: 22,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary, textTransform: 'uppercase' }}>
              Consola de Sincronización CalDAV
            </Text>

            <ScrollView
              style={{
                maxHeight: 160,
                backgroundColor: theme.cardSecondary,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              {syncLogs.length === 0 ? (
                <Text style={{ fontSize: 11, color: theme.text.tertiary }}>
                  Sin actividad de sincronización reciente.
                </Text>
              ) : (
                syncLogs.map((log, idx) => (
                  <Text
                    key={idx}
                    style={{
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: log.includes('Error') || log.includes('Falló') ? '#FF3B30' : theme.text.secondary,
                      marginBottom: 4,
                    }}
                  >
                    {log}
                  </Text>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Modal Exportar Backup JSON */}
      <Modal visible={isExportModalOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <View style={{ width: '90%', maxWidth: 540, backgroundColor: theme.card, borderRadius: 24, padding: 24, gap: 14, borderWidth: 1, borderColor: theme.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
                Copia de Seguridad JSON
              </Text>
              <Pressable onPress={() => setIsExportModalOpen(false)}>
                <X size={18} color={theme.text.secondary} />
              </Pressable>
            </View>

            <Text style={{ fontSize: 12, color: theme.text.secondary }}>
              Podés copiar este JSON para guardarlo externamente o restaurarlo en otra tablet.
            </Text>

            <TextInput
              value={backupJsonText}
              editable={false}
              multiline
              style={{
                height: 200,
                backgroundColor: theme.cardSecondary,
                borderRadius: 12,
                padding: 12,
                fontFamily: 'monospace',
                fontSize: 11,
                color: theme.text.primary,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />

            <Pressable
              onPress={() => {
                setIsExportModalOpen(false);
                showStatus('JSON copiado con éxito');
              }}
              style={{ backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                Cerrar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Importar Backup JSON */}
      <Modal visible={isImportModalOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <View style={{ width: '90%', maxWidth: 540, backgroundColor: theme.card, borderRadius: 24, padding: 24, gap: 14, borderWidth: 1, borderColor: theme.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
                Restaurar desde JSON
              </Text>
              <Pressable onPress={() => setIsImportModalOpen(false)}>
                <X size={18} color={theme.text.secondary} />
              </Pressable>
            </View>

            <Text style={{ fontSize: 12, color: theme.text.secondary }}>
              Pegá el contenido del backup JSON para restaurar todas las tablas:
            </Text>

            <TextInput
              value={importJsonText}
              onChangeText={setImportJsonText}
              placeholder="Pegar JSON aquí..."
              placeholderTextColor={theme.text.tertiary}
              multiline
              style={{
                height: 180,
                backgroundColor: theme.cardSecondary,
                borderRadius: 12,
                padding: 12,
                fontFamily: 'monospace',
                fontSize: 11,
                color: theme.text.primary,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />

            <Pressable
              onPress={handleImportBackup}
              style={{ backgroundColor: '#34C759', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>
                Restaurar Datos
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
