import { useState, useEffect, TouchEvent } from 'react';

export function useDoubleTap(onDoubleTap: () => void, delay = 300) {
  const [lastTap, setLastTap] = useState<number>(0);

  const handleTap = (e: TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < delay && tapLength > 0) {
      onDoubleTap();
      setLastTap(0);
    } else {
      setLastTap(currentTime);
    }
  };

  return handleTap;
}