export interface ParsedGpxData {
  name: string;
  coordinates: [number, number][];
  totalDistance: number | null;
  elevationGain: number | null;
  trackDate: string | null;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function parseGpxFile(
  gpxString: string,
  fileName: string,
): ParsedGpxData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxString, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('GPXファイルの解析に失敗しました: XMLが不正です');
  }

  const coordinates: [number, number][] = [];
  const elevations: number[] = [];
  let firstTime: string | null = null;

  // Extract track points (<trkpt>) and route points (<rtept>)
  const trkpts = doc.querySelectorAll('trkpt');
  const rtepts = doc.querySelectorAll('rtept');
  const points = trkpts.length > 0 ? trkpts : rtepts;

  points.forEach((pt) => {
    const lat = parseFloat(pt.getAttribute('lat') ?? '');
    const lon = parseFloat(pt.getAttribute('lon') ?? '');
    if (!isNaN(lat) && !isNaN(lon)) {
      coordinates.push([lat, lon]);
    }
    const ele = pt.querySelector('ele');
    if (ele?.textContent) {
      elevations.push(parseFloat(ele.textContent));
    }
    if (!firstTime) {
      const time = pt.querySelector('time');
      if (time?.textContent) {
        firstTime = time.textContent;
      }
    }
  });

  if (coordinates.length === 0) {
    throw new Error('GPXファイルにトラックポイントが含まれていません');
  }

  // Calculate total distance
  let totalDistance: number | null = null;
  if (coordinates.length > 1) {
    let dist = 0;
    for (let i = 1; i < coordinates.length; i++) {
      dist += haversineDistance(
        coordinates[i - 1][0],
        coordinates[i - 1][1],
        coordinates[i][0],
        coordinates[i][1],
      );
    }
    totalDistance = Math.round(dist);
  }

  // Calculate elevation gain
  let elevationGain: number | null = null;
  if (elevations.length > 1) {
    let gain = 0;
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) gain += diff;
    }
    elevationGain = Math.round(gain);
  }

  // Extract track name
  const nameEl = doc.querySelector('trk > name') ?? doc.querySelector('metadata > name');
  const name = nameEl?.textContent ?? fileName.replace(/\.gpx$/i, '');

  // Track date from first point's timestamp
  let trackDate: string | null = null;
  if (firstTime) {
    try {
      trackDate = new Date(firstTime).toISOString().split('T')[0];
    } catch {
      // ignore invalid date
    }
  }

  return { name, coordinates, totalDistance, elevationGain, trackDate };
}
