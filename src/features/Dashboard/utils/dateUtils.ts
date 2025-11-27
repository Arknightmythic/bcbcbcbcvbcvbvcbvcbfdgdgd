export const toDateStr = (d: Date): string => {
  const offset = d.getTimezoneOffset();
  const adjusted = new Date(d.getTime() - (offset * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
};

export const getTodayDateString = () => new Date().toISOString().split('T')[0];