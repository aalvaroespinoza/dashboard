import React, { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Bus, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { BusServiceItem } from '../../services/busService';
import { BusServiceCard } from './BusServiceCard';

interface BusScheduleListProps {
  idaServices: BusServiceItem[];
  vueltaServices: BusServiceItem[];
  nextBusServiceId?: string;
  onSelectService?: (service: BusServiceItem) => void;
  isDark?: boolean;
}

export const BusScheduleList: React.FC<BusScheduleListProps> = ({
  idaServices,
  vueltaServices,
  nextBusServiceId,
  onSelectService,
  isDark = true,
}) => {
  const [activeTab, setActiveTab] = useState<'ida' | 'vuelta'>('ida');

  const activeList = activeTab === 'ida' ? idaServices : vueltaServices;

  return (
    <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Tabs Ida / Vuelta */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: isDark ? '#12151B' : '#F1F3F5',
          borderRadius: 10,
          padding: 4,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isDark ? '#232733' : '#E5E7EB',
        }}
      >
        <Pressable
          onPress={() => setActiveTab('ida')}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: activeTab === 'ida' ? (isDark ? '#1E232E' : '#FFFFFF') : 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: activeTab === 'ida' ? 0.06 : 0,
            shadowRadius: 2,
            gap: 6,
          }}
        >
          <ArrowUpRight
            size={15}
            color={activeTab === 'ida' ? '#6366F1' : isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: activeTab === 'ida' ? (isDark ? '#FFFFFF' : '#111827') : isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            Ida ({idaServices.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('vuelta')}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: activeTab === 'vuelta' ? (isDark ? '#1E232E' : '#FFFFFF') : 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: activeTab === 'vuelta' ? 0.06 : 0,
            shadowRadius: 2,
            gap: 6,
          }}
        >
          <ArrowDownLeft
            size={15}
            color={activeTab === 'vuelta' ? '#10B981' : isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: activeTab === 'vuelta' ? (isDark ? '#FFFFFF' : '#111827') : isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            Vuelta ({vueltaServices.length})
          </Text>
        </Pressable>
      </View>

      {/* Lista de Servicios */}
      {activeList.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 30,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: isDark ? '#232733' : '#E5E7EB',
            borderRadius: 12,
          }}
        >
          <Bus size={28} color={isDark ? '#4B5563' : '#CBD5E1'} />
          <Text style={{ fontSize: 13, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 8 }}>
            No hay servicios de {activeTab} para los filtros seleccionados.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BusServiceCard
              service={item}
              isNext={item.id === nextBusServiceId}
              onPress={() => onSelectService?.(item)}
              isDark={isDark}
            />
          )}
        />
      )}
    </View>
  );
};
