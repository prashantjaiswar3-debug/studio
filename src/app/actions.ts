'use server';

import { parseM3U, type Channel } from '@/lib/m3u-parser';
import { contentCheckFlow } from '@/ai/flows/contentChecker';

async function checkChannels(channels: Channel[]): Promise<Channel[]> {
  if (!channels || channels.length === 0) {
    return [];
  }
  try {
    const safetyChecks = channels.map(channel => 
      contentCheckFlow({ channelName: channel.name })
        .then(safety => ({ ...channel, safety }))
        .catch((e) => {
          console.error(`Content check failed for ${channel.name}:`, e);
          return { ...channel, safety: { isSafe: false, reason: 'Content check failed.' } };
        })
    );
    return await Promise.all(safetyChecks);
  } catch(e) {
    console.error('Error in checkChannels:', e);
    return channels.map(c => ({...c, safety: { isSafe: false, reason: 'Content checker service unavailable.'}}));
  }
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
