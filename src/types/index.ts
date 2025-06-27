// 基本型定義
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export type WeekNumber = 1 | 2 | 3 | 4 | 5;

export type DayType = 'work' | 'rest' | 'holiday' | 'adjusted';

// 設定関連の型
export interface CalendarSettings {
  startDate: Date;
  dailyWorkHours: number;
  weekStartDay: 'sunday' | 'monday';
  weeklyPatterns: WeeklyPattern[];
  holidaySettings: HolidaySettings;
  customAdjustments: DateAdjustment[];
}

export interface WeeklyPattern {
  weekNumber: WeekNumber;
  restDays: DayOfWeek[];
  workHours: number;
}

export interface HolidaySettings {
  includeNationalHolidays: boolean;
  customHolidays: CustomHoliday[];
  holidayWorkHours: number;
}

export interface CustomHoliday {
  date: Date;
  name: string;
  isWorkDay: boolean;
  workHours?: number;
}

export interface DateAdjustment {
  date: Date;
  workHours: number;
  isWorkDay: boolean;
  reason?: string;
}

// カレンダーデータの型
export interface CalendarData {
  year: number;
  startDate: Date;
  endDate: Date;
  months: MonthData[];
  totalWorkHours: number;
  totalWorkDays: number;
  statistics: CalendarStatistics;
}

export interface MonthData {
  month: number;
  year: number;
  days: DayData[];
  monthlyWorkHours: number;
  monthlyWorkDays: number;
  weeks: WeekData[];
}

export interface WeekData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  workHours: number;
  workDays: number;
  days: DayData[];
}

export interface DayData {
  date: Date;
  dayOfWeek: DayOfWeek;
  workHours: number;
  isWorkDay: boolean;
  isHoliday: boolean;
  isCustomHoliday: boolean;
  isAdjusted: boolean;
  dayType: DayType;
  holidayName?: string;
  adjustmentReason?: string;
}

export interface CalendarStatistics {
  totalWorkHours: number;
  totalWorkDays: number;
  totalRestDays: number;
  totalHolidays: number;
  averageWeeklyHours: number;
  maxDailyHours: number;
  maxWeeklyHours: number;
  consecutiveWorkDays: number;
}

// 法定要件チェック関連の型
export interface LegalCheckResult {
  isCompliant: boolean;
  violations: LegalViolation[];
  warnings: LegalWarning[];
  summary: LegalCheckSummary;
}

export interface LegalViolation {
  type: 'annual_hours' | 'daily_hours' | 'weekly_hours' | 'consecutive_days';
  message: string;
  severity: 'error' | 'warning';
  affectedDates?: Date[];
  currentValue: number;
  limitValue: number;
}

export interface LegalWarning {
  type: 'approaching_limit' | 'uneven_distribution' | 'high_workload';
  message: string;
  affectedDates?: Date[];
  details: string;
}

export interface LegalCheckSummary {
  totalAnnualHours: number;
  maxDailyHours: number;
  maxWeeklyHours: number;
  maxConsecutiveDays: number;
  complianceScore: number; // 0-100
}

// UI関連の型
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isValid: boolean;
  errors: ValidationError[];
  isDirty: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  operation: string;
  progress?: number;
}

// Export関連の型
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeStatistics: boolean;
  includeLegalCheck: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportResult {
  success: boolean;
  filename: string;
  downloadUrl?: string;
  error?: string;
}

// API関連の型
export interface HolidayApiResponse {
  date: string;
  name: string;
  name_en: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// ユーティリティ型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;