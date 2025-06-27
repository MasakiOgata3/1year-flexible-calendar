import { 
  getDayOfWeek, 
  getWeekNumberInMonth, 
  generateDateRange,
  isSameDateAs,
  calculateConsecutiveDays
} from './dateUtils';
import type { 
  CalendarSettings, 
  DayData, 
  MonthData, 
  WeekData, 
  CalendarData, 
  CalendarStatistics,
  DateAdjustment,
  DayType
} from '@/types';

// カレンダーデータの生成
export const generateCalendarData = (
  settings: CalendarSettings,
  holidays: Date[] = []
): CalendarData => {
  const { startDate } = settings;
  
  // 1年間の期間を計算
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  endDate.setDate(endDate.getDate() - 1);
  
  // 日付範囲を生成
  const dateRange = generateDateRange(startDate, endDate);
  
  // 各日のデータを生成
  const days = dateRange.map(date => generateDayData(date, settings, holidays));
  
  // 月別にグループ化
  const months = groupDaysByMonth(days);
  
  // 統計を計算
  const statistics = calculateCalendarStatistics(days);
  
  return {
    year: startDate.getFullYear(),
    startDate,
    endDate,
    months,
    totalWorkHours: statistics.totalWorkHours,
    totalWorkDays: statistics.totalWorkDays,
    statistics,
  };
};

// 個別の日データを生成
export const generateDayData = (
  date: Date,
  settings: CalendarSettings,
  holidays: Date[] = []
): DayData => {
  const { weeklyPatterns, customAdjustments, holidaySettings } = settings;
  
  const dayOfWeek = getDayOfWeek(date);
  const weekNumber = getWeekNumberInMonth(date, settings.weekStartDay === 'sunday' ? 0 : 1);
  
  // 基本的な労働時間を取得
  const weekPattern = weeklyPatterns.find(p => p.weekNumber === weekNumber) || weeklyPatterns[0];
  const isRestDayInPattern = weekPattern?.restDays.includes(dayOfWeek) || false;
  
  // 祝日判定
  const isHoliday = holidays.some(holiday => isSameDateAs(holiday, date));
  const isCustomHoliday = holidaySettings.customHolidays.some(h => 
    isSameDateAs(h.date, date)
  );
  
  // カスタム調整を確認
  const adjustment = customAdjustments.find(adj => isSameDateAs(adj.date, date));
  
  // 労働時間とタイプを決定
  let workHours = 0;
  let isWorkDay = false;
  let dayType: DayType = 'rest';
  let isAdjusted = false;
  
  if (adjustment) {
    // カスタム調整がある場合
    workHours = adjustment.workHours;
    isWorkDay = adjustment.isWorkDay;
    dayType = 'adjusted';
    isAdjusted = true;
  } else if (isHoliday || isCustomHoliday) {
    // 祝日の場合
    if (holidaySettings.includeNationalHolidays) {
      workHours = holidaySettings.holidayWorkHours;
      isWorkDay = holidaySettings.holidayWorkHours > 0;
    } else {
      workHours = settings.dailyWorkHours;
      isWorkDay = true;
    }
    dayType = 'holiday';
  } else if (isRestDayInPattern) {
    // 休日パターンによる休日
    workHours = 0;
    isWorkDay = false;
    dayType = 'rest';
  } else {
    // 通常の労働日
    workHours = settings.dailyWorkHours;
    isWorkDay = true;
    dayType = 'work';
  }
  
  return {
    date,
    dayOfWeek,
    workHours,
    isWorkDay,
    isHoliday: isHoliday || isCustomHoliday,
    isCustomHoliday,
    isAdjusted,
    dayType,
    adjustmentReason: adjustment?.reason,
  };
};

// 日データを月別にグループ化
export const groupDaysByMonth = (days: DayData[]): MonthData[] => {
  const monthsMap = new Map<string, DayData[]>();
  
  days.forEach(day => {
    const key = `${day.date.getFullYear()}-${day.date.getMonth()}`;
    if (!monthsMap.has(key)) {
      monthsMap.set(key, []);
    }
    monthsMap.get(key)!.push(day);
  });
  
  return Array.from(monthsMap.entries()).map(([key, monthDays]) => {
    const [year, month] = key.split('-').map(Number);
    const weeks = groupDaysByWeek(monthDays);
    
    return {
      month: month + 1, // 0-based to 1-based
      year,
      days: monthDays,
      monthlyWorkHours: monthDays.reduce((sum, day) => sum + day.workHours, 0),
      monthlyWorkDays: monthDays.filter(day => day.isWorkDay).length,
      weeks,
    };
  });
};

