import type { GridPoint } from './weatherGrid.ts';

/** Open-Meteo APIから返される1グリッドポイントの日次予報 */
export interface DailyForecast {
  date: string;         // 'YYYY-MM-DD'
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  windSpeedMax: number;
}

/** グリッドポイントごとの天気データ */
export interface GridWeatherData {
  gridKey: string;
  daily: DailyForecast[];
}

/**
 * 1つのグリッドポイントの天気予報を取得
 */
async function fetchGridPointForecast(point: GridPoint): Promise<GridWeatherData> {
  const params = new URLSearchParams({
    latitude: String(point.lat),
    longitude: String(point.lng),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
    timezone: 'Asia/Tokyo',
    forecast_days: '16',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API error for grid ${point.key}: ${response.status}`);
  }

  const data = await response.json();
  const daily = data.daily;

  const forecasts: DailyForecast[] = [];
  for (let i = 0; i < daily.time.length; i++) {
    forecasts.push({
      date: daily.time[i],
      weatherCode: daily.weather_code[i],
      temperatureMax: daily.temperature_2m_max[i],
      temperatureMin: daily.temperature_2m_min[i],
      precipitationSum: daily.precipitation_sum[i],
      windSpeedMax: daily.wind_speed_10m_max[i],
    });
  }

  return {
    gridKey: point.key,
    daily: forecasts,
  };
}

/**
 * 複数のグリッドポイントの天気予報を並列取得
 * レート制限に配慮して5リクエストずつバッチ実行
 */
export async function fetchAllGridWeather(
  gridPoints: GridPoint[],
  onProgress?: (completed: number, total: number) => void,
): Promise<Map<string, GridWeatherData>> {
  const results = new Map<string, GridWeatherData>();
  const batchSize = 5;

  for (let i = 0; i < gridPoints.length; i += batchSize) {
    const batch = gridPoints.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((point) => fetchGridPointForecast(point)),
    );

    for (const result of batchResults) {
      results.set(result.gridKey, result);
    }

    onProgress?.(Math.min(i + batchSize, gridPoints.length), gridPoints.length);

    // レート制限: バッチ間に少し待つ
    if (i + batchSize < gridPoints.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return results;
}
