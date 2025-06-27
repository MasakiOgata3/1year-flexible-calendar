import { 
  format, 
  startOfYear, 
  endOfYear, 
  addDays, 
  addWeeks, 
  addMonths,
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  isSameDay, 
  isSameWeek, 
  isSameMonth,
  getDay,
  getWeek,
  getDaysInMonth,
  differenceInDays,
  parseISO,
  isValid
} from 'date-fns';
import { ja } from 'date-fns/locale';
import type { DayOfWeek } from '@/types';

// 曜日の変換
export const dayOfWeekMap: Record<number, DayOfWeek> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export const dayOfWeekNames: Record<DayOfWeek, string> = {
  sunday: '日',
  monday: '月',
  tuesday: '火',
  wednesday: '水',
  thursday: '木',
  friday: '金',
  saturday: '土',
};

export const dayOfWeekNamesLong: Record<DayOfWeek, string> = {
  sunday: '日曜日',
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
};

// 基本的な日付操作
export const getDayOfWeek = (date: Date): DayOfWeek => {
  return dayOfWeekMap[getDay(date)];
};

export const formatDate = (date: Date, formatString = 'yyyy/MM/dd'): string => {
  return format(date, formatString, { locale: ja });
};

export const formatDateJapanese = (date: Date): string => {
  return format(date, 'yyyy年M月d日（E）', { locale: ja });
};

export const parseDate = (dateString: string): Date | null => {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// 1年単位変形労働時間制の期間計算
export const getFlexibleWorkYearPeriod = (startDate: Date) => {
  const endDate = addDays(addYears(startDate, 1), -1);
  return { startDate, endDate };
};

// 年度の開始・終了日
export const getJapanFiscalYear = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-based to 1-based
  
  if (month >= 4) {
    // 4月以降は当年度
    return {
      start: new Date(year, 3, 1), // 4月1日
      end: new Date(year + 1, 2, 31), // 翌年3月31日
    };
  } else {
    // 1-3月は前年度
    return {
      start: new Date(year - 1, 3, 1), // 前年4月1日
      end: new Date(year, 2, 31), // 当年3月31日
    };
  }
};

// 週の計算（週開始曜日を指定可能）
export const getWeekStartDate = (date: Date, weekStartsOn: 0 | 1 = 0): Date => {
  return startOfWeek(date, { weekStartsOn });
};

export const getWeekEndDate = (date: Date, weekStartsOn: 0 | 1 = 0): Date => {
  return endOfWeek(date, { weekStartsOn });
};

// 月内の週番号を取得（1-5）
export const getWeekNumberInMonth = (date: Date, weekStartsOn: 0 | 1 = 0): number => {
  const monthStart = startOfMonth(date);
  const weekStart = getWeekStartDate(date, weekStartsOn);
  const monthStartWeek = getWeekStartDate(monthStart, weekStartsOn);
  
  const weeksDiff = Math.floor(differenceInDays(weekStart, monthStartWeek) / 7);
  return Math.min(Math.max(weeksDiff + 1, 1), 5);
};

// 日付の範囲を生成
export const generateDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

// 月のカレンダーグリッドを生成（前後の月の日付も含む）
export const generateMonthCalendarGrid = (
  year: number, 
  month: number, 
  weekStartsOn: 0 | 1 = 0
): Date[] => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = getWeekStartDate(monthStart, weekStartsOn);
  const calendarEnd = getWeekEndDate(monthEnd, weekStartsOn);
  
  return generateDateRange(calendarStart, calendarEnd);
};

// 労働日の判定
export const isBusinessDay = (date: Date): boolean => {
  const dayOfWeek = getDayOfWeek(date);
  return dayOfWeek !== 'saturday' && dayOfWeek !== 'sunday';
};

// 日付の比較
export const isSameDateAs = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

// 月の情報
export const getMonthInfo = (year: number, month: number) => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = getDaysInMonth(monthStart);
  
  return {
    start: monthStart,
    end: monthEnd,
    daysInMonth,
    name: format(monthStart, 'MMMM', { locale: ja }),
    shortName: format(monthStart, 'MMM', { locale: ja }),
  };
};

// 年の情報
export const getYearInfo = (year: number) => {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(yearStart);
  const totalDays = differenceInDays(yearEnd, yearStart) + 1;
  
  return {
    start: yearStart,
    end: yearEnd,
    totalDays,
    isLeapYear: totalDays === 366,
  };
};

// 連続日数の計算
export const calculateConsecutiveDays = (dates: Date[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  let maxConsecutive = 1;
  let currentConsecutive = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1];
    const currentDate = sortedDates[i];
    const daysDiff = differenceInDays(currentDate, prevDate);
    
    if (daysDiff === 1) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 1;
    }
  }
  
  return maxConsecutive;
};

// 時間関連のユーティリティ
export const formatWorkHours = (hours: number): string => {
  if (hours === 0) return '休';
  if (hours % 1 === 0) return `${hours}時間`;
  return `${hours}時間`;
};

export const parseWorkHours = (hoursString: string): number => {
  const cleaned = hoursString.replace(/[時間h]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// addYears関数が不足していたので追加
const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Export all utility functions
export {
  format,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth,
  getDay,
  getWeek,
  getDaysInMonth,
  differenceInDays,
  parseISO,
  isValid,
  addYears,
};