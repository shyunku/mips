import { useEffect, useMemo, useRef, useState } from "react";

// interface AnimatedNumberProps {
//   value: number;
//   asr?: number;
//   useInt?: boolean;
//   tolerance?: number;
// }

/**
 * @param {Number} value - target value
 * @param {Number} asr - animation speed ratio
 */
const useAnimatedNumber = ({ value, asr = 0.99, useInt = false, tolerance = 0.000001 }) => {
  const frameRef = useRef(0);
  const [current, setCurrent] = useState(value);
  const curTolerance = useMemo(() => {
    return useInt ? 1 : tolerance;
  }, [useInt, tolerance]);
  const [fixed, setFixed] = useState(false);

  const retVal = useMemo(() => {
    return useInt ? Math.floor(current) : current;
  }, [current, useInt]);

  const animate = (prevTime) => {
    const now = Date.now();
    const dt = (now - prevTime) / 1000;
    const nextValue = (value - current) * (1 - (1 - asr) ** dt) + current;
    // console.log({
    //   value,
    //   current,
    //   nextValue,
    //   dt,
    // });
    if (Math.abs(nextValue - value) > curTolerance) {
      frameRef.current = requestAnimationFrame(() => animate(now));
      setCurrent(nextValue);
    } else {
      cancelAnimationFrame(frameRef.current);
      setCurrent(value);
      setFixed(true);
    }
  };

  useEffect(() => {
    setFixed(false);
    animate(Date.now());
    return () => cancelAnimationFrame(frameRef.current);
  }, [current, value, fixed]);

  return { value: retVal, fixed };
};

export default useAnimatedNumber;
