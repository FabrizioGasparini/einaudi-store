"use client";

import { useState, useEffect } from "react";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(20, 0, 0, 0);
      
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        setIsLive(true);
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  if (isLive) {
    return (
      <div className="animate-in fade-in zoom-in duration-500 my-8">
        <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-orange-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <span className="relative inline-block py-4 px-12 rounded-full bg-black text-white text-2xl font-black tracking-[0.2em] uppercase shadow-2xl border border-red-500/50 animate-pulse">
            Live Now
            </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 my-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
      <p className="text-blue-200 text-sm font-bold tracking-[0.3em] uppercase animate-pulse">Il drop inizia tra</p>
      <div className="flex gap-3 sm:gap-6 text-center">
        <TimeUnit value={timeLeft.hours} label="Ore" />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="Minuti" />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="Secondi" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-linear-to-b from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative w-20 h-24 sm:w-28 sm:h-32 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none"></div>
            <span className="text-4xl sm:text-6xl font-black text-white tabular-nums tracking-tight drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                {value.toString().padStart(2, '0')}
            </span>
        </div>
      </div>
      <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">{label}</span>
    </div>
  );
}

function Separator() {
    return (
        <div className="flex flex-col justify-center h-24 sm:h-32">
            <div className="flex flex-col gap-3 sm:gap-4 animate-pulse">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
            </div>
        </div>
    )
}
