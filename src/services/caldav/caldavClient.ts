export interface CalDavCollection {
  href: string;
  name: string;
  color?: string;
  ctag?: string;
  supportsTodos: boolean;
  supportsEvents: boolean;
}

export interface CalDavItem {
  href: string;
  etag?: string;
  icsData: string;
}

function encodeBasicAuth(user: string, pass: string): string {
  // Base64 encoding compatible con React Native / JS estándar
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const str = `${user}:${pass}`;
  let output = '';

  for (let block = 0, charCode, i = 0, map = chars;
       str.charAt(i | 0) || (map = '=', i % 1);
       output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3/4);
    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string contains characters outside Latin1 range.");
    }
    block = block << 8 | charCode;
  }
  return output;
}

export class CalDavClient {
  private appleId: string;
  private appPassword: string;
  private baseUrl: string;

  constructor(appleId: string, appPassword: string, baseUrl: string = 'https://caldav.icloud.com') {
    this.appleId = appleId.trim();
    this.appPassword = appPassword.trim();
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private getAuthHeader(): string {
    return `Basic ${encodeBasicAuth(this.appleId, this.appPassword)}`;
  }

  private async request(url: string, method: string, body?: string, headers: Record<string, string> = {}): Promise<{ status: number; text: string; headers: Headers }> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    
    const res = await fetch(fullUrl, {
      method,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/xml; charset=utf-8',
        'User-Agent': 'Dashboard-Tablet/1.0 (Mobile; Android/Huawei)',
        ...headers,
      },
      body,
    });

