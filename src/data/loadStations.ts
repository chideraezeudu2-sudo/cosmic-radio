import type { RadioStation } from '@/types';

const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json';

export async function loadWorldRadioStations(): Promise<RadioStation[]> {
  try {
    console.log('Fetching radio stations from Radio Browser API...');
    
    // Fetch best stations (most popular/reliable)
    const response = await fetch(`${RADIO_BROWSER_API}/stations/search?limit=1000&order=votes&reverse=true`, {
      headers: {
        'User-Agent': 'WorldRadio/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid API response');
    }

    // Map API response to our RadioStation type
    const stations: RadioStation[] = data
      .filter((station: any) => {
        // Only include stations with:
        // - Valid coordinates
        // - URL to stream
        // - Not inactive
        return (
          station.geo_lat &&
          station.geo_long &&
          station.url_resolved &&
          station.lastcheckok === 1
        );
      })
      .map((station: any, index: number) => ({
        uuid: station.stationuuid || `station-${index}`,
        name: station.name || 'Unknown Station',
        url: station.url_resolved || station.url || '',
        country: station.country || 'Unknown',
        genre: station.tags ? station.tags.split(',')[0].trim() : 'Mixed',
        latitude: parseFloat(station.geo_lat),
        longitude: parseFloat(station.geo_long),
        votes: station.votes || 0,
        favicon: station.favicon || '',
        bitrate: station.bitrate || 0,
        language: station.language || 'Unknown'
      }))
      .slice(0, 500); // Limit to 500 stations for performance

    console.log(`Loaded ${stations.length} radio stations`);
    return stations;
  } catch (error) {
    console.error('Failed to load stations:', error);
    
    // Fallback: Return a few demo stations if API fails
    return [
      {
        uuid: 'demo-1',
        name: 'BBC Radio 1',
        url: 'https://stream.bbcradio1.com/live',
        country: 'United Kingdom',
        genre: 'Popular',
        latitude: 51.5074,
        longitude: -0.1278,
        votes: 1000,
        favicon: '',
        bitrate: 128,
        language: 'English'
      },
      {
        uuid: 'demo-2',
        name: 'France Musique',
        url: 'https://direct.francemusique.fr/live/francemusique-hifi.m3u8',
        country: 'France',
        genre: 'Classical',
        latitude: 48.8566,
        longitude: 2.3522,
        votes: 800,
        favicon: '',
        bitrate: 192,
        language: 'French'
      },
      {
        uuid: 'demo-3',
        name: 'NHK World',
        url: 'https://nhkworld.webcdn.stream.ne.jp/www11/nhkworld-tv/6c327e45-ja/m3u8/english/english.m3u8',
        country: 'Japan',
        genre: 'News',
        latitude: 35.6762,
        longitude: 139.6503,
        votes: 600,
        favicon: '',
        bitrate: 64,
        language: 'English'
      }
    ];
  }
}
