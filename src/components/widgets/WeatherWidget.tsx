import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cloud, Sun, CloudRain, Wind, Droplets, Loader2, AlertCircle, MapPin } from "lucide-react";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

interface WeatherData {
  city: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  condition: string;
}

export const WeatherWidget = ({ className }: { className?: string }) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch("/api/weather", {
          headers: {
            "Authorization": `Bearer ${session?.access_token}`
          }
        });
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch weather");
        }
        
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Refresh every 10 minutes
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear": return <Sun className="h-10 w-10 text-yellow-400" />;
      case "clouds": return <Cloud className="h-10 w-10 text-zinc-400" />;
      case "rain":
      case "drizzle":
      case "thunderstorm": return <CloudRain className="h-10 w-10 text-blue-400" />;
      default: return <Cloud className="h-10 w-10 text-zinc-400" />;
    }
  };

  if (loading) {
    return (
      <div className={cn("flex h-full min-h-[200px] items-center justify-center rounded-3xl border border-white/5 bg-zinc-900/50", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !data) {
    const isConfigError = error?.includes("configured") || !data;
    return (
      <div className={cn("flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center", className)}>
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-400">{isConfigError ? "Weather Config Required" : "Weather Error"}</p>
        <p className="text-xs text-zinc-500 text-balance">
          {error || "Add OPENWEATHER_API_KEY to Secrets"}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 transition-all hover:border-blue-500/30 shadow-sm dark:shadow-none",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-bold text-zinc-900 dark:text-white">{data.city}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weather</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon(data.condition)}
            <div>
              <div className="flex items-start">
                <span className="text-4xl font-bold text-zinc-900 dark:text-white">{data.temp}</span>
                <span className="text-xl font-medium text-blue-500">°C</span>
              </div>
              <p className="text-sm text-zinc-400 capitalize">{data.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-zinc-100 dark:border-white/5 pt-4">
          <div className="flex flex-col items-center gap-1">
            <Droplets className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-white">{data.humidity}%</span>
            <span className="text-[10px] text-zinc-500 uppercase">Humidity</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wind className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-white">{data.wind_speed} m/s</span>
            <span className="text-[10px] text-zinc-500 uppercase">Wind</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sun className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-bold text-zinc-900 dark:text-white">{data.feels_like}°</span>
            <span className="text-[10px] text-zinc-500 uppercase">Feels</span>
          </div>
        </div>
      </div>

      {/* Decorative Background Element */}
      <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl transition-colors group-hover:bg-blue-500/10" />
    </motion.div>
  );
};
