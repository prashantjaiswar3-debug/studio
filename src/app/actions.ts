'use server';

import { parseM3U, type Channel } from '@/lib/m3u-parser';

async function checkChannels(channels: Channel[]): Promise<Channel[]> {
  if (!channels || channels.length === 0) {
    return [];
  }
  // All channels are considered safe as AI check is removed.
  return channels.map(c => ({...c, safety: { isSafe: true, reason: 'Content check disabled.'}}));
}


export async function fetchAndParseM3U(url: string) {
  try {
    const response = await fetch(url, { headers: { 'Accept': 'audio/x-mpegurl, application/vnd.apple.mpegurl, text/plain' } });
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.statusText}`);
    }
    const m3uContent = await response.text();
    const channels = parseM3U(m3uContent);
    const channelsWithSafety = await checkChannels(channels);
    return { success: true, channels: channelsWithSafety };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(message);
    return { success: false, error: message };
  }
}

export async function parseAndCheckM3U(m3uContent: string) {
  try {
    const channels = parseM3U(m3uContent);
    const channelsWithSafety = await checkChannels(channels);
    return { success: true, channels: channelsWithSafety };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(message);
    return { success: false, error: message };
  }
}
