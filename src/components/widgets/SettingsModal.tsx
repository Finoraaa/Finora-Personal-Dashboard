import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, X, Save, Github, Cloud, Music, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utils";

export const SettingsModal = ({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    github_token: "",
    weather_key: "",
    lastfm_key: "",
    lastfm_username: "",
    default_city: "Istanbul"
  });

  useEffect(() => {
    if (isOpen && userId) {
      fetchConfig();
    }
  }, [isOpen, userId]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_configs")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setConfig({
          github_token: data.github_token || "",
          weather_key: data.weather_key || "",
          lastfm_key: data.lastfm_key || "",
          lastfm_username: data.lastfm_username || "",
          default_city: data.default_city || "Istanbul"
        });
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_configs")
        .upsert({
          user_id: userId,
          ...config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
        window.location.reload(); // Refresh to apply new keys
      }, 1500);
    } catch (err) {
      console.error("Error saving config:", err);
      alert("Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Dashboard Ayarları</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* GitHub */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <Github className="h-4 w-4" /> GitHub Personal Access Token
              </label>
              <input
                type="password"
                value={config.github_token}
                onChange={(e) => setConfig({ ...config, github_token: e.target.value })}
                placeholder="ghp_..."
                className="w-full rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all"
              />
            </div>

            {/* Weather */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Cloud className="h-4 w-4" /> OpenWeather API Key
                </label>
                <input
                  type="password"
                  value={config.weather_key}
                  onChange={(e) => setConfig({ ...config, weather_key: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Varsayılan Şehir</label>
                <input
                  type="text"
                  value={config.default_city}
                  onChange={(e) => setConfig({ ...config, default_city: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Last.fm */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Music className="h-4 w-4" /> Last.fm API Key
                </label>
                <input
                  type="password"
                  value={config.lastfm_key}
                  onChange={(e) => setConfig({ ...config, lastfm_key: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Last.fm Kullanıcı Adı</label>
                <input
                  type="text"
                  value={config.lastfm_username}
                  onChange={(e) => setConfig({ ...config, lastfm_username: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold transition-all active:scale-95",
                saved ? "bg-emerald-500 text-black" : "bg-white text-black hover:bg-zinc-200"
              )}
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {saving ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Ayarları Kaydet"}
            </button>
            <p className="text-center text-[10px] text-zinc-600">
              Anahtarlarınız Supabase veritabanınızda güvenli bir şekilde saklanır.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
