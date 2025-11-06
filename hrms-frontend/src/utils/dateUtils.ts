export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return { start, end };
};

export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.toDateString() === checkDate.toDateString();
};

export const daysSince = (date: string | Date): number => {
  const today = new Date();
  const checkDate = new Date(date);
  const diffTime = Math.abs(today.getTime() - checkDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};