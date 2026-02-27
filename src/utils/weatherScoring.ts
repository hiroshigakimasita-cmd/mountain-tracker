import type { DailyForecast } from './weatherApi.ts';
import type { Mountain } from '../types/index.ts';

export interface MountainRecommendation {
  mountain: Mountain;
  date: string;
  score: number;
  forecast: DailyForecast;
  weatherEmoji: string;
  weatherLabel: string;
}

/**
 * WMO天気コードからスコア（0〜100）を算出
 */
function weatherCodeScore(code: number): number {
  if (code === 0) return 100;                   // 快晴
  if (code === 1) return 90;                    // ほぼ晴れ
  if (code === 2) return 70;                    // 一部曇り
  if (code === 3) return 50;                    // 曇り
  if ([45, 48].includes(code)) return 30;       // 霧
  if ([51, 53, 56].includes(code)) return 20;   // 霧雨
  if ([55, 57].includes(code)) return 10;       // 強い霧雨
  if ([61, 63, 66, 80, 81].includes(code)) return 10; // 雨
  if ([65, 67, 82].includes(code)) return 0;    // 強い雨
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 0; // 雪
  if ([95, 96, 99].includes(code)) return 0;    // 雷雨
  return 30; // その他
}

/**
 * WMO天気コードから絵文字と日本語ラベルを取得
 */
export function getWeatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: '快晴' };
  if (code === 1) return { emoji: '🌤️', label: 'ほぼ晴れ' };
  if (code === 2) return { emoji: '⛅', label: '一部曇り' };
  if (code === 3) return { emoji: '☁️', label: '曇り' };
  if ([45, 48].includes(code)) return { emoji: '🌫️', label: '霧' };
  if ([51, 53, 55, 56, 57].includes(code)) return { emoji: '🌦️', label: '霧雨' };
  if ([61, 63, 66, 80, 81].includes(code)) return { emoji: '🌧️', label: '雨' };
  if ([65, 67, 82].includes(code)) return { emoji: '⛈️', label: '大雨' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { emoji: '🌨️', label: '雪' };
  if ([95, 96, 99].includes(code)) return { emoji: '⛈️', label: '雷雨' };
  return { emoji: '🌤️', label: '不明' };
}

/**
 * 降水量スコア（0〜100）
 * 0mm = 100, 5mm = 50, 10mm+ = 0
 */
function precipitationScore(mm: number): number {
  if (mm <= 0) return 100;
  if (mm >= 10) return 0;
  return Math.round(100 - (mm / 10) * 100);
}

/**
 * 気温スコア（0〜100）
 * 最高気温で判定: 15〜25℃ = 100, 10〜30℃ = 70, 5〜35℃ = 40, それ以外 = 10
 */
function temperatureScore(maxTemp: number): number {
  if (maxTemp >= 15 && maxTemp <= 25) return 100;
  if (maxTemp >= 10 && maxTemp < 15) return 70;
  if (maxTemp > 25 && maxTemp <= 30) return 70;
  if (maxTemp >= 5 && maxTemp < 10) return 40;
  if (maxTemp > 30 && maxTemp <= 35) return 40;
  return 10;
}

/**
 * 風速スコア（0〜100）
 * 0〜15 km/h = 100, 15〜30 = 60, 30〜50 = 20, 50+ = 0
 */
function windScore(speed: number): number {
  if (speed <= 15) return 100;
  if (speed <= 30) return 60;
  if (speed <= 50) return 20;
  return 0;
}

/**
 * 山 × 天気予報の総合スコアを算出（0〜100）
 */
export function calculateScore(forecast: DailyForecast): number {
  const wcScore = weatherCodeScore(forecast.weatherCode) * 0.4;
  const pScore = precipitationScore(forecast.precipitationSum) * 0.25;
  const tScore = temperatureScore(forecast.temperatureMax) * 0.2;
  const wScore = windScore(forecast.windSpeedMax) * 0.15;

  return Math.round(wcScore + pScore + tScore + wScore);
}

/**
 * おすすめリストを生成
 * 未登頂の山 × 対象日ごとにスコアリングし、スコア60以上を返す
 */
export function generateRecommendations(
  mountains: Mountain[],
  targetDates: string[],
  weatherByGrid: Map<string, { daily: DailyForecast[] }>,
  mountainGridMapping: Map<string, string>,
): MountainRecommendation[] {
  const unclimbed = mountains.filter((m) => !m.isClimbed);
  const recommendations: MountainRecommendation[] = [];

  for (const mountain of unclimbed) {
    const gridKey = mountainGridMapping.get(mountain.id);
    if (!gridKey) continue;

    const gridWeather = weatherByGrid.get(gridKey);
    if (!gridWeather) continue;

    for (const dateStr of targetDates) {
      const forecast = gridWeather.daily.find((d) => d.date === dateStr);
      if (!forecast) continue;

      const score = calculateScore(forecast);
      if (score < 60) continue;

      const { emoji, label } = getWeatherInfo(forecast.weatherCode);

      recommendations.push({
        mountain,
        date: dateStr,
        score,
        forecast,
        weatherEmoji: emoji,
        weatherLabel: label,
      });
    }
  }

  // スコア降順ソート
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

/**
 * 日付ごとにグループ化
 */
export function groupByDate(
  recommendations: MountainRecommendation[],
): Map<string, MountainRecommendation[]> {
  const groups = new Map<string, MountainRecommendation[]>();

  for (const rec of recommendations) {
    const existing = groups.get(rec.date) || [];
    existing.push(rec);
    groups.set(rec.date, existing);
  }

  return groups;
}
