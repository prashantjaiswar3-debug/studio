import { fetchAndParseM3U } from '@/app/actions';
import { StreamWeaverPlayer } from '@/components/stream-weaver-player';
import fs from 'fs';
import path from 'path';

interface AppConfig {
  defaultPlaylistUrl?: string;
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

const SAMPLE_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';

export default async function Home() {
  const config = loadConfig();
  const playlistUrl = config.defaultPlaylistUrl || SAMPLE_PLAYLIST_URL;
  
  const initialData = await fetchAndParseM3U(playlistUrl);

  return (
    <StreamWeaverPlayer
      initialChannels={initialData.success ? initialData.channels : []}
      initialError={!initialData.success ? initialData.error : undefined}
      samplePlaylistUrl={SAMPLE_PLAYLIST_URL}
      configPlaylistUrl={config.defaultPlaylistUrl}
    />
  );
}
