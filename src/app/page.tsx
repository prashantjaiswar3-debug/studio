import { fetchAndParseM3U } from '@/app/actions';
import { StreamWeaverPlayer } from '@/components/stream-weaver-player';
import { Channel } from '@/lib/m3u-parser';
import fs from 'fs';
import path from 'path';

interface AppConfig {
  defaultPlaylistUrls?: string[];
}

const loadConfig = (): AppConfig => {
  try {
    const configPath = path.join(process.cwd(), 'src', 'streamweaver.config.json');
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configFile);
    }
  } catch (error) {
    console.error('Error loading streamweaver.config.json:', error);
  }
  return {};
};

export default async function Home() {
  const config = loadConfig();
  const playlistUrls = config.defaultPlaylistUrls || [];
  
  let allChannels: Channel[] = [];
  let errorMessages: string[] = [];

  if (playlistUrls.length > 0) {
      for (const url of playlistUrls) {
          const result = await fetchAndParseM3U(url);
          if (result.success) {
              allChannels = allChannels.concat(result.channels);
          } else {
              errorMessages.push(`Failed to load from ${url}: ${result.error}`);
          }
      }
  } else {
      errorMessages.push('Could not load any default remote playlists. Please provide a playlist URL.');
  }
  
  // Remove duplicate channels by URL
  const uniqueChannels = Array.from(new Map(allChannels.map(channel => [channel.url, channel])).values());


  return (
    <StreamWeaverPlayer
      initialChannels={uniqueChannels}
      initialError={errorMessages.length > 0 ? errorMessages.join('; ') : undefined}
      samplePlaylistUrl={'https://iptv-org.github.io/iptv/index.m3u'}
      configPlaylistUrl={config.defaultPlaylistUrls ? config.defaultPlaylistUrls[0] : undefined}
    />
  );
}
