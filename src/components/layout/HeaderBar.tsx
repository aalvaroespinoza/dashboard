import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RefreshCw, Cloud, CloudOff, Sun, Moon } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useSyncStore } from '../../store/useSyncStore';

export const HeaderBar: React.FC = () => {
  const { themeMode, toggleTheme, activeModule, setActiveModule } = useAppStore();
  const { hasCredentials, isSyncing, triggerSync, lastSyncedAt } = useSyncStore();

  const isDark = themeMode === 'dark';

  const titles: Record<string, { title: string; subtitle: string }> = {
    tasks: { title: 'Tableros de Recordatorios', subtitle: 'Listas dinámicas estilo Grit & iCloud Reminders' },
    calendar: { title: 'Calendario', subtitle: 'Sincronización mensual, semanal y agenda con iCloud' },
    finance: { title: 'Finanzas Personales', subtitle: 'Control de ingresos, gastos y balances mensuales' },
    notes: { title: 'Organizador de Notas', subtitle: 'Editor Markdown y visor estructurado' },
    bus: { title: 'Recorridos de Colectivos', subtitle: 'Líneas, paradas y horarios offline' },
    settings: { title: 'Configuración', subtitle: 'Conexión CalDAV, tema y mantenimiento' },
  };

  const currentInfo = titles[activeModule] || { title: 'Dashboard', subtitle: '' };

  const formatLastSync = () => {
    if (!lastSyncedAt) return 'Sin sincronizar';
    const date = new Date(lastSyncedAt);
    return `Sincronizado ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View
      style={{
        height: 68,
        backgroundColor: isDark ? '#0F1115' : '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#232733' : '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
      }}
    >
      {/* Title and subtitle */}
      <View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: isDark ? '#F3F4F6' : '#111827',
            letterSpacing: -0.3,
          }}
        >
          {currentInfo.title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: isDark ? '#9CA3AF' : '#6B7280',
            marginTop: 2,
          }}
        >
          {currentInfo.subtitle}
        </Text>
      </View>

      {/* Right side actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Sync status pill */}
        <TouchableOpacity
          onPress={() => {
            if (hasCredentials && !isSyncing) {
              triggerSync();
            } else if (!hasCredentials) {
              setActiveModule('settings');
            }
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#171A21' : '#FFFFFF',
            borderWidth: 1,
            borderColor: isDark ? '#2E3544' : '#E5E7EB',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#6366F1" style={{ marginRight: 6 }} />
          ) : hasCredentials ? (
            <Cloud size={14} color="#10B981" style={{ marginRight: 6 }} />
          ) : (
            <CloudOff size={14} color={isDark ? '#6B7280' : '#9CA3AF'} style={{ marginRight: 6 }} />
          )}

          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: isDark ? '#D1D5DB' : '#4B5563',
            }}
          >
            {isSyncing ? 'Sincronizando...' : hasCredentials ? formatLastSync() : 'Configurar CalDAV'}
          </Text>

          {hasCredentials && !isSyncing && (
            <RefreshCw size={12} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginLeft: 6 }} />
          )}
        </TouchableOpacity>

        {/* Theme Toggle Button */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isDark ? '#171A21' : '#FFFFFF',
            borderWidth: 1,
            borderColor: isDark ? '#2E3544' : '#E5E7EB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDark ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#6366F1" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};
