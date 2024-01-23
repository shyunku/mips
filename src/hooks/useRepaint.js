import { useEffect, useRef, useState } from "react";

const useRepaint = () => {
  const tickRef = useRef(0);
  const [tick, setTick] = useState(0);

  const repaint = (t) => {
    setTick(t);
    tickRef.current = requestAnimationFrame(repaint);
  };

  useEffect(() => {
    tickRef.current = requestAnimationFrame(repaint);
    return () => {
      cancelAnimationFrame(tickRef.current);
    };
  }, []);

  return tick;
};

export default useRepaint;
