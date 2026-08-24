import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Folder } from 'lucide-react-native';
import { IOS_COLORS } from '../../../styles/theme';

export interface FolderInfo {
  id: string;
  name: string;
  count: number;
  color: string;
  iconBg: string;
}

interface FolderCardProps {
  folder: FolderInfo;
  isSelected?: boolean;
  onPress: (folderName: string) => void;
  isDark?: boolean;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  isSelected = false,
  onPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <Pressable
      onPress={() => onPress(folder.name)}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 150,
        opacity: pressed ? 0.85 : 1,
        backgroundColor: isSelected ? (isDark ? '#2C2C2E' : '#FFFFFF') : theme.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1.5,
        borderColor: isSelected ? IOS_COLORS.blue : theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        gap: 12,
      })}
    >
      {/* Icono de Carpeta */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: folder.iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Folder size={20} color={folder.color} fill={folder.color} fillOpacity={0.2} />
      </View>

      <View>
        <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary }}>
          {folder.name}
        </Text>
        <Text style={{ fontSize: 12, color: theme.text.secondary, fontWeight: '600', marginTop: 2 }}>
          {folder.count} {folder.count === 1 ? 'nota' : 'notas'}
        </Text>
      </View>
    </Pressable>
  );
};