    const text = await res.text();
    return { status: res.status, text, headers: res.headers };
  }

  /**
   * Paso 1: Obtener el Principal del usuario
   */
  async findPrincipal(): Promise<string> {
    const propfindXml = `<?xml version="1.0" encoding="utf-8" ?>
      <D:propfind xmlns:D="DAV:">
        <D:prop>
          <D:current-user-principal />
        </D:prop>
      </D:propfind>`;

    const res = await this.request('/', 'PROPFIND', propfindXml, { 'Depth': '0' });
    if (res.status >= 400) {
      throw new Error(`Error de autenticación o conexión CalDAV (Status: ${res.status}). Verifica tu Apple ID y Contraseña de Aplicación.`);
    }

    // Extraer href de current-user-principal
    const match = res.text.match(/<(?:\w+:)?current-user-principal[^>]*>[\s\S]*?<(?:\w+:)?href[^>]*>([^<]+)<\/(?:\w+:)?href>/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    throw new Error('No se pudo resolver el Principal de iCloud.');
  }

  /**
   * Paso 2: Obtener el Home Set de Calendarios y Recordatorios
   */
  async findCalendarHomeSet(principalHref: string): Promise<string> {
    const propfindXml = `<?xml version="1.0" encoding="utf-8" ?>
      <D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
        <D:prop>
          <C:calendar-home-set />
        </D:prop>
      </D:propfind>`;

    const res = await this.request(principalHref, 'PROPFIND', propfindXml, { 'Depth': '0' });
    if (res.status >= 400) {
      throw new Error(`No se pudo obtener el calendar-home-set (${res.status})`);
    }

    const match = res.text.match(/<(?:\w+:)?calendar-home-set[^>]*>[\s\S]*?<(?:\w+:)?href[^>]*>([^<]+)<\/(?:\w+:)?href>/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    throw new Error('No se pudo encontrar la ruta de calendarios en iCloud.');
  }

  /**
   * Paso 3: Listar colecciones (listas de recordatorios y calendarios)
   */
  async listCollections(calendarHomeUrl: string): Promise<CalDavCollection[]> {
    const propfindXml = `<?xml version="1.0" encoding="utf-8" ?>
      <D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:IC="http://apple.com/ns/ical/">
        <D:prop>
          <D:displayname />
          <D:resourcetype />
          <C:supported-calendar-component-set />
          <IC:calendar-color />
          <D:getctag xmlns:D="http://calendarserver.org/ns/" />
        </D:prop>
      </D:propfind>`;

    const res = await this.request(calendarHomeUrl, 'PROPFIND', propfindXml, { 'Depth': '1' });
    if (res.status >= 400) {
      throw new Error(`Error listando colecciones (${res.status})`);
    }

    const collections: CalDavCollection[] = [];
    const responseBlocks = res.text.split(/<\/(?:\w+:)?response>/i);

    for (const block of responseBlocks) {
      if (!block.includes('<') || !block.includes('displayname')) continue;

      const hrefMatch = block.match(/<(?:\w+:)?href[^>]*>([^<]+)<\/(?:\w+:)?href>/i);
      const nameMatch = block.match(/<(?:\w+:)?displayname[^>]*>([^<]+)<\/(?:\w+:)?displayname>/i);
      const colorMatch = block.match(/<(?:\w+:)?calendar-color[^>]*>([^<]+)<\/(?:\w+:)?calendar-color>/i);
      const ctagMatch = block.match(/<(?:\w+:)?getctag[^>]*>([^<]+)<\/(?:\w+:)?getctag>/i);

      const isCalendar = block.includes(':calendar') || block.includes('calendar/>');
      const supportsTodos = block.includes('VTODO') || block.includes('vtodo');
      const supportsEvents = block.includes('VEVENT') || block.includes('vevent');

      if (hrefMatch && nameMatch && isCalendar) {
        collections.push({
          href: hrefMatch[1].trim(),
          name: nameMatch[1].trim(),
          color: colorMatch ? colorMatch[1].trim() : undefined,
          ctag: ctagMatch ? ctagMatch[1].trim() : undefined,
          supportsTodos,
          supportsEvents: supportsEvents || (!supportsTodos), // por defecto evento si no es solo todo
        });
      }
    }

    return collections;
  }

  /**
   * Paso 4: Obtener todos los elementos (VTODO o VEVENT) de una colección
   */
  async fetchCollectionItems(collectionHref: string, componentType: 'VTODO' | 'VEVENT'): Promise<CalDavItem[]> {
    const reportXml = `<?xml version="1.0" encoding="utf-8" ?>
      <C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
        <D:prop>
          <D:getetag />
          <C:calendar-data />
        </D:prop>
        <C:filter>
          <C:comp-filter name="VCALENDAR">
            <C:comp-filter name="${componentType}" />
          </C:comp-filter>
        </C:filter>
      </C:calendar-query>`;

    const res = await this.request(collectionHref, 'REPORT', reportXml, { 'Depth': '1' });
    if (res.status >= 400) {
      throw new Error(`Error en consulta de ${componentType} (${res.status})`);
    }

    const items: CalDavItem[] = [];
    const responseBlocks = res.text.split(/<\/(?:\w+:)?response>/i);

    for (const block of responseBlocks) {
      const hrefMatch = block.match(/<(?:\w+:)?href[^>]*>([^<]+)<\/(?:\w+:)?href>/i);
      const etagMatch = block.match(/<(?:\w+:)?getetag[^>]*>([^<]+)<\/(?:\w+:)?getetag>/i);
      const dataMatch = block.match(/<(?:\w+:)?calendar-data[^>]*>([\s\S]*?)<\/(?:\w+:)?calendar-data>/i);

      if (hrefMatch && dataMatch) {
        items.push({
          href: hrefMatch[1].trim(),
          etag: etagMatch ? etagMatch[1].trim().replace(/"/g, '') : undefined,
          icsData: dataMatch[1].trim(),
        });
      }
    }

    return items;
  }

  /**
   * Paso 5: Crear o actualizar un elemento mediante PUT
   */
  async putItem(itemHref: string, icsData: string, etag?: string): Promise<{ etag?: string }> {
    const headers: Record<string, string> = {
      'Content-Type': 'text/calendar; charset=utf-8',
    };
    if (etag) {
      headers['If-Match'] = `"${etag}"`;
    }

    const res = await this.request(itemHref, 'PUT', icsData, headers);
    if (res.status !== 201 && res.status !== 204 && res.status !== 200) {
      throw new Error(`Error subiendo elemento a iCloud (${res.status}): ${res.text}`);
    }

    const newEtag = res.headers.get('ETag') || undefined;
    return { etag: newEtag ? newEtag.replace(/"/g, '') : undefined };
  }

  /**
   * Paso 6: Eliminar un elemento mediante DELETE
   */
  async deleteItem(itemHref: string): Promise<void> {
    const res = await this.request(itemHref, 'DELETE');
    if (res.status !== 200 && res.status !== 204 && res.status !== 404) {
      throw new Error(`Error eliminando elemento de iCloud (${res.status})`);
    }
  }
}
