import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { Music, ExternalLink } from 'lucide-react-native';
import { IOS_COLORS } from '../../../styles/theme';

interface PlaylistOption {
  label: string;
  url: string;
  webUrl: string;
}

const PLAYLISTS: PlaylistOption[] = [
  {
    label: 'Beyakooo 🪩',
    url: 'spotify:playlist:0KSrhygf74dHRge1AmoAUt',
    webUrl: 'https://open.spotify.com/playlist/0KSrhygf74dHRge1AmoAUt',
  },
  {
    label: '🥷🏿',
    url: 'spotify:playlist:4mqOCbTwQ2NUzFsKZnQ3YT',
    webUrl: 'https://open.spotify.com/playlist/4mqOCbTwQ2NUzFsKZnQ3YT',
  },
  {
    label: 'Rock & Chill',
    url: 'spotify:playlist:6ACBy2RHlSjUIrrr2iWHmr',
    webUrl: 'https://open.spotify.com/playlist/6ACBy2RHlSjUIrrr2iWHmr',
  },
  {
    label: '0600 💊',
    url: 'spotify:playlist:2ijtVRH8rnUBsatc60N7Jr',
    webUrl: 'https://open.spotify.com/playlist/2ijtVRH8rnUBsatc60N7Jr',
  },
  {
    label: 'Old but Gold 🥇',
    url: 'spotify:playlist:6c3erhsizpRRLjZub5shsB',
    webUrl: 'https://open.spotify.com/playlist/6c3erhsizpRRLjZub5shsB',
  },
  {
    label: 'Mix Diario 💿',
    url: 'spotify:playlist:37i9dQZF1E371Blon1t7ay',
    webUrl: 'https://open.spotify.com/playlist/37i9dQZF1E371Blon1t7ay',
  },
];

interface ModoViajeEntertainmentProps {
  isDark?: boolean;
}

export const ModoViajeEntertainment: React.FC<ModoViajeEntertainmentProps> = ({
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const handleOpenPlaylist = async (playlist: PlaylistOption) => {
    try {
      const canOpen = await Linking.canOpenURL(playlist.url);
      if (canOpen) {
        await Linking.openURL(playlist.url);
      } else {
        await Linking.openURL(playlist.webUrl);
      }
    } catch {
      await Linking.openURL(playlist.webUrl);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '800',
          color: theme.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Modo Viaje 🎧
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {PLAYLISTS.map((opt) => (
          <Pressable
            key={opt.label}
            onPress={() => handleOpenPlaylist(opt)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.75 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.card,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 6,
            })}
          >
            <Music size={14} color="#10B981" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
