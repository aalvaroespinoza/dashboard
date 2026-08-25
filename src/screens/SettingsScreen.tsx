/**
 * SettingsScreen.tsx
 * Panel de Ajustes y Gestión Integral de Base de Datos de MiHub.
 *
 * Características:
 * 1. Sincronización iCloud (CalDAV con cifrado SecureStore)
 * 2. Gestión de Base de Datos (Exportar JSON, Importar JSON con Portapapeles)
 * 3. Reset selectivo por módulo con Modal de Advertencia y Confirmación destructiva
 * 4. Preferencias de Cursado & Transporte (Arquitectura / Pernoctación en Córdoba)
 * 5. Consola de Logs CalDAV
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  Switch,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  Cloud,
  Lock,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Database,
  Download,
  Upload,
  Bus,
  Check,
  X,
  Copy,
  Sparkles,
  Layers,
  Calendar,
  Zap,
  DollarSign,
} from 'lucide-react-native';
import { useSyncStore } from '../store/useSyncStore';
import { useAppStore } from '../store/useAppStore';
import { useTasksStore } from '../store/useTasksStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useHabitsStore } from '../features/habits/stores/useHabitsStore';
import { useTodaySchedule } from '../features/bus/hooks/useTodaySchedule';
import { backupService } from '../services/backupService';
import { IOS_COLORS } from '../styles/theme';
import { createShadow } from '../styles/shadows';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isDanger: boolean;
  onConfirm: () => Promise<void>;
}

export const SettingsScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const { isLandscape, contentPadding } = useResponsiveLayout();
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
  const [isCopied, setIsCopied] = useState(false);

  // Modal de Confirmación de Advertencia
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirmar',
    isDanger: true,
    onConfirm: async () => {},
  });

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
      setIsCopied(false);
      setIsExportModalOpen(true);
    } catch (e: any) {
      showStatus(`Error al exportar: ${e.message}`, 'error');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(backupJsonText);
      setIsCopied(true);
      showStatus('¡Copia de seguridad JSON copiada al portapapeles!');
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      showStatus('No se pudo copiar automáticamente al portapapeles.', 'error');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.trim().startsWith('{')) {
        setImportJsonText(text);
        showStatus('JSON pegado desde el portapapeles.');
      } else {
        showStatus('El portapapeles no contiene un JSON de backup válido.', 'error');
      }
    } catch {
      showStatus('Error al leer del portapapeles.', 'error');
    }
  };

  const triggerImportWithWarning = () => {
    if (!importJsonText.trim()) {
      showStatus('Por favor ingresa o pega el JSON de respaldo.', 'error');
      return;
    }

    try {
      JSON.parse(importJsonText);
    } catch {
      showStatus('El texto ingresado no es un JSON válido.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Restaurar Base de Datos',
      description:
        'Esta acción sobrescribirá los datos actuales de todos los módulos con los registros de la copia de seguridad. ¿Deseas proceder?',
      confirmLabel: 'Restaurar Copia',
      isDanger: false,
      onConfirm: async () => {
        try {
          await backupService.importFromJson(importJsonText);
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
          showStatus(`Error al importar: ${e.message}`, 'error');
        }
      },
    });
  };

  const requestSelectiveReset = (
    module: 'tasks' | 'calendar' | 'habits' | 'finances' | 'all',
    label: string,
    description: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      title: `⚠️ Vaciar ${label}`,
      description: `${description}\n\n¿Estás completamente seguro? Esta acción no se puede deshacer.`,
      confirmLabel: module === 'all' ? 'Restablecer Todo de Fábrica' : `Sí, Vaciar ${label}`,
      isDanger: true,
      onConfirm: async () => {
        try {
          await backupService.resetModule(module);
          if (module === 'tasks' || module === 'all') await useTasksStore.getState().loadTasksAndLists();
          if (module === 'calendar' || module === 'all') {
            await useCalendarStore.getState().loadEvents();
            await useCalendarStore.getState().loadCategories();
          }
          if (module === 'habits' || module === 'all') await useHabitsStore.getState().loadHabitsData();
          if (module === 'finances' || module === 'all') await useFinanceStore.getState().loadFinanceData();
          if (module === 'all') await useAppStore.getState().initApp();
          showStatus(`Módulo ${label} restablecido a 0 correctamente.`);
        } catch (e: any) {
          showStatus(`Error: ${e.message}`, 'error');
        }
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#000000' : theme.background }}
      contentContainerStyle={{ padding: contentPadding, paddingBottom: 64, gap: 20 }}
    >
      {/* Banner de Estado */}
      {statusMessage && (
        <View
          style={{
            backgroundColor:
              statusMessage.type === 'error'
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(52, 199, 89, 0.15)',
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
          <Text
            style={{
              color: statusMessage.type === 'error' ? '#EF4444' : '#34C759',
              fontWeight: '800',
              fontSize: 13,
            }}
          >
            {statusMessage.text}
          </Text>
        </View>
      )}

      {/* Grid Adaptable para Tablet (2 columnas en Landscape / 1 columna en Portrait) */}
      <View style={{ flexDirection: isLandscape ? 'row' : 'column', gap: 20, alignItems: 'stretch' }}>
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
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: 'rgba(0, 122, 255, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
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
                <Text style={{ fontWeight: '800', color: theme.text.primary }}>Seguridad:</Text> Usá una{' '}
                <Text style={{ fontWeight: '800', color: '#007AFF' }}>Contraseña de Aplicación</Text>{' '}
                generada en appleid.apple.com. Se cifra localmente con SecureStore.
              </Text>
            </View>

            {/* Formulario */}
            <View style={{ gap: 12 }}>
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: theme.text.secondary,
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
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
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: theme.text.secondary,
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Contraseña de Aplicación
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.cardSecondary,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.border,
                    paddingHorizontal: 12,
                  }}
                >
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
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 45, 85, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
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
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 4,
                }}
              >
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

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 4,
                }}
              >
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
          {/* 3. Panel de Base de Datos (Backup, Restore, Reset con Advertencia) */}
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
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: 'rgba(52, 199, 89, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
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
                <Download size={16} color="#34C759" />
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
                <Upload size={16} color="#007AFF" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.primary }}>
                  Importar JSON
                </Text>
              </Pressable>
            </View>

            {/* Botones de Reset Selectivo con Advertencia */}
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={13} color="#FF9500" />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: theme.text.secondary,
                    textTransform: 'uppercase',
                  }}
                >
                  Restablecer Módulos Selectivamente
                </Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {/* Tareas */}
                <Pressable
                  onPress={() =>
                    requestSelectiveReset(
                      'tasks',
                      'Recordatorios',
                      'Se vaciarán todas las listas, tareas y recordatorios locales.'
                    )
                  }
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    borderRadius: 11,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7',
                    borderWidth: 1,
                    borderColor: theme.border,
                  })}
                >
                  <Layers size={13} color={theme.text.secondary} />
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary }}>
                    Vaciar Tareas
                  </Text>
                </Pressable>

                {/* Calendario */}
                <Pressable
                  onPress={() =>
                    requestSelectiveReset(
                      'calendar',
                      'Calendario',
                      'Se eliminarán todos los eventos locales y calendarios personalizados.'
                    )
                  }
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    borderRadius: 11,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7',
                    borderWidth: 1,
                    borderColor: theme.border,
                  })}
                >
                  <Calendar size={13} color={theme.text.secondary} />
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary }}>
                    Vaciar Eventos
                  </Text>
                </Pressable>

                {/* Hábitos */}
                <Pressable
                  onPress={() =>
                    requestSelectiveReset(
                      'habits',
                      'Hábitos',
                      'Se borrarán todos los hábitos, historial de días, cronómetros y perfil de nivel RPG.'
                    )
                  }
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    borderRadius: 11,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7',
                    borderWidth: 1,
                    borderColor: theme.border,
                  })}
                >
                  <Zap size={13} color={theme.text.secondary} />
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary }}>
                    Vaciar Hábitos
                  </Text>
                </Pressable>

                {/* Finanzas */}
                <Pressable
                  onPress={() =>
                    requestSelectiveReset(
                      'finances',
                      'Finanzas',
                      'Se eliminarán todas las cuentas de origen, transacciones y compras en cuotas.'
                    )
                  }
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    borderRadius: 11,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7',
                    borderWidth: 1,
                    borderColor: theme.border,
                  })}
                >
                  <DollarSign size={13} color={theme.text.secondary} />
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary }}>
                    Vaciar Finanzas
                  </Text>
                </Pressable>

                {/* Reset Completo de Fábrica */}
                <Pressable
                  onPress={() =>
                    requestSelectiveReset(
                      'all',
                      'Base de Datos Completa',
                      'Esta acción eliminará TODOS los registros de todos los módulos y restablecerá la base de datos a los valores de fábrica.'
                    )
                  }
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 11,
                    backgroundColor: 'rgba(255, 59, 48, 0.15)',
                    borderWidth: 1,
                    borderColor: '#FF3B30',
                  })}
                >
                  <Trash2 size={13} color="#FF3B30" />
                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#FF3B30' }}>
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
            <Text
              style={{
                fontSize: 13,
                fontWeight: '800',
                color: theme.text.primary,
                textTransform: 'uppercase',
              }}
            >
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
                      color:
                        log.includes('Error') || log.includes('Falló')
                          ? '#FF3B30'
                          : theme.text.secondary,
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

      {/* Modal 1: Exportar Backup JSON */}
      <Modal visible={isExportModalOpen} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: '90%',
              maxWidth: 560,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              gap: 16,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Download size={20} color="#34C759" />
                <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
                  Copia de Seguridad JSON
                </Text>
              </View>
              <Pressable onPress={() => setIsExportModalOpen(false)}>
                <X size={20} color={theme.text.secondary} />
              </Pressable>
            </View>

            <Text style={{ fontSize: 12, color: theme.text.secondary, lineHeight: 17 }}>
              Se ha generado la copia de seguridad completa con todos los módulos. Podés copiarla al portapapeles o guardarla externamente:
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

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={handleCopyToClipboard}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  flex: 1,
                  minHeight: 44,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCopied ? '#34C759' : '#007AFF',
                  borderRadius: 12,
                  gap: 8,
                })}
              >
                {isCopied ? <Check size={16} color="#FFFFFF" /> : <Copy size={16} color="#FFFFFF" />}
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>
                  {isCopied ? '¡Copiado con Éxito!' : 'Copiar al Portapapeles'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsExportModalOpen(false)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  paddingHorizontal: 20,
                  minHeight: 44,
                  backgroundColor: theme.cardSecondary,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                })}
              >
                <Text style={{ color: theme.text.primary, fontWeight: '800', fontSize: 13 }}>
                  Cerrar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Importar Backup JSON */}
      <Modal visible={isImportModalOpen} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: '90%',
              maxWidth: 560,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              gap: 16,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Upload size={20} color="#007AFF" />
                <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
                  Restaurar desde JSON
                </Text>
              </View>
              <Pressable onPress={() => setIsImportModalOpen(false)}>
                <X size={20} color={theme.text.secondary} />
              </Pressable>
            </View>

            <Text style={{ fontSize: 12, color: theme.text.secondary, lineHeight: 17 }}>
              Pegá el contenido JSON de una copia de seguridad para restaurar todas las tablas:
            </Text>

            <TextInput
              value={importJsonText}
              onChangeText={setImportJsonText}
              placeholder="Pegar JSON de respaldo aquí..."
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

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={handlePasteFromClipboard}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  paddingHorizontal: 16,
                  minHeight: 44,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.cardSecondary,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  gap: 6,
                })}
              >
                <Copy size={15} color={theme.text.secondary} />
                <Text style={{ color: theme.text.primary, fontWeight: '800', fontSize: 13 }}>
                  Pegar
                </Text>
              </Pressable>

              <Pressable
                onPress={triggerImportWithWarning}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  flex: 1,
                  minHeight: 44,
                  backgroundColor: '#34C759',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>
                  Restaurar Datos...
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Diálogo de Confirmación de Advertencia */}
      <Modal visible={confirmDialog.isOpen} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 9999,
          }}
        >
          <View
            style={{
              width: '90%',
              maxWidth: 480,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              gap: 16,
              borderWidth: 1,
              borderColor: confirmDialog.isDanger ? '#FF3B30' : theme.border,
              ...createShadow(
                confirmDialog.isDanger ? '#FF3B30' : '#000000',
                { width: 0, height: 6 },
                0.3,
                16
              ),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: confirmDialog.isDanger
                    ? 'rgba(255, 59, 48, 0.18)'
                    : 'rgba(255, 149, 0, 0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle
                  size={24}
                  color={confirmDialog.isDanger ? '#FF3B30' : '#FF9500'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary }}>
                  {confirmDialog.title}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF9500', textTransform: 'uppercase' }}>
                  Advertencia de Modificación de Datos
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 13, color: theme.text.secondary, lineHeight: 19 }}>
              {confirmDialog.description}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <Pressable
                onPress={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  flex: 1,
                  minHeight: 46,
                  backgroundColor: theme.cardSecondary,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                })}
              >
                <Text style={{ color: theme.text.primary, fontWeight: '800', fontSize: 13 }}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                  await action();
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  flex: 1,
                  minHeight: 46,
                  backgroundColor: confirmDialog.isDanger ? '#FF3B30' : '#34C759',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13 }}>
                  {confirmDialog.confirmLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
