import { useState, useCallback, useMemo } from 'react';
import type { Mountain } from '../types/index.ts';
import { generateGridPoints, mapMountainsToGrid, getUsedGridPoints } from '../utils/weatherGrid.ts';
import { fetchAllGridWeather } from '../utils/weatherApi.ts';
import { calculateScore, getWeatherInfo, type MountainRecommendation } from '../utils/weatherScoring.ts';
import { getUpcomingWeekendAndHolidays } from '../utils/dateUtils.ts';

interface UseWeatherRecommendationsResult {
  recommendations: Map<string, MountainRecommendation[]>; // grouped by date
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  progress: { completed: number; total: number } | null;
  fetchRecommendations: () => Promise<void>;
}

export function useWeatherRecommendations(
  mountains: Mountain[],
): UseWeatherRecommendationsResult {
  const [recommendations, setRecommendations] = useState<Map<string, MountainRecommendation[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);

  // グリッドポイントは固定（メモ化）
  const gridPoints = useMemo(() => generateGridPoints(), []);

  const fetchRecommendations = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      // 1. 対象日（週末・祝日）を算出
      const targetDates = getUpcomingWeekendAndHolidays();
      if (targetDates.length === 0) {
        setRecommendations(new Map());
        setLastUpdated(new Date().toLocaleString('ja-JP'));
        setLoading(false);
        return;
      }

      // 2. 未登頂の山だけ対象
      const unclimbed = mountains.filter((m) => !m.isClimbed);
      if (unclimbed.length === 0) {
        setRecommendations(new Map());
        setLastUpdated(new Date().toLocaleString('ja-JP'));
        setLoading(false);
        return;
      }

      // 3. 山→グリッドマッピング
      const mountainGridMapping = mapMountainsToGrid(mountains, gridPoints);

      // 4. 使用されるグリッドポイントのみ取得
      const usedGridPoints = getUsedGridPoints(gridPoints, mountainGridMapping);

      // 5. 天気予報を並列取得
      const weatherData = await fetchAllGridWeather(usedGridPoints, (completed, total) => {
        setProgress({ completed, total });
      });

      // 6. スコアリング
      const allRecs: MountainRecommendation[] = [];

      for (const mountain of unclimbed) {
        const gridKey = mountainGridMapping.get(mountain.id);
        if (!gridKey) continue;

        const gridWeather = weatherData.get(gridKey);
        if (!gridWeather) continue;

        for (const dateStr of targetDates) {
          const forecast = gridWeather.daily.find((d) => d.date === dateStr);
          if (!forecast) continue;

          const score = calculateScore(forecast);
          if (score < 60) continue;

          const { emoji, label } = getWeatherInfo(forecast.weatherCode);

          allRecs.push({
            mountain,
            date: dateStr,
            score,
            forecast,
            weatherEmoji: emoji,
            weatherLabel: label,
          });
        }
      }

      // 7. 日付ごとにグループ化し、各日付内はスコア降順
      const grouped = new Map<string, MountainRecommendation[]>();
      for (const dateStr of targetDates) {
        const dateRecs = allRecs
          .filter((r) => r.date === dateStr)
          .sort((a, b) => b.score - a.score)
          .slice(0, 20); // 各日最大20件
        if (dateRecs.length > 0) {
          grouped.set(dateStr, dateRecs);
        }
      }

      setRecommendations(grouped);
      setLastUpdated(new Date().toLocaleString('ja-JP'));
    } catch (err) {
      setError(err instanceof Error ? err.message : '天気予報の取得に失敗しました');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [mountains, gridPoints, loading]);

  return {
    recommendations,
    loading,
    error,
    lastUpdated,
    progress,
    fetchRecommendations,
  };
}
