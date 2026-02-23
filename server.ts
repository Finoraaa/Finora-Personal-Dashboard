import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const app = express();
const PORT = 3000;

app.use(express.json());

// Middleware to get user config from DB
const getUserConfig = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No auth header" });

  const token = authHeader.split(" ")[1];
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) return res.status(401).json({ error: "Invalid token" });

  const { data: config, error: configError } = await supabaseAdmin
    .from("user_configs")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (configError || !config) {
    return res.status(404).json({ error: "User configuration not found. Please set your API keys in settings." });
  }

  req.userConfig = config;
  next();
};

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Finora Server is running" });
});

app.get("/api/github/stats", getUserConfig, async (req: any, res) => {
  const token = req.userConfig.github_token;
  if (!token) {
    return res.status(400).json({ error: "GitHub token not configured in settings" });
  }

  try {
    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Finora-App",
    };

    // 1. Get User Info
    const userRes = await fetch("https://api.github.com/user", { headers });
    const userData: any = await userRes.json();
    const username = userData.login;
    const followers = userData.followers;
    const following = userData.following;

    // 2. Get Repos (for count, stars, and languages)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
    const reposData: any[] = await reposRes.json();
    
    const totalRepos = reposData.length;
    const totalStars = reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

    // Calculate Top Languages
    const languages: Record<string, number> = {};
    reposData.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    const topLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // 3. Get Last 10 Events (Commits, PRs, Issues)
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public`, { headers });
    const eventsData: any[] = await eventsRes.json();
    
    const activity = eventsData
      .slice(0, 10)
      .map(event => ({
        id: event.id,
        type: event.type,
        repo: event.repo.name,
        date: event.created_at,
        payload: event.payload
      }));

    res.json({
      username,
      followers,
      following,
      totalRepos,
      totalStars,
      topLanguages,
      activity,
      repos: reposData.slice(0, 10).map(r => ({ name: r.name, url: r.html_url, stars: r.stargazers_count, lang: r.language }))
    });
  } catch (error) {
    console.error("GitHub API error:", error);
    res.status(500).json({ error: "Failed to fetch GitHub data" });
  }
});

app.get("/api/weather", getUserConfig, async (req: any, res) => {
  const api_key = req.userConfig.weather_key;
  const city = req.query.city || req.userConfig.default_city || "Istanbul";

  if (!api_key) {
    return res.status(400).json({ error: "Weather API key not configured in settings" });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${api_key}`
    );
    const data: any = await response.json();

    if (data.cod !== 200) {
      return res.status(data.cod).json({ error: data.message });
    }

    res.json({
      city: data.name,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      condition: data.weather[0].main
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/lastfm/now-playing", getUserConfig, async (req: any, res) => {
  const api_key = req.userConfig.lastfm_key;
  const username = req.userConfig.lastfm_username;

  if (!api_key || !username) {
    return res.status(400).json({ error: "Last.fm credentials not configured in settings" });
  }

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${api_key}&format=json&limit=1`
    );
    const data: any = await response.json();

    if (data.error) {
      return res.status(400).json({ error: `Last.fm Error: ${data.message}` });
    }

    if (!data.recenttracks || !data.recenttracks.track || (Array.isArray(data.recenttracks.track) && data.recenttracks.track.length === 0)) {
      return res.json({ isPlaying: false });
    }

    const track = Array.isArray(data.recenttracks.track) ? data.recenttracks.track[0] : data.recenttracks.track;
    if (!track) return res.json({ isPlaying: false });

    const isPlaying = track["@attr"]?.nowplaying === "true";

    return res.json({
      isPlaying,
      title: track.name,
      artist: track.artist["#text"],
      album: track.album["#text"],
      albumImageUrl: track.image.find((img: any) => img.size === "extralarge")?.["#text"] || track.image[track.image.length - 1]["#text"],
      songUrl: track.url,
    });
  } catch (error: any) {
    console.error("Last.fm API error:", error);
    res.status(500).json({ error: `Connection Error: ${error.message}` });
  }
});

app.get("/api/lastfm/search", getUserConfig, async (req: any, res) => {
  const api_key = req.userConfig.lastfm_key;
  const query = req.query.q as string;

  if (!api_key || !query) {
    return res.status(400).json({ error: "API Key or search query missing" });
  }

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${api_key}&format=json&limit=5`
    );
    const data: any = await response.json();

    const tracks = data.results?.trackmatches?.track || [];
    res.json(tracks.map((t: any) => ({
      title: t.name,
      artist: t.artist,
      url: t.url,
      image: t.image?.find((img: any) => img.size === "medium")?.["#text"] || ""
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/market", async (req, res) => {
  try {
    // Crypto prices (CoinGecko)
    const cryptoRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
    const cryptoData = await cryptoRes.json();

    // Currency rates (Generic fallback or free API)
    const currencyRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const currencyData: any = await currencyRes.json();

    res.json({
      crypto: {
        bitcoin: cryptoData.bitcoin.usd,
        ethereum: cryptoData.ethereum.usd
      },
      rates: {
        TRY: currencyData.rates.TRY,
        EUR: currencyData.rates.EUR
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server logic
const start = async () => {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    // Development: Use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else if (!process.env.VERCEL) {
    // Production (local): Serve static files
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
};

// Only start listening if not in Vercel (Vercel handles the serverless function export)
if (!process.env.VERCEL) {
  start();
}

// Export the app for Vercel
export default app;


