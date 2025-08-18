

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
  Upload,
  Volume2,
  VolumeX,
  ArrowDownAZ,
  Star,
  Tv,
  Settings,
  X,
  FileCog,
  Rewind,
  FastForward,
  PictureInPicture,
  History,
  EyeOff,
  Eye,
  AlertTriangle,
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
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type SortOption = 'default' | 'name-asc' | 'name-desc';
type ViewMode = 'dashboard' | 'epg';

interface StreamWeaverPlayerProps {
  initialChannels: Channel[];
  initialError?: string;
  samplePlaylistUrl: string;
  configPlaylistUrl?: string;
}

export function StreamWeaverPlayer({
  initialChannels,
  initialError,
  samplePlaylistUrl,
  configPlaylistUrl,
}: StreamWeaverPlayerProps) {
  const [channels, setChannels] = React.useState<Channel[]>(initialChannels);
  const [selectedChannel, setSelectedChannel] = React.useState<Channel | null>(null);
  const [playlistUrl, setPlaylistUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  const [sort, setSort] = React.useState<SortOption>('default');
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);
  const [recents, setRecents] = useLocalStorage<string[]>('recents', []);
  const [hidden, setHidden] = useLocalStorage<string[]>('hidden', []);
  const [category, setCategory] = React.useState('all');
  const [viewMode, setViewMode] = React.useState<ViewMode>('dashboard');
  const { toast } = useToast();
  const [lastM3uContent, setLastM3uContent] = useLocalStorage<string | null>('lastM3uContent', null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (initialError) {
      toast({
        variant: 'destructive',
        title: 'Failed to load initial playlist',
        description: initialError,
      });
    }
    
    if (isClient && lastM3uContent && initialChannels.length === 0) {
      const loadSavedPlaylist = async () => {
        setIsLoading(true);
        const result = await parseAndCheckM3U(lastM3uContent);
        if (result.success) {
          setChannels(result.channels);
          toast({ title: 'Loaded saved playlist from your browser' });
        } else {
          toast({ variant: 'destructive', title: 'Error loading saved playlist', description: result.error });
          setLastM3uContent(null);
        }
        setIsLoading(false);
      }
      loadSavedPlaylist();
    }
  }, [initialError, toast, lastM3uContent, setLastM3uContent, initialChannels.length, isClient]);
  
  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    if (!hidden.includes(channel.url)) {
      setRecents(prev => {
          const newRecents = [channel.url, ...prev.filter(u => u !== channel.url)];
          return newRecents.slice(0, 20); // Keep only last 20 recents
      });
    }
  }

  const handleUrlLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl) return;
    setIsLoading(true);
    setSelectedChannel(null);
    const result = await fetchAndParseM3U(playlistUrl);
    if (result.success) {
      setChannels(result.channels);
      // We can't save the content from URL due to CORS, so we clear the local M3U
      setLastM3uContent(null);
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
      setLastM3uContent(content); // Save to local storage
      const result = await parseAndCheckM3U(content);
      if (result.success) {
        setChannels(result.channels);
        toast({ title: 'Playlist loaded and saved locally', description: `${result.channels.length} channels found.` });
      } else {
        toast({ variant: 'destructive', title: 'Error parsing file', description: result.error });
        setChannels([]);
        setLastM3uContent(null);
      }
      setIsLoading(false);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };
  
  const loadPlaylistFromUrl = async (url: string, message: string) => {
    setIsLoading(true);
    setPlaylistUrl(url);
    setSelectedChannel(null);
    const result = await fetchAndParseM3U(url);
    if (result.success) {
      setChannels(result.channels);
      setLastM3uContent(null);
      toast({ title: message });
    } else {
      toast({ variant: 'destructive', title: `Error loading ${message.toLowerCase()}`, description: result.error });
      setChannels([]);
    }
    setIsLoading(false);
  };

  const loadSamplePlaylist = () => loadPlaylistFromUrl(samplePlaylistUrl, 'Sample playlist loaded');
  const loadConfigPlaylist = () => {
    if (configPlaylistUrl) {
      loadPlaylistFromUrl(configPlaylistUrl, 'Configured playlist loaded');
    }
  };
  
  const toggleFavorite = (channelUrl: string) => {
    setFavorites(prev => 
      prev.includes(channelUrl) 
        ? prev.filter(url => url !== channelUrl)
        : [...prev, channelUrl]
    );
  };
  
  const toggleHidden = (channelUrl: string) => {
    setHidden(prev => 
      prev.includes(channelUrl) 
        ? prev.filter(url => url !== channelUrl)
        : [...prev, channelUrl]
    );
  };

  const categories = React.useMemo(() => {
    const groups = new Set(channels.map(c => c.group || 'uncategorized').filter(Boolean) as string[]);
    const specialCategories = ['all', 'favorites'];
    if (isClient && recents.length > 0) {
        specialCategories.push('recents');
    }
    if (isClient && hidden.length > 0) {
        specialCategories.push('hidden');
    }
    return [...specialCategories, ...Array.from(groups).sort()];
  }, [channels, recents, hidden, isClient]);

  const processedChannels = React.useMemo(() => {
    let processed = [...channels];
    
    if (category === 'hidden') {
      processed = processed.filter(c => hidden.includes(c.url));
    } else {
      processed = processed.filter(c => !hidden.includes(c.url));
      
      if (category === 'favorites') {
        processed = processed.filter(c => favorites.includes(c.url));
      } else if (category === 'recents') {
          if (isClient) {
            processed = recents.map(url => channels.find(c => c.url === url)).filter((c): c is Channel => !!c && !hidden.includes(c.url));
          } else {
            processed = [];
          }
      } else if (category !== 'all') {
        processed = processed.filter(c => (c.group || 'uncategorized') === category);
      }
    }

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
  }, [channels, filter, sort, category, favorites, recents, hidden, isClient]);
  
  const dashboardChannels = React.useMemo(
    () => channels.filter(c => !hidden.includes(c.url)),
    [channels, hidden]
  );


  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Clapperboard className="text-primary" size={28} />
            <h1 className="text-xl font-bold group-data-[collapsible=icon]:hidden">StreamWeaver</h1>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-0 flex flex-col">
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
            
            <div className="group-data-[collapsible=icon]:hidden flex flex-col gap-2">
              {configPlaylistUrl && (
                <Button variant="secondary" className="w-full" onClick={loadConfigPlaylist}>
                  <FileCog className="mr-2 h-4 w-4" /> Load from Setup File
                </Button>
              )}
             <Button variant="secondary" className="w-full" onClick={loadSamplePlaylist}>
                <List className="mr-2 h-4 w-4" /> Load Sample Playlist
              </Button>
            </div>
          </div>
          <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
          
          <div className="p-2 space-y-2 group-data-[collapsible=icon]:hidden">
            <div className='relative flex-grow'>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter channels..." className="pl-8" value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <ArrowDownAZ className="mr-2 h-4 w-4" />
                    <span className="capitalize">
                      Sort: {sort === 'default' ? 'Default' : sort === 'name-asc' ? 'Name (A-Z)' : 'Name (Z-A)'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
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
          </div>

          <div className="group-data-[collapsible=icon]:hidden px-2 pb-2">
            <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1">Categories</h3>
            <ScrollArea className="h-32">
              <div className="space-y-1 p-1">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? 'secondary' : 'ghost'}
                    className="w-full justify-start capitalize"
                    onClick={() => setCategory(cat)}
                  >
                    {cat === 'favorites' && <Star className="mr-2 h-4 w-4" />}
                    {cat === 'recents' && <History className="mr-2 h-4 w-4" />}
                    {cat === 'hidden' && <EyeOff className="mr-2 h-4 w-4" />}
                    {cat}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator className="group-data-[collapsible=icon]:hidden" />

          <ScrollArea className="flex-1 group-data-[collapsible=icon]:hidden">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : processedChannels.length > 0 ? (
                processedChannels.map((channel, index) => {
                  const isFavorite = isClient && favorites.includes(channel.url);
                  const isHidden = isClient && hidden.includes(channel.url);
                  return (
                    <div
                      key={`${channel.url}-${index}`}
                      onClick={() => handleSelectChannel(channel)}
                      className={cn(
                        'w-full text-left p-2 rounded-md flex items-center gap-2 transition-colors text-sm group/item cursor-pointer',
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
                        unoptimized
                      />
                      <span className="flex-1 truncate font-medium">{channel.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          'h-8 w-8 shrink-0 transition-opacity',
                          isFavorite || isHidden ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100',
                          category !== 'hidden' && 'hover:opacity-100'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(channel.url);
                        }}
                      >
                        <Star className={cn('h-5 w-5', isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 shrink-0 opacity-0 group-hover/item:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHidden(channel.url);
                        }}
                      >
                        {isHidden ? <Eye className="h-5 w-5 text-muted-foreground" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
                      </Button>
                    </div>
                  );
                })
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
            {selectedChannel && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleFavorite(selectedChannel.url)}
                  >
                    <Star className={cn('h-6 w-6', isClient && favorites.includes(selectedChannel.url) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedChannel(null)}
                    aria-label="Close player"
                  >
                    <X className='h-6 w-6' />
                  </Button>
                </>
            )}
          </header>
          <main className="flex-1 flex flex-col bg-black">
            {selectedChannel ? (
              <VideoPlayer key={selectedChannel.url} channel={selectedChannel} />
            ) : (
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full flex-1 flex flex-col">
                <div className="p-2 bg-background border-b">
                  <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="epg">EPG</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="dashboard" className="flex-1 m-0">
                  <ChannelDashboard 
                    channels={dashboardChannels} 
                    onSelectChannel={handleSelectChannel} 
                    allChannels={channels} 
                    recents={recents} 
                    isClient={isClient}
                    filter={filter}
                    onFilterChange={setFilter}
                  />
                </TabsContent>
                <TabsContent value="epg" className="flex-1 m-0">
                  <EpgView channels={channels} />
                </TabsContent>
              </Tabs>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  return `${mm}:${ss}`;
};

function VideoPlayer({ channel }: { channel: Channel }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const playerRef = React.useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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
            setError(null);
            if (channel.url.includes('.m3u8')) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                  video.src = channel.url;
                } else {
                  console.warn("HLS playback not supported by this browser without a library like HLS.js.");
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
        if(video.duration && isFinite(video.duration)) {
            setProgress((video.currentTime / video.duration) * 100);
            setCurrentTime(video.currentTime);
        } else {
            setProgress(0);
            setCurrentTime(video.currentTime)
        }
    };
    const onDurationChange = () => {
        if (video.duration && isFinite(video.duration)) {
            setDuration(video.duration);
        }
    };
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const onFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    const onError = (e: Event) => {
        const videoElement = e.target as HTMLVideoElement;
        const mediaError = videoElement.error;
        let errorMessage = 'An unknown error occurred.';
        if (mediaError) {
          switch (mediaError.code) {
            case mediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'The video playback was aborted.';
              break;
            case mediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'A network error caused the video download to fail.';
              break;
            case mediaError.MEDIA_ERR_DECODE:
              errorMessage = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
              break;
            case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
              break;
          }
        }
        setError(errorMessage);
    }

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('error', onError);
    document.addEventListener('fullscreenchange', onFullScreenChange);
    
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('error', onError);
      document.removeEventListener('fullscreenchange', onFullScreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [channel.url, handleMouseMove]);
  
  React.useEffect(() => {
    if(videoRef.current) {
        videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
      if (!videoRef.current || error) return;
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
    const playerElement = playerRef.current;
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
    if (!videoRef.current || !duration || !isFinite(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const seekTime = ((e.clientX - rect.left) / rect.width) * duration;
    videoRef.current.currentTime = seekTime;
  };
  
  const handleSeek = (seconds: number) => {
    if (videoRef.current && duration && isFinite(duration)) {
        videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };
  
  const togglePip = async () => {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
    } else {
        if (document.pictureInPictureEnabled) {
            await videoRef.current.requestPictureInPicture();
        } else {
            console.error("Picture-in-Picture is not enabled in this browser.");
        }
    }
  }
  
  const isLiveStream = !duration || !isFinite(duration);

  return (
    <div ref={playerRef} className="w-full h-full relative group/player bg-black" onMouseMove={handleMouseMove}>
      <video ref={videoRef} className="w-full h-full object-contain" onClick={togglePlay} />

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-bold mb-2">Error Loading Channel</h3>
          <p className="text-center text-muted-foreground">{error}</p>
        </div>
      )}

      <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300", 
          showControls && !error ? "opacity-100" : "opacity-0", 
          "group-hover/player:opacity-100"
        )}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
            {!isLiveStream &&
              <div className="w-full cursor-pointer group/progress" onClick={seek}>
                  <div className="w-full bg-white/20 h-1 rounded-full relative group-hover/progress:h-2 transition-all duration-200">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }}></div>
                    <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary opacity-0 group-hover/progress:opacity-100 transition-opacity" style={{ left: `${progress}%` }}></div>
                  </div>
              </div>
            }
            <div className="flex items-center gap-4 text-white">
                <Button variant="ghost" size="icon" onClick={() => handleSeek(-10)} disabled={isLiveStream}>
                    <Rewind size={24} />
                </Button>
                <Button variant="ghost" size="icon" onClick={togglePlay}>
                  {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSeek(10)} disabled={isLiveStream}>
                    <FastForward size={24} />
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
                      className="w-24 opacity-0 group-hover/volume:opacity-100 transition-opacity duration-200"
                    />
                </div>
                {!isLiveStream ? (
                   <div className="text-sm font-mono">
                       {formatTime(currentTime)} / {formatTime(duration)}
                   </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-sm font-medium">LIVE</span>
                        <div className="text-sm font-mono">
                           {formatTime(currentTime)}
                       </div>
                    </div>
                 )}
                <div className="flex-1" />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Settings />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Playback Speed</h4>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {playbackRate}x
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuRadioGroup value={String(playbackRate)} onValueChange={(val) => setPlaybackRate(Number(val))}>
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                                <DropdownMenuRadioItem key={rate} value={String(rate)}>{rate}x</DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {document.pictureInPictureEnabled && (
                    <Button variant="ghost" size="icon" onClick={togglePip}>
                        <PictureInPicture />
                    </Button>
                )}
                
                <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
                    {isFullScreen ? <Minimize /> : <Maximize />}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

function ChannelDashboard({ channels, onSelectChannel, allChannels, recents, isClient, filter, onFilterChange }: { channels: Channel[], onSelectChannel: (channel: Channel) => void, allChannels: Channel[], recents: string[], isClient: boolean, filter: string, onFilterChange: (filter: string) => void }) {
  const recentlyWatchedChannels = React.useMemo(() => {
    if (!isClient) return [];
    return recents.map(url => allChannels.find(c => c.url === url)).filter((c): c is Channel => !!c);
  }, [allChannels, recents, isClient]);
  
  const groupedChannels = React.useMemo(() => {
    const filteredChannels = channels.filter(
      (c) =>
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.group?.toLowerCase().includes(filter.toLowerCase())
    );

    return filteredChannels.reduce((acc, channel) => {
      const groupName = channel.group || 'Uncategorized';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(channel);
      return acc;
    }, {} as Record<string, Channel[]>);
  }, [channels, filter]);

  const channelsExist = channels.length > 0;
  const filterHasResults = Object.keys(groupedChannels).length > 0;

  if (!channelsExist && !filter) {
    return (
        <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
          <Clapperboard size={64} className="mx-auto text-primary" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">No channels to display</h2>
          <p className="mt-2">Load a playlist to get started.</p>
        </div>
    );
  }

  return (
    <div className='w-full h-full bg-background flex flex-col'>
        <div className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search all channels..." 
                    className="pl-10 h-12 text-lg" 
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                />
            </div>
        </div>
      <ScrollArea className="h-full flex-1">
        <div className="p-4 space-y-8">
            {isClient && recentlyWatchedChannels.length > 0 && !filter && (
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 capitalize">Recently Watched</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                        {recentlyWatchedChannels.map((channel, index) => (
                          <Card 
                            key={`${channel.url}-${index}-recent`}
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
                </div>
            )}
          {filterHasResults ? (
            Object.entries(groupedChannels).map(([groupName, groupChannels]) => (
                <div key={groupName}>
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 capitalize">{groupName}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                    {groupChannels.map((channel, index) => (
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
                </div>
          ))
        ) : (
            <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center py-16">
              <Search size={64} className="mx-auto text-primary" />
              <h2 className="mt-4 text-2xl font-bold text-foreground">No channels found</h2>
              <p className="mt-2">Try adjusting your search or filter.</p>
            </div>
        )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EpgView({ channels }: { channels: Channel[] }) {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

  if (channels.length === 0) {
    return (
      <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center p-4">
        <Tv size={64} className="mx-auto text-primary" />
        <h2 className="mt-4 text-2xl font-bold text-foreground">EPG is Empty</h2>
        <p className="mt-2 max-w-md mx-auto">
            Load a playlist to see the program guide. Full EPG functionality also requires an XMLTV data source, which is not yet implemented.
        </p>
      </div>
    );
  }

  return (
      <div className="h-full flex flex-col bg-background">
          <div className="flex-none p-4 border-b">
              <h2 className="text-xl font-bold">Electronic Program Guide</h2>
          </div>
          <div className="flex-1 overflow-auto">
              <div className="relative grid gap-x-2" style={{ gridTemplateColumns: `10rem repeat(${hours.length}, 15rem)` }}>
                  {/* Channel Headers (Sticky) */}
                  <div className="sticky left-0 top-0 z-20 bg-background/95 backdrop-blur-sm">
                      <div className="h-16 flex items-center justify-center font-semibold border-b border-r">Channels</div>
                      {channels.slice(0, 20).map(channel => (
                          <div key={channel.url} className="h-20 flex items-center px-2 border-b border-r">
                                <Image
                                    src={channel.logo || `https://placehold.co/40x40/1A1A1A/F0F8FF.png?text=${channel.name.charAt(0)}`}
                                    alt={channel.name}
                                    width={40} height={40} className="rounded-md object-cover mr-2" unoptimized/>
                              <span className="truncate font-medium">{channel.name}</span>
                          </div>
                      ))}
                  </div>

                  {/* Timeline Header */}
                  {hours.map(hour => (
                      <div key={hour} className="h-16 flex items-center justify-center font-semibold border-b">
                          {`${String(hour).padStart(2, '0')}:00`}
                      </div>
                  ))}
                  
                  {/* Current Time Indicator */}
                   <div 
                        className="absolute top-0 z-10 h-full w-0.5 bg-red-500" 
                        style={{ left: `calc(10rem + ${currentHour * 15}rem + ${(currentMinute / 60) * 15}rem)`}}
                    >
                       <div className="absolute -top-1 -left-1.5 h-4 w-4 rounded-full bg-red-500" />
                   </div>

                  {/* Program Grid */}
                  {channels.slice(0, 20).map(channel => (
                    <React.Fragment key={`${channel.url}-programs`}>
                        {hours.map(hour => (
                            <div key={`${channel.url}-${hour}`} className="h-20 p-1 border-b">
                                <div className="bg-muted/50 rounded-md h-full w-full p-2 text-sm text-muted-foreground flex flex-col justify-center">
                                    <p className="font-bold text-foreground truncate">Program Title Placeholder</p>
                                    <p className="text-xs truncate">EPG Data not available</p>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                  ))}

                  {/* Ghost elements for grid layout */}
                  <div className="sticky left-0 top-0 z-20 bg-transparent" />
                  {hours.map(hour => <div key={`ghost-${hour}`} />)}
              </div>
          </div>
          {channels.length > 20 && (
              <div className="flex-none text-center p-4 text-muted-foreground border-t">
                  Showing first 20 channels. Full EPG view is a proof-of-concept.
              </div>
          )}
      </div>
  );
}
