import { fetchAndParseM3U } from '@/app/actions';
import { StreamWeaverPlayer } from '@/components/stream-weaver-player';
import { Channel } from '@/lib/m3u-parser';
import fs from 'fs';
import path from 'path';

interface AppConfig {
  defaultPlaylistUrl?: string;
  defaultPlaylistUrls?: string[];
}

const loadConfig = (): AppConfig => {
  try {
    const configPath = path.join(process.cwd(), 'streamweaver.config.json');
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configFile);
    }
  } catch (error) {
    console.error('Error loading streamweaver.config.json:', error);
  }
  return {};
};

const SAMPLE_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/countries/us.m3u';

export default async function Home() {
  const config = loadConfig();
  const playlistUrls = config.defaultPlaylistUrls || (config.defaultPlaylistUrl ? [config.defaultPlaylistUrl] : [SAMPLE_PLAYLIST_URL]);
  
  let allChannels: Channel[] = [];
  let errorMessages: string[] = [];

  for (const url of playlistUrls) {
      const result = await fetchAndParseM3U(url);
      if (result.success) {
          allChannels = allChannels.concat(result.channels);
      } else {
          errorMessages.push(`Failed to load from ${url}: ${result.error}`);
      }
  }
  
  // Remove duplicate channels by URL
  const uniqueChannels = Array.from(new Map(allChannels.map(channel => [channel.url, channel])).values());


  return (
    <StreamWeaverPlayer
      initialChannels={uniqueChannels}
      initialError={errorMessages.length > 0 ? errorMessages.join('; ') : undefined}
      samplePlaylistUrl={SAMPLE_PLAYLIST_URL}
      configPlaylistUrl={config.defaultPlaylistUrl || (config.defaultPlaylistUrls ? config.defaultPlaylistUrls[0] : undefined)}
    />
  );
}
