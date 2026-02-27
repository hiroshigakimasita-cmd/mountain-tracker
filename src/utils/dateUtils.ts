import { isJapaneseHoliday } from '../data/japanese-holidays.ts';

/** 日付を 'YYYY-MM-DD' 形式の文字列に変換 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 日付文字列から曜日を日本語で取得 */
export function getDayOfWeekJa(dateStr: string): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const date = new Date(dateStr + 'T00:00:00');
  return days[date.getDay()];
}

/** 日付文字列を表示用にフォーマット（例: 3/1 (土)） */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dow = getDayOfWeekJa(dateStr);
  const holiday = isJapaneseHoliday(dateStr);
  return `${m}/${d} (${dow})${holiday ? ' 🎌' : ''}`;
}

/** 指定日が週末（土日）または祝日かどうか */
export function isWeekendOrHoliday(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  return day === 0 || day === 6 || isJapaneseHoliday(dateStr);
}

/**
 * 今日から16日間のうち、週末・祝日の日付リストを返す
 */
export function getUpcomingWeekendAndHolidays(): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 16; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = formatDate(date);
    if (isWeekendOrHoliday(dateStr)) {
      dates.push(dateStr);
    }
  }

  return dates;
}
