export const formatIndonesianShortNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    const value = num / 1000;
    return value.toFixed(1).replace(/\.0$/, '') + 'rb';
  }
  
  if (num < 1000000000) {
    const value = num / 1000000;
    return value.toFixed(1).replace(/\.0$/, '') + 'jt';
  }

  
  const value = num / 1000000000;
  return value.toFixed(1).replace(/\.0$/, '') + 'M';
};