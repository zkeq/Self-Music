"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/lib/data-stores";

export function FaviconUpdater() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  useEffect(() => {
    if (isPlaying && currentTrack?.coverUrl) {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (link) {
        link.href = currentTrack.coverUrl;
      }
    }
  }, [currentTrack, isPlaying]);

  return null;
}
