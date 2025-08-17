import { fetchAndParseM3U } from '@/app/actions';
import { StreamWeaverPlayer } from '@/components/stream-weaver-player';

const SAMPLE_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';

export default async function Home() {
  const initialData = await fetchAndParseM3U(SAMPLE_PLAYLIST_URL);

  return (
    <StreamWeaverPlayer
      initialChannels={initialData.success ? initialData.channels : []}
      initialError={!initialData.success ? initialData.error : undefined}
      samplePlaylistUrl={SAMPLE_PLAYLIST_URL}
    />
  );
}
