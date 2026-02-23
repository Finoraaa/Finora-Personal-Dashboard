/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeProvider } from "./components/theme-provider";
import { Header } from "./components/Header";
import { motion } from "motion/react";
import { 
  Key, 
  Lock, 
  Activity, 
  Terminal, 
  Database, 
  ShieldCheck,
  Cpu,
  Github,
  Loader2
} from "lucide-react";
import { cn } from "./lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { GithubWidget } from "./components/widgets/GithubWidget";
import { MusicWidget } from "./components/widgets/MusicWidget";
import { WeatherWidget } from "./components/widgets/WeatherWidget";
import { MarketWidget } from "./components/widgets/MarketWidget";
import { TodoWidget } from "./components/widgets/TodoWidget";
import { SettingsModal } from "./components/widgets/SettingsModal";

const LoginScreen = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleGithubLogin = async () => {
    try {
      setIsConnecting(true);
      
      // Supabase'den giriş URL'sini al ama tarayıcıyı yönlendirme (skipBrowserRedirect)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        },
      });

      if (error) throw error;

      if (data?.url) {
        // URL'yi yeni bir pencerede aç
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        
        window.open(
          data.url,
          "supabase_oauth",
          `width=${width},height=${height},left=${left},top=${top}`
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-12 backdrop-blur-xl shadow-xl dark:shadow-none"
      >
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <ShieldCheck className={cn("h-10 w-10", isConnecting && "animate-pulse")} />
          </div>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
          {isConnecting ? "Redirecting..." : "Welcome to Finora"}
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          {isConnecting 
            ? "Taking you to GitHub for authentication." 
            : "Sign in with your GitHub account to access your premium developer dashboard."}
        </p>
        <button
          onClick={handleGithubLogin}
          disabled={isConnecting}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-semibold transition-all active:scale-95",
            isConnecting 
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed" 
              : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
          )}
        >
          {isConnecting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Github className="h-5 w-5" />
          )}
          {isConnecting ? "Please wait..." : "Continue with GitHub"}
        </button>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setLoading(false);
      setConfigError(true);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.error("Supabase session error:", err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
              <Lock className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Configuration Required</h1>
          <p className="text-zinc-400">
            Please add your Supabase credentials to the <strong>Secrets</strong> panel to activate the vault.
          </p>
          <div className="text-left bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-xs space-y-2 text-zinc-500">
            <p>1. VITE_SUPABASE_URL</p>
            <p>2. VITE_SUPABASE_ANON_KEY</p>
            <p>3. SUPABASE_SERVICE_ROLE_KEY</p>
          </div>
        </div>
      </div>
    );
  }

  // Map Supabase user to Header format
  const headerUser = user ? {
    name: user.user_metadata?.full_name || user.email,
    image: user.user_metadata?.avatar_url
  } : null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen selection:bg-emerald-500/30">
        <Header 
          user={headerUser} 
          onLogout={handleLogout} 
          onSettings={() => setIsSettingsOpen(true)} 
        />
        
        <main className="container mx-auto px-4 py-12">
          {!user ? (
            <LoginScreen />
          ) : (
            <>
              <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                userId={user.id} 
              />
              <div className="mb-12 max-w-2xl">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl"
                >
                  Hoş geldin, <span className="text-emerald-500">{(user.user_metadata?.full_name || 'Kullanıcı').split(' ')[0]}</span>.
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6 text-lg text-zinc-600 dark:text-zinc-400"
                >
                  API kasanız güvende. Tüm servislerinizdeki anahtarlarınızı ve aktivitelerinizi özel panelinizden takip edin.
                </motion.p>
              </div>

              <div className="bento-grid">
                {/* Main Widgets */}
                <GithubWidget className="md:col-span-2 md:row-span-2" />
                <WeatherWidget className="md:col-span-2" />
                <MusicWidget className="md:col-span-2" />
                
                {/* New Functional Widgets */}
                <MarketWidget className="md:col-span-2" />
                <TodoWidget className="md:col-span-2" />
              </div>
            </>
          )}
        </main>

        <footer className="container mx-auto px-4 py-12 border-t border-zinc-200 dark:border-white/5 mt-12 text-center text-zinc-500 text-sm">
          <p>© 2026 Finora. Built for developers.</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

