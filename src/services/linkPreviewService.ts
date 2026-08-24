import { getDatabase } from '../db/database';
import { LinkPreviewData } from '../types';

const URL_REGEX = /(https?:\/\/[^\s]+)/i;

export const linkPreviewService = {
  extractUrl(text: string): string | null {
    if (!text) return null;
    const match = text.match(URL_REGEX);
    return match ? match[0] : null;
  },

  getYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  },

  async getOrFetchPreview(url: string): Promise<LinkPreviewData> {
    const db = await getDatabase();
    
    // 1. Buscar en caché SQLite
    const cached = await db.getFirstAsync<LinkPreviewData>(
      'SELECT * FROM link_previews WHERE url = ?',
      [url]
    );
    if (cached) {
      return cached;
    }

    // 2. Extraer dominio
    let domain = '';
    try {
      const parsed = new URL(url);
      domain = parsed.hostname.replace('www.', '');
    } catch {
      domain = url;
    }

    // 3. Caso especial YouTube (Offline First instantáneo)
    const ytId = this.getYoutubeId(url);
    if (ytId) {
      const ytPreview: LinkPreviewData = {
        url,
        title: 'Video de YouTube',
        description: `youtube.com/watch?v=${ytId}`,
        image_url: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        domain: 'youtube.com',
        created_at: new Date().toISOString(),
      };

      await db.runAsync(
        'INSERT INTO link_previews (url, title, description, image_url, domain, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [ytPreview.url, ytPreview.title, ytPreview.description || null, ytPreview.image_url || null, ytPreview.domain, ytPreview.created_at || '']
      );

      return ytPreview;
    }

    // 4. Default preview genérica
    const genericPreview: LinkPreviewData = {
      url,
      title: domain.charAt(0).toUpperCase() + domain.slice(1),
      description: url,
      image_url: null,
      domain,
      created_at: new Date().toISOString(),
    };

    await db.runAsync(
      'INSERT INTO link_previews (url, title, description, image_url, domain, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [genericPreview.url, genericPreview.title, genericPreview.description || null, genericPreview.image_url || null, genericPreview.domain, genericPreview.created_at || '']
    );

    return genericPreview;
  },
};
