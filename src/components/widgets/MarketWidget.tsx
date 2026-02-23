import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, DollarSign, Bitcoin, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface MarketData {
  crypto: {
    bitcoin: number;
    ethereum: number;
  };
  rates: {
    TRY: number;
    EUR: number;
  };
}

export const MarketWidget = ({ className }: { className?: string }) => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const response = await fetch("/api/market");
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Market fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 60000); // 1 dk bir güncelle
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={cn("flex h-full min-h-[160px] items-center justify-center rounded-3xl border border-white/5 bg-zinc-900/50", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 p-6 transition-all hover:border-emerald-500/30 shadow-sm dark:shadow-none",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Market Watch</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Crypto */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">Bitcoin</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">${data?.crypto.bitcoin.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-500">E</div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">Ethereum</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">${data?.crypto.ethereum.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Fiat */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">USD / TRY</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">₺{data?.rates.TRY.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-zinc-500/20 flex items-center justify-center text-[10px] font-bold text-zinc-500">€</div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">EUR / TRY</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">₺{(data!.rates.TRY / data!.rates.EUR * data!.rates.TRY).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
