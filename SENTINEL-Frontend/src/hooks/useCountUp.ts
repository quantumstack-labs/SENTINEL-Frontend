import { useEffect, useState } from 'react';

export function useCountUp(
  target: number,
  duration: number = 800,
  delay: number = 0
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now();
      
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        setCount(Math.round(eased * target));
        
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };
      
      requestAnimationFrame(tick);
    }, delay);

    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return count;
}
