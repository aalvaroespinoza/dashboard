import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
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
  ExternalLink,
} from 'lucide-react-native';
import { useSyncStore } from '../store/useSyncStore';
import { useAppStore } from '../store/useAppStore';
import { resetDatabase } from '../db/database';
import { useTasksStore } from '../store/useTasksStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { useNotesStore } from '../store/useNotesStore';
import { useBusStore } from '../store/useBusStore';

export const SettingsScreen: React.FC = () => {
  const { themeMode, toggleTheme } = useAppStore();
  const isDark = themeMode === 'dark';

  const {
    appleId,
    serverUrl,
    hasCredentials,
    isSyncing,
    lastSyncedAt,
    syncLogs,
    loadCredentials,
    saveCredentials,
    clearCredentials,
    triggerSync,
  } = useSyncStore();

  const [inputAppleId, setInputAppleId] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputServerUrl, setInputServerUrl] = useState('https://caldav.icloud.com');
  const [showPassword, setShowPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCredentials().then(() => {
      setInputAppleId(appleId);
      setInputServerUrl(serverUrl);
    });
  }, [appleId, serverUrl]);

  const handleSaveCredentials = async () => {
    if (!inputAppleId.trim() || !inputPassword.trim()) {
      setSaveMessage('Por favor completa el Apple ID y la contraseña de aplicación.');
      return;
    }

    try {
      await saveCredentials(inputAppleId.trim(), inputPassword.trim(), inputServerUrl.trim());
      setSaveMessage('¡Credenciales guardadas con éxito en SecureStore!');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (e: any) {
      setSaveMessage(`Error guardando: ${e.message}`);
    }
  };

  const handleResetData = async () => {
    try {
      await resetDatabase();
      await Promise.all([
        useTasksStore.getState().loadTasksAndLists(),
        useCalendarStore.getState().loadEvents(),
        useFinanceStore.getState().loadFinanceData(),
        useNotesStore.getState().loadNotes(),
        useBusStore.getState().loadRoutes(),
      ]);
      setSaveMessage('Base de datos restaurada con datos iniciales.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e: any) {
      setSaveMessage(`Error restaurando: ${e.message}`);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#0F1115' : '#F8F9FA' }} contentContainerStyle={{ padding: 24, gap: 20 }}>
      {/* Save message notification */}
      {saveMessage && (
        <View
          style={{
            backgroundColor: saveMessage.includes('Error') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            borderColor: saveMessage.includes('Error') ? '#EF4444' : '#10B981',
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {saveMessage.includes('Error') ? (
            <AlertTriangle size={18} color="#EF4444" style={{ marginRight: 8 }} />
          ) : (
            <CheckCircle size={18} color="#10B981" style={{ marginRight: 8 }} />
          )}
          <Text style={{ color: saveMessage.includes('Error') ? '#EF4444' : '#10B981', fontWeight: '600', fontSize: 13 }}>
            {saveMessage}
          </Text>
        </View>
      )}

      {/* 2-Column Settings Layout */}
      <View style={{ flexDirection: 'row', gap: 20 }}>
        {/* Left Column: iCloud CalDAV Settings */}
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? '#171A21' : '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            borderWidth: 1,
            borderColor: isDark ? '#232733' : '#E5E7EB',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Cloud size={20} color="#6366F1" />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#F3F4F6' : '#111827' }}>
                Sincronización iCloud (CalDAV)
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280' }}>
                Conexión nativa para Apple Reminders y Apple Calendar
              </Text>
            </View>
          </View>

          {/* Guide Alert */}
          <View
            style={{
              backgroundColor: isDark ? '#12151B' : '#F1F5F9',
              borderRadius: 10,
              padding: 14,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: '#6366F1',
            }}
          >
            <Text style={{ fontSize: 12, color: isDark ? '#D1D5DB' : '#334155', lineHeight: 18 }}>
              <Text style={{ fontWeight: '700' }}>Importante:</Text> Apple requiere una <Text style={{ fontWeight: '700' }}>Contraseña de Aplicación</Text> generada en <Text style={{ color: '#6366F1' }}>appleid.apple.com</Text> (no uses tu contraseña habitual de iCloud). Las credenciales se cifran localmente con <Text style={{ fontWeight: '700' }}>expo-secure-store</Text>.
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 14 }}>
            {/* Apple ID */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 6 }}>
                Apple ID (Correo Electrónico)
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#12151B' : '#F8F9FA',
                  borderWidth: 1,
                  borderColor: isDark ? '#2E3544' : '#E5E7EB',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Mail size={16} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 8 }} />
                <TextInput
                  value={inputAppleId}
                  onChangeText={setInputAppleId}
                  placeholder="ejemplo@icloud.com"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    fontSize: 13,
                    color: isDark ? '#F3F4F6' : '#111827',
                  }}
                />
              </View>
            </View>

            {/* App-Specific Password */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 6 }}>
                Contraseña de Aplicación (formato xxxx-xxxx-xxxx-xxxx)
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#12151B' : '#F8F9FA',
                  borderWidth: 1,
                  borderColor: isDark ? '#2E3544' : '#E5E7EB',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Key size={16} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 8 }} />
                <TextInput
                  value={inputPassword}
                  onChangeText={setInputPassword}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    fontSize: 13,
                    color: isDark ? '#F3F4F6' : '#111827',
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ fontSize: 11, color: '#6366F1', fontWeight: '600' }}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CalDAV Server */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 6 }}>
                Servidor CalDAV
              </Text>
              <TextInput
                value={inputServerUrl}
                onChangeText={setInputServerUrl}
                placeholder="https://caldav.icloud.com"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                autoCapitalize="none"
                style={{
                  backgroundColor: isDark ? '#12151B' : '#F8F9FA',
                  borderWidth: 1,
                  borderColor: isDark ? '#2E3544' : '#E5E7EB',
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 13,
                  color: isDark ? '#F3F4F6' : '#111827',
                }}
              />
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={handleSaveCredentials}
                style={{
                  flex: 1,
                  backgroundColor: '#6366F1',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                  Guardar Credenciales
                </Text>
              </TouchableOpacity>

              {hasCredentials && (
                <TouchableOpacity
                  onPress={clearCredentials}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: isDark ? '#1E232E' : '#E5E7EB',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>

            {/* Sync Now Button */}
            {hasCredentials && (
              <TouchableOpacity
                onPress={triggerSync}
                disabled={isSyncing}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#12151B' : '#F1F3F5',
                  borderWidth: 1,
                  borderColor: isDark ? '#2E3544' : '#CBD5E1',
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginTop: 6,
                }}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#6366F1" style={{ marginRight: 8 }} />
                ) : (
                  <RefreshCw size={16} color="#6366F1" style={{ marginRight: 8 }} />
                )}
                <Text style={{ color: isDark ? '#F3F4F6' : '#111827', fontWeight: '700', fontSize: 13 }}>
                  {isSyncing ? 'Sincronizando con iCloud...' : 'Sincronizar Ahora'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Right Column: Appearance & Maintenance & Sync Logs */}
        <View style={{ flex: 1, gap: 20 }}>
          {/* Appearance & Database */}
          <View
            style={{
              backgroundColor: isDark ? '#171A21' : '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              borderWidth: 1,
              borderColor: isDark ? '#232733' : '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#F3F4F6' : '#111827', marginBottom: 16 }}>
              Apariencia & Base de Datos
            </Text>

            {/* Dark Mode toggle */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#232733' : '#F1F3F5',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isDark ? <Moon size={18} color="#6366F1" /> : <Sun size={18} color="#F59E0B" />}
                <Text style={{ marginLeft: 10, fontSize: 14, fontWeight: '600', color: isDark ? '#F3F4F6' : '#111827' }}>
                  Tema de la Aplicación
                </Text>
              </View>

              <TouchableOpacity
                onPress={toggleTheme}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: isDark ? '#1E232E' : '#E2E8F0',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#D1D5DB' : '#374151' }}>
                  {isDark ? 'Oscuro Grit' : 'Claro'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reset Database */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Database size={18} color="#EF4444" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#F3F4F6' : '#111827' }}>
                    Restaurar Datos de Muestra
                  </Text>
                  <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    Recarga las listas, tareas, categorías y colectivos iniciales
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleResetData}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#EF4444' }}>
                  Restaurar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sync Logs Console */}
          <View
            style={{
              flex: 1,
              backgroundColor: isDark ? '#171A21' : '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: isDark ? '#232733' : '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#F3F4F6' : '#111827', marginBottom: 10 }}>
              Registro de Sincronización CalDAV
            </Text>

            <ScrollView
              style={{
                maxHeight: 180,
                backgroundColor: isDark ? '#0F1115' : '#F1F3F5',
                borderRadius: 8,
                padding: 12,
              }}
            >
              {syncLogs.length === 0 ? (
                <Text style={{ fontSize: 11, color: isDark ? '#6B7280' : '#9CA3AF' }}>
                  Sin registros recientes.
                </Text>
              ) : (
                syncLogs.map((log, idx) => (
                  <Text
                    key={idx}
                    style={{
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: log.includes('Error') || log.includes('Falló') ? '#EF4444' : isDark ? '#9CA3AF' : '#4B5563',
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
    </ScrollView>
  );
};
