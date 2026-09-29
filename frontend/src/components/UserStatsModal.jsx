import { useEffect, useState } from "react";
import { fetchUserStats } from "../services/userStatsService";

export default function UserStatsModal({ isOpen, onClose, user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchUserStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-6 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Intestazione Profilo */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-300 font-bold text-lg">
              {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="text-base font-bold text-white capitalize">
                {user?.username || "Profilo Utente"}
              </h2>
              <span className="text-xs text-zinc-400 font-mono">
                {user?.email || "Statistiche di studio"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs animate-pulse">
            Caricamento statistiche...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Banner Padronanza */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 uppercase tracking-wider">Padronanza del Mazzo</span>
                <span className="text-emerald-400 font-bold">{stats.masteryPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${stats.masteryPercentage}%` }}
                />
              </div>
            </div>

            {/* Griglia a 4 tessere metriche */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Totale Mazzo</span>
                <span className="text-2xl font-black text-white">{stats.totale}</span>
              </div>

              <div className="p-3.5 bg-cyan-950/20 border border-cyan-900/40 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Pronte al Ripasso</span>
                <span className="text-2xl font-black text-cyan-300">{stats.daRipassareSubito}</span>
              </div>
            </div>

            {/* Dettaglio Stati SRS */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Distribuzione Vocaboli
              </span>

              <div className="flex flex-col gap-2">
                {/* Nuove */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-500"></span>
                    <span className="text-zinc-300">Nuove</span>
                  </div>
                  <span className="font-mono font-semibold text-zinc-400">{stats.nuova}</span>
                </div>

                {/* In Ripasso */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-zinc-300">In Ripasso</span>
                  </div>
                  <span className="font-mono font-semibold text-amber-400">{stats.in_ripasso}</span>
                </div>

                {/* Apprese */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-zinc-300">Apprese</span>
                  </div>
                  <span className="font-mono font-semibold text-emerald-400">{stats.appresa}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}