import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Music, Loader2, AlertCircle, ExternalLink, SkipBack, Play, Pause, SkipForward, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

interface MusicData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

interface SearchResult {
  title: string;
  artist: string;
  url: string;
  image: string;
}

export const MusicWidget = ({ className }: { className?: string }) => {
  const [data, setData] = useState<MusicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search States
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch("/api/lastfm/now-playing", {
          headers: {
            "Authorization": `Bearer ${session?.access_token}`
          }
        });
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch music status");
        }
        
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/lastfm/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          "Authorization": `Bearer ${session?.access_token}`
        }
      });
      const results = await response.json();
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  if (loading) {
    return (
      <div className={cn("flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-white/5 bg-zinc-900/50", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-red-500" />
      </div>
    );
  }

  if (error || !data) {
    const isConfigError = error?.includes("configured") || !data;
    return (
      <div className={cn("flex h-full min-h-[240px] flex-col items-center justify-center gap-2 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center", className)}>
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-400">{isConfigError ? "Last.fm Config Required" : "Music Error"}</p>
        <p className="text-xs text-zinc-500 text-balance">
          {error || "Add LASTFM_API_KEY and LASTFM_USERNAME to Secrets"}
        </p>
        {isConfigError && (
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black p-6 transition-all hover:border-red-500/30 shadow-sm dark:shadow-none",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Music className={cn("h-4 w-4", data.isPlaying && "animate-pulse")} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {data.isPlaying ? "Now Playing" : "Recently Played"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="text-zinc-500 hover:text-red-500 transition-colors"
            >
              {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
            {data.songUrl && (
              <a 
                href={data.songUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-red-500 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div className="relative mt-4 flex-1">
          <AnimatePresence mode="wait">
            {showSearch ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-3"
              >
                <form onSubmit={handleSearch} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a song..."
                    className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 px-4 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-red-500" />
                  )}
                </form>
                
                <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                  {searchResults.map((track, i) => (
                    <a
                      key={i}
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors group/item"
                    >
                      <img src={track.image || "https://picsum.photos/40/40?grayscale"} className="h-8 w-8 rounded-md object-cover" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-medium text-white group-hover/item:text-red-500">{track.title}</p>
                        <p className="truncate text-[10px] text-zinc-500">{track.artist}</p>
                      </div>
                    </a>
                  ))}
                  {searchQuery && searchResults.length === 0 && !isSearching && (
                    <p className="text-center text-[10px] text-zinc-600 py-2 italic">No results found.</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="player"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col"
              >
                {data.title ? (
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl shadow-2xl">
                      <img 
                        src={data.albumImageUrl || "https://picsum.photos/200/200?grayscale"} 
                        alt={data.album} 
                        className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-110", data.isPlaying && "animate-[spin_20s_linear_infinite]")}
                        referrerPolicy="no-referrer"
                      />
                      {data.isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                          <div className="flex items-end gap-1">
                            <div className="h-3 w-1 animate-[music-bar_0.8s_ease-in-out_infinite] bg-red-500" />
                            <div className="h-5 w-1 animate-[music-bar_1.2s_ease-in-out_infinite] bg-red-500" />
                            <div className="h-4 w-1 animate-[music-bar_1s_ease-in-out_infinite] bg-red-500" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="truncate text-lg font-bold text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">
                        {data.title}
                      </h3>
                      <p className="truncate text-sm text-zinc-400">{data.artist}</p>
                      <p className="mt-1 truncate text-[10px] text-zinc-600 italic">{data.album}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-sm text-zinc-500 italic">Not listening to anything right now.</p>
                  </div>
                )}

                {/* Playback Controls (Visual Only) */}
                <div className="mt-6 flex items-center justify-center gap-6">
                  <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <SkipBack className="h-5 w-5 fill-current" />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-transform">
                    {data.isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-1" />}
                  </button>
                  <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <SkipForward className="h-5 w-5 fill-current" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-zinc-800 overflow-hidden">
            {data.isPlaying && (
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                className="h-full bg-red-500" 
              />
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-600">
            {data.isPlaying ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Brand Glow */}
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-red-500/5 blur-3xl transition-colors group-hover:bg-red-500/10" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.5);
        }
      `}} />
    </motion.div>
  );
};
