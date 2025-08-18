import { fetchAndParseM3U, parseAndCheckM3U } from '@/app/actions';
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

const loadLocalPlaylist = async (): Promise<Channel[]> => {
    try {
        const localPlaylistPath = path.join(process.cwd(), 'public', 'playlist.m3u');
        if (fs.existsSync(localPlaylistPath)) {
            const m3uContent = fs.readFileSync(localPlaylistPath, 'utf-8');
            const result = await parseAndCheckM3U(m3uContent);
            if (result.success) {
                return result.channels;
            }
        }
    } catch (error) {
        console.error('Error loading local playlist.m3u:', error);
    }
    return [];
};

export default async function Home() {
  const config = loadConfig();
  const playlistUrls = config.defaultPlaylistUrls || (config.defaultPlaylistUrl ? [config.defaultPlaylistUrl] : []);
  
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
      // If no remote URLs, load the local playlist
      allChannels = await loadLocalPlaylist();
      if (allChannels.length === 0) {
          errorMessages.push('Could not load default remote playlists or local playlist.m3u. Please provide a playlist URL.');
      }
  }
  
  // Remove duplicate channels by URL
  const uniqueChannels = Array.from(new Map(allChannels.map(channel => [channel.url, channel])).values());


  return (
    <StreamWeaverPlayer
      initialChannels={uniqueChannels}
      initialError={errorMessages.length > 0 ? errorMessages.join('; ') : undefined}
      samplePlaylistUrl={'https://iptv-org.github.io/iptv/index.m3u'}
      configPlaylistUrl={config.defaultPlaylistUrl || (config.defaultPlaylistUrls ? config.defaultPlaylistUrls[0] : undefined)}
    />
  );
}
