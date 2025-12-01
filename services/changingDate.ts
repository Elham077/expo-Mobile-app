export const normalizeDate = (date: any) => {
  if (!date) return new Date();
  
  if (date instanceof Date) return date;
  
  if (typeof date === 'object' && 'seconds' in date) {
    return new Date(date.seconds * 1000);
  }
  
  if (typeof date === 'string') {
    return new Date(date);
  }
  
  return new Date();
};

export const formatFirestoreDate = (timestamp: {seconds: number, nanoseconds: number}) => {
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('fa-IR'); // فرمت تاریخ شمسی
};
export const formatFirestoreTimestamp = (timestamp: any) => {
  if (!timestamp) return 'بدون تاریخ';
  
  try {
    // اگر timestamp فایراستور باشد (دارای seconds و nanoseconds)
    if (timestamp?.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('fa-IR');
    }
    
    // اگر رشته باشد
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString('fa-IR');
    }
    
    // اگر آبجکت Date باشد
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('fa-IR');
    }
    
    return 'تاریخ نامعتبر';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'تاریخ نامعتبر';
  }
};
