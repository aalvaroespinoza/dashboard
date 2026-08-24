import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Linking,
} from 'react-native';
import { ExternalLink, Play, Globe } from 'lucide-react-native';
import { LinkPreviewData } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface RichLinkPreviewCardProps {
  preview: LinkPreviewData;
  isDark?: boolean;
}

export const RichLinkPreviewCard: React.FC<RichLinkPreviewCardProps> = ({
  preview,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const handleOpenUrl = () => {
    if (preview.url) {
      Linking.openURL(preview.url).catch((err) =>
        console.warn('Error al abrir URL:', err)
      );
    }
  };

  const isYouTube = preview.domain.toLowerCase().includes('youtube.com') || preview.domain.toLowerCase().includes('youtu.be');

  return (
    <Pressable
      onPress={handleOpenUrl}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        marginTop: 6,
        marginBottom: 4,
        borderRadius: 14,
        backgroundColor: isDark ? '#242426' : '#F2F2F7',
        borderWidth: 1,
        borderColor: isDark ? '#38383A' : '#E5E5EA',
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.2 : 0.05, 4),
      })}
    >
      {/* Miniatura / Thumbnail */}
      {preview.image_url ? (
        <View style={{ width: 84, height: 64, position: 'relative', backgroundColor: '#000000' }}>
          <Image
            source={{ uri: preview.image_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          {isYouTube && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: '#FF0000',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Play size={12} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 1 }} />
              </View>
            </View>
          )}
        </View>
      ) : (
        <View
          style={{
            width: 54,
            height: 64,
            backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Globe size={20} color={theme.text.tertiary} />
        </View>
      )}

      {/* Info: Dominio, Título y Enlace Externo */}
      <View style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 10,
              fontWeight: '800',
              color: isYouTube ? '#FF3B30' : IOS_COLORS.blue,
              textTransform: 'uppercase',
            }}
          >
            {preview.domain}
          </Text>
          <ExternalLink size={12} color={theme.text.tertiary} />
        </View>

        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontWeight: '800',
            color: theme.text.primary,
          }}
        >
          {preview.title}
        </Text>

        {preview.description && (
          <Text
            numberOfLines={1}
            style={{
              fontSize: 11,
              color: theme.text.secondary,
            }}
          >
            {preview.description}
          </Text>
        )}
      </View>
    </Pressable>
  );
};
