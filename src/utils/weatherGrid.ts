import type { Mountain } from '../types/index.ts';

export interface GridPoint {
  lat: number;
  lng: number;
  key: string; // 'lat_lng' format for map key
}

/**
 * 日本全域をカバーする2度グリッドを生成
 * 緯度 30°〜46°, 経度 128°〜146°
 */
export function generateGridPoints(): GridPoint[] {
  const points: GridPoint[] = [];
  for (let lat = 30; lat <= 46; lat += 2) {
    for (let lng = 128; lng <= 146; lng += 2) {
      points.push({
        lat,
        lng,
        key: `${lat}_${lng}`,
      });
    }
  }
  return points;
}

/**
 * 各山に最も近いグリッドポイントをマッピング
 * @returns Map<mountainId, gridPointKey>
 */
export function mapMountainsToGrid(
  mountains: Mountain[],
  gridPoints: GridPoint[],
): Map<string, string> {
  const mapping = new Map<string, string>();

  for (const mountain of mountains) {
    let nearestKey = gridPoints[0].key;
    let minDist = Infinity;

    for (const point of gridPoints) {
      const dlat = mountain.lat - point.lat;
      const dlng = mountain.lng - point.lng;
      const dist = dlat * dlat + dlng * dlng; // squared distance is enough for comparison
      if (dist < minDist) {
        minDist = dist;
        nearestKey = point.key;
      }
    }

    mapping.set(mountain.id, nearestKey);
  }

  return mapping;
}

/**
 * 実際に山がマッピングされているグリッドポイントだけをフィルタリング
 */
export function getUsedGridPoints(
  gridPoints: GridPoint[],
  mountainGridMapping: Map<string, string>,
): GridPoint[] {
  const usedKeys = new Set(mountainGridMapping.values());
  return gridPoints.filter((p) => usedKeys.has(p.key));
}
