import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, Star, GitBranch, History, Loader2, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

interface Activity {
  id: string;
  type: string;
  repo: string;
  date: string;
  payload: any;
}

interface Language {
  name: string;
  count: number;
}

interface GithubStats {
  username: string;
  followers: number;
  following: number;
  totalRepos: number;
  totalStars: number;
  topLanguages: Language[];
  activity: Activity[];
}

export const GithubWidget = ({ className }: { className?: string }) => {
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"activity" | "languages">("activity");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch("/api/github/stats", {
          headers: {
            "Authorization": `Bearer ${session?.access_token}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch GitHub stats");
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={cn("flex h-full min-h-[300px] items-center justify-center rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={cn("flex h-full min-h-[300px] flex-col items-center justify-center gap-2 rounded-3xl border border-red-500/20 bg-red-50 dark:bg-red-500/5 p-6 text-center", className)}>
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-400">GitHub Token Required</p>
        <p className="text-xs text-zinc-500">Add GITHUB_PERSONAL_ACCESS_TOKEN to Secrets</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 transition-all hover:border-emerald-500/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 shadow-sm dark:shadow-none",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white ring-1 ring-zinc-200 dark:ring-white/10 group-hover:ring-emerald-500/50 transition-all">
              <Github className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">GitHub Stats</h3>
              <p className="text-xs text-zinc-500">@{stats.username}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{stats.followers}</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{stats.totalStars}</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Stars</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-zinc-50 dark:bg-white/5 p-3 ring-1 ring-zinc-200 dark:ring-white/5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Total Repos</p>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-emerald-500" />
              <span className="text-lg font-bold text-zinc-900 dark:text-white">{stats.totalRepos}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-zinc-50 dark:bg-white/5 p-3 ring-1 ring-zinc-200 dark:ring-white/5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Following</p>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-emerald-500" />
              <span className="text-lg font-bold text-zinc-900 dark:text-white">{stats.following}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-zinc-100 dark:border-white/5">
          <button 
            onClick={() => setActiveTab("activity")}
            className={cn(
              "pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors relative",
              activeTab === "activity" ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Recent Activity
            {activeTab === "activity" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
          <button 
            onClick={() => setActiveTab("languages")}
            className={cn(
              "pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors relative",
              activeTab === "languages" ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Top Languages
            {activeTab === "languages" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[180px]">
          <AnimatePresence mode="wait">
            {activeTab === "activity" ? (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-2"
              >
                {stats.activity.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1 rounded-xl bg-zinc-50 dark:bg-white/5 p-3 ring-1 ring-zinc-200 dark:ring-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                        {item.type.replace('Event', '')}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-1">{item.repo}</p>
                    {item.payload.commits && (
                      <p className="text-[10px] text-zinc-500 italic line-clamp-1">
                        "{item.payload.commits[0].message}"
                      </p>
                    )}
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="languages"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 py-2"
              >
                {stats.topLanguages.map((lang) => (
                  <div key={lang.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{lang.name}</span>
                      <span className="text-zinc-500">{lang.count} repos</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(lang.count / stats.totalRepos) * 100}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl transition-colors group-hover:bg-emerald-500/10" />
    </motion.div>
  );
};
