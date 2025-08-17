export interface Channel {
  name: string;
  logo: string | null;
  group: string | null;
  url: string;
  raw: string;
  safety?: {
    isSafe: boolean;
    reason: string;
  };
}

export const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];

  if (!lines[0].trim().startsWith('#EXTM3U')) {
    console.warn('Playlist does not start with #EXTM3U');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const infoLine = line;
      let urlLine = '';
      
      // Find the next non-empty, non-comment line for the URL
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine && !nextLine.startsWith('#')) {
          urlLine = nextLine;
          i = j; // Move the outer loop cursor forward
          break;
        }
      }

      if (urlLine) {
        const name = (infoLine.split(',').pop() || '').trim();
        const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
        const groupMatch = infoLine.match(/group-title="([^"]*)"/);

        channels.push({
          name: name || 'Unnamed Channel',
          logo: logoMatch ? logoMatch[1] : null,
          group: groupMatch ? groupMatch[1].trim() : null,
          url: urlLine,
          raw: `${infoLine}\n${urlLine}`,
        });
      }
    }
  }
  return channels;
};
