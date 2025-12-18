"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (event) => setMatches(event.matches);
    
    // Add listener
    media.addEventListener("change", listener);
    
    // Cleanup
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Common breakpoints matching Tailwind
export function useIsMobile() {
  return !useMediaQuery("(min-width: 1024px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}