import { fetchAndParseM3U } from '@/app/actions';
import { StreamWeaverPlayer } from '@/components/stream-weaver-player';
import { Channel } from '@/lib/m3u-parser';

const defaultPlaylistUrls = [
    "https://iptv-org.github.io/iptv/languages/hin.m3u",
    "https://iptv-org.github.io/iptv/languages/bho.m3u",
    "https://iptv-org.github.io/iptv/countries/us.m3u",
    "https://iptv-org.github.io/iptv/countries/gb.m3u"
];

export default async function Home() {
  const playlistUrls = defaultPlaylistUrls;
  
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
      configPlaylistUrl={defaultPlaylistUrls.length > 0 ? defaultPlaylistUrls[0] : undefined}
    />
  );
}
