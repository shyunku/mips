export const toMaxFixed = (num, max) => {
  const fixed = num.toFixed(max);
  return parseFloat(fixed);
};

export const toRelFixed = (num, fix) => {
  if (num === 0) return 0;
  let maxDigitExp = 0;
  if (num < 1) {
    let target = num;
    while (target < 1) {
      target *= 10;
      maxDigitExp--;
    }
  } else {
    let target = num;
    while (target >= 10) {
      target /= 10;
      maxDigitExp++;
    }
  }
  const relFix = Math.max(0, fix - maxDigitExp - 1);
  const fixed = num.toFixed(relFix);
  return parseFloat(fixed);
};