// 日データを週別にグループ化
export const groupDaysByWeek = (days: DayData[]): WeekData[] => {
  const weeksMap = new Map<string, DayData[]>();
  
  days.forEach(day => {
    const weekStart = new Date(day.date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().split('T')[0];
    
    if (!weeksMap.has(key)) {
      weeksMap.set(key, []);
    }
    weeksMap.get(key)!.push(day);
  });
  
  return Array.from(weeksMap.entries()).map(([key, weekDays], index) => {
    const startDate = new Date(key);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return {
      weekNumber: index + 1,
      startDate,
      endDate,
      workHours: weekDays.reduce((sum, day) => sum + day.workHours, 0),
      workDays: weekDays.filter(day => day.isWorkDay).length,
      days: weekDays.sort((a, b) => a.date.getTime() - b.date.getTime()),
    };
  });
};

// カレンダー統計を計算
export const calculateCalendarStatistics = (days: DayData[]): CalendarStatistics => {
  const workDays = days.filter(day => day.isWorkDay);
  const restDays = days.filter(day => !day.isWorkDay && !day.isHoliday);
  const holidays = days.filter(day => day.isHoliday);
  
  const totalWorkHours = workDays.reduce((sum, day) => sum + day.workHours, 0);
  const totalWorkDays = workDays.length;
  const totalRestDays = restDays.length;
  const totalHolidays = holidays.length;
  
  // 週平均労働時間を計算（52週で割る）
  const averageWeeklyHours = totalWorkHours / 52;
  
  // 最大日次労働時間
  const maxDailyHours = Math.max(...days.map(day => day.workHours));
  
  // 最大週次労働時間を計算
  const maxWeeklyHours = calculateMaxWeeklyHours(days);
  
  // 最大連続労働日数
  const consecutiveWorkDays = calculateConsecutiveWorkDays(days);
  
  return {
    totalWorkHours,
    totalWorkDays,
    totalRestDays,
    totalHolidays,
    averageWeeklyHours,
    maxDailyHours,
    maxWeeklyHours,
    consecutiveWorkDays,
  };
};

// 最大週次労働時間を計算
export const calculateMaxWeeklyHours = (days: DayData[]): number => {
  const weeks = groupDaysByWeek(days);
  return Math.max(...weeks.map(week => week.workHours));
};

// 最大連続労働日数を計算
export const calculateConsecutiveWorkDays = (days: DayData[]): number => {
  const workDayDates = days
    .filter(day => day.isWorkDay)
    .map(day => day.date);
  
  return calculateConsecutiveDays(workDayDates);
};

// 労働時間の調整
export const adjustWorkHours = (
  calendarData: CalendarData,
  adjustments: DateAdjustment[]
): CalendarData => {
  const updatedMonths = calendarData.months.map(month => ({
    ...month,
    days: month.days.map(day => {
      const adjustment = adjustments.find(adj => isSameDateAs(adj.date, day.date));
      if (adjustment) {
        return {
          ...day,
          workHours: adjustment.workHours,
          isWorkDay: adjustment.isWorkDay,
          isAdjusted: true,
          dayType: 'adjusted' as DayType,
          adjustmentReason: adjustment.reason,
        };
      }
      return day;
    }),
  }));
  
  // 統計を再計算
  const allDays = updatedMonths.flatMap(month => month.days);
  const statistics = calculateCalendarStatistics(allDays);
  
  return {
    ...calendarData,
    months: updatedMonths,
    totalWorkHours: statistics.totalWorkHours,
    totalWorkDays: statistics.totalWorkDays,
    statistics,
  };
};

// デフォルト設定の生成
export const createDefaultSettings = (): CalendarSettings => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 3, 1); // 4月1日
  
  return {
    startDate,
    dailyWorkHours: 8,
    weekStartDay: 'sunday',
    weeklyPatterns: [
      {
        weekNumber: 1,
        restDays: ['saturday', 'sunday'],
        workHours: 40,
      },
      {
        weekNumber: 2,
        restDays: ['saturday', 'sunday'],
        workHours: 40,
      },
      {
        weekNumber: 3,
        restDays: ['saturday', 'sunday'],
        workHours: 40,
      },
      {
        weekNumber: 4,
        restDays: ['saturday', 'sunday'],
        workHours: 40,
      },
      {
        weekNumber: 5,
        restDays: ['saturday', 'sunday'],
        workHours: 40,
      },
    ],
    holidaySettings: {
      includeNationalHolidays: true,
      customHolidays: [],
      holidayWorkHours: 0,
    },
    customAdjustments: [],
  };
};