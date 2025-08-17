'use client';

import type { Channel } from '@/lib/m3u-parser';
import { fetchAndParseM3U, parseAndCheckM3U } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Clapperboard,
  Link,
  List,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  Search,
  Shield,
  ShieldAlert,
  Upload,
  Volume2,
  VolumeX,
  X,
  ArrowDownAZ,
  ArrowUpAZ,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar';
import { Slider } from './ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';

type SortOption = 'default' | 'name-asc' | 'name-desc';

interface StreamWeaverPlayerProps {
  initialChannels: Channel[];
  initialError?: string;
  samplePlaylistUrl: string;
}

export function StreamWeaverPlayer({
  initialChannels,
  initialError,
  samplePlaylistUrl,
}: StreamWeaverPlayerProps) {
  const [channels, setChannels] = React.useState<Channel[]>(initialChannels);
  const [selectedChannel, setSelectedChannel] = React.useState<Channel | null>(null);
  const [playlistUrl, setPlaylistUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  const [sort, setSort] = React.useState<SortOption>('default');
  const { toast } = useToast();

  React.useEffect(() => {
    if (initialError) {
      toast({
        variant: 'destructive',
        title: 'Failed to load sample playlist',
        description: initialError,
      });
    }
  }, [initialError, toast]);

  const handleUrlLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl) return;
    setIsLoading(true);
    setSelectedChannel(null);
    const result = await fetchAndParseM3U(playlistUrl);
    if (result.success) {
      setChannels(result.channels);
      toast({ title: 'Playlist loaded successfully', description: `${result.channels.length} channels found.` });
    } else {
      toast({ variant: 'destructive', title: 'Error loading playlist', description: result.error });
      setChannels([]);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setSelectedChannel(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const result = await parseAndCheckM3U(content);
      if (result.success) {
        setChannels(result.channels);
        toast({ title: 'Playlist loaded successfully', description: `${result.channels.length} channels found.` });
      } else {
        toast({ variant: 'destructive', title: 'Error parsing file', description: result.error });
        setChannels([]);
      }
      setIsLoading(false);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const loadSamplePlaylist = async () => {
    setIsLoading(true);
    setPlaylistUrl(samplePlaylistUrl);
    setSelectedChannel(null);
    const result = await fetchAndParseM3U(samplePlaylistUrl);
    if (result.success) {
      setChannels(result.channels);
      toast({ title: 'Sample playlist loaded' });
    } else {
      toast({ variant: 'destructive', title: 'Error loading sample playlist', description: result.error });
      setChannels([]);
    }
    setIsLoading(false);
  };

  const processedChannels = React.useMemo(() => {
    let processed = [...channels];
    if (filter) {
      processed = processed.filter(
        (c) =>
          c.name.toLowerCase().includes(filter.toLowerCase()) ||
          c.group?.toLowerCase().includes(filter.toLowerCase())
      );
    }
    if (sort === 'name-asc') {
      processed.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name-desc') {
      processed.sort((a, b) => b.name.localeCompare(a.name));
    }
    return processed;
  }, [channels, filter, sort]);

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Clapperboard className="text-primary" size={28} />
            <h1 className="text-xl font-bold group-data-[collapsible=icon]:hidden">StreamWeaver</h1>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-0">
          <div className="flex flex-col gap-4 p-2">
            <form onSubmit={handleUrlLoad} className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
              <div className="relative">
                <Link className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="M3U Playlist URL"
                  className="pl-8"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && !playlistUrl ? '...' : 'Load from URL'}
              </Button>
            </form>

            <div className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
              <div className="relative flex items-center">
                 <Separator/>
                 <span className="absolute left-1/2 -translate-x-1/2 bg-sidebar px-2 text-xs text-muted-foreground">OR</span>
              </div>
              <Button asChild variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload M3U File
                  <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".m3u,.m3u8" />
                </label>
              </Button>
            </div>
            
            <div className="group-data-[collapsible=icon]:hidden">
             <Button variant="secondary" className="w-full" onClick={loadSamplePlaylist}>
                <List className="mr-2 h-4 w-4" /> Load Sample Playlist
              </Button>
            </div>
          </div>
          <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
          <div className="relative p-2 group-data-[collapsible=icon]:hidden flex items-center gap-2">
            <div className='relative flex-grow'>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter channels..." className="pl-8" value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <ArrowDownAZ className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                  <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ScrollArea className="flex-1 group-data-[collapsible=icon]:hidden">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : processedChannels.length > 0 ? (
                processedChannels.map((channel, index) => (
                  <button
                    key={`${channel.url}-${index}`}
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      'w-full text-left p-2 rounded-md flex items-center gap-3 transition-colors text-sm',
                      selectedChannel?.url === channel.url
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-sidebar-accent'
                    )}
                  >
                    <Image
                      src={channel.logo || `https://placehold.co/40x40/1A1A1A/F0F8FF.png?text=${channel.name.charAt(0)}`}
                      alt={channel.name}
                      width={40}
                      height={40}
                      className="rounded-md bg-muted object-cover h-10 w-10"
                      unoptimized // For external SVGs or logos
                    />
                    <span className="flex-1 truncate font-medium">{channel.name}</span>
                  </button>
                ))
              ) : (
                <div className="text-center text-muted-foreground p-8 text-sm">No channels found.</div>
              )}
            </div>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen w-full flex-col bg-background">
          <header className="flex items-center gap-4 p-2 border-b">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="font-semibold text-lg truncate">
                {selectedChannel ? selectedChannel.name : 'Welcome to StreamWeaver'}
              </h2>
              {selectedChannel?.group && <p className="text-xs text-muted-foreground">{selectedChannel.group}</p>}
            </div>
          </header>
          <main className="flex-1 flex items-center justify-center bg-black">
            {selectedChannel ? (
              <VideoPlayer key={selectedChannel.url} channel={selectedChannel} />
            ) : (
              <ChannelDashboard channels={processedChannels} onSelectChannel={setSelectedChannel} />
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function VideoPlayer({ channel }: { channel: Channel }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = React.useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadVideo = async () => {
        try {
            // HLS support check
            if (channel.url.includes('.m3u8')) {
                // Native HLS support is limited. For broader compatibility, a library like HLS.js is needed.
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                  video.src = channel.url;
                } else {
                  console.warn("HLS playback not supported by this browser without a library like HLS.js.");
                  // Here you would typically load HLS.js if it's included in the project
                  // For now, we'll just set the src and let the browser handle it.
                   video.src = channel.url;
                }
            } else {
              video.src = channel.url;
            }
            await video.play();
        } catch(e) {
             console.error("Autoplay was prevented:", e);
             setIsPlaying(false);
        }
    }
    loadVideo();
    handleMouseMove();


    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
        if(video.duration) {
            setProgress((video.currentTime / video.duration) * 100);
        } else {
            setProgress(0); // Live stream
        }
    };
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('volumechange', onVolumeChange);
    document.addEventListener('fullscreenchange', onFullScreenChange);
    
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('volumechange', onVolumeChange);
      document.removeEventListener('fullscreenchange', onFullScreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [channel.url, handleMouseMove]);

  const togglePlay = () => {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
          videoRef.current.play().catch(e => console.error("Play failed:", e));
      } else {
          videoRef.current.pause();
      }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
        const newVolume = value[0];
        videoRef.current.volume = newVolume;
        videoRef.current.muted = newVolume === 0;
    }
  }
  const toggleMute = () => {
    if(videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
    }
  }
  const toggleFullScreen = () => {
    const playerElement = videoRef.current?.parentElement;
    if (!playerElement) return;

    if (!isFullScreen) {
      playerElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };
   const seek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!videoRef.current || !videoRef.current.duration) return; // Cannot seek on live streams
    const rect = e.currentTarget.getBoundingClientRect();
    const seekTime = ((e.clientX - rect.left) / rect.width) * videoRef.current.duration;
    videoRef.current.currentTime = seekTime;
  };

  return (
    <div className="w-full h-full relative group/player bg-black" onMouseMove={handleMouseMove}>
      <video ref={videoRef} className="w-full h-full object-contain" onClick={togglePlay} />

      <div className={cn("absolute inset-0 bg-black/20 transition-opacity", showControls ? "opacity-100" : "opacity-0", "group-hover/player:opacity-100")}>
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
            { videoRef.current?.duration &&
              <div className="w-full cursor-pointer" onClick={seek}>
                  <div className="w-full bg-white/20 h-1 rounded-full">
                    <div className="bg-primary h-1 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>
            }
            <div className="flex items-center gap-4 text-white">
                <Button variant="ghost" size="icon" onClick={togglePlay}>
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
                <div className="flex items-center gap-2 group/volume">
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted || volume === 0 ? <VolumeX /> : <Volume2 />}
                    </Button>
                    <Slider
                      defaultValue={[1]}
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.05}
                      onValueChange={handleVolumeChange}
                      className="w-24 opacity-0 group-hover/volume:opacity-100 transition-opacity"
                    />
                </div>
                <div className="flex-1" />
                <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
                    {isFullScreen ? <Minimize /> : <Maximize />}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

function ChannelDashboard({ channels, onSelectChannel }: { channels: Channel[], onSelectChannel: (channel: Channel) => void }) {
  if (channels.length === 0) {
    return (
        <div className="text-center text-muted-foreground">
          <Clapperboard size={64} className="mx-auto text-primary" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">No channels to display</h2>
          <p className="mt-2">Load a playlist or adjust your filter.</p>
        </div>
    );
  }

  return (
    <div className='w-full h-full bg-background'>
    <ScrollArea className="h-full">
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {channels.map((channel, index) => (
          <Card 
            key={`${channel.url}-${index}`}
            className="overflow-hidden cursor-pointer group hover:border-primary transition-all"
            onClick={() => onSelectChannel(channel)}
          >
            <CardContent className="p-0 flex flex-col items-center justify-center aspect-square relative">
               <Image
                  src={channel.logo || `https://placehold.co/150x150/1A1A1A/F0F8FF.png?text=${channel.name.charAt(0)}`}
                  alt={channel.name}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  unoptimized
                />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                 <h3 className="text-white font-bold text-sm truncate">{channel.name}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="text-center text-muted-foreground">
      <Clapperboard size={64} className="mx-auto text-primary" />
      <h2 className="mt-4 text-2xl font-bold text-foreground">Welcome to StreamWeaver</h2>
      <p className="mt-2">Select a channel from the list to start watching.</p>
      <p>Load a new playlist using the options in the sidebar.</p>
    </div>
  );
}
