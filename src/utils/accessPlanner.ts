import type { Mountain, AccessOption, AccessPlan, TimesCarShareStation } from '../types/index.ts';
import {
  ORIGIN,
  SHINKANSEN_STATIONS,
  AIRPORTS,
  TIMES_CARSHARE_STATIONS,
  BOOKING_SITES,
} from '../data/access-stations.ts';

/**
 * Haversine距離計算（km）
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 山道の運転時間概算（平均40km/h）
 */
function estimateDrivingMinutes(distanceKm: number): number {
  return Math.round((distanceKm / 40) * 60);
}

/**
 * 新幹線路線に対応する予約サイトを返す
 */
function getShinkansenBookingSite(line: string): { name: string; url: string } {
  if (line === '東海道新幹線' || line === '山陽新幹線') {
    return BOOKING_SITES.smartex;
  }
  return BOOKING_SITES.ekinet;
}

/**
 * アクセス計画を生成
 */
export function generateAccessPlan(mountain: Mountain, date: string): AccessPlan {
  // 1. 山に最も近い新幹線駅を3つ選ぶ
  const rankedStations = SHINKANSEN_STATIONS
    .map((station) => ({
      ...station,
      distanceKm: Math.round(haversineDistance(mountain.lat, mountain.lng, station.lat, station.lng) * 10) / 10,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);

  const stationOptions: AccessOption[] = rankedStations.map((station) => {
    const booking = getShinkansenBookingSite(station.line);
    return {
      type: 'shinkansen',
      label: `${station.name}駅`,
      distanceKm: station.distanceKm,
      estimatedDrivingMinutes: estimateDrivingMinutes(station.distanceKm),
      bookingUrl: booking.url,
      bookingHint: `東京 → ${station.name}（${station.line}）`,
      details: station.line,
    };
  });

  // 2. 出発地から山までの距離が300km以上なら空港も提案
  const distFromOrigin = haversineDistance(ORIGIN.lat, ORIGIN.lng, mountain.lat, mountain.lng);

  const rankedAirports = AIRPORTS
    .map((airport) => ({
      ...airport,
      distanceKm: Math.round(haversineDistance(mountain.lat, mountain.lng, airport.lat, airport.lng) * 10) / 10,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 2);

  const airportOptions: AccessOption[] = distFromOrigin > 300
    ? rankedAirports.map((airport) => ({
        type: 'flight' as const,
        label: airport.name,
        distanceKm: airport.distanceKm,
        estimatedDrivingMinutes: estimateDrivingMinutes(airport.distanceKm),
        bookingUrl: BOOKING_SITES.skyticket.url,
        bookingHint: `羽田/成田 → ${airport.name}（${airport.code}）`,
        details: airport.code,
      }))
    : [];

  // 3. 夜行バスオプション
  const nightBusDestination = rankedStations[0]?.name || mountain.name;
  const nightBus: AccessOption = {
    type: 'nightbus',
    label: '夜行バス',
    distanceKm: 0,
    estimatedDrivingMinutes: 0,
    bookingUrl: BOOKING_SITES.bushikaku.url,
    bookingHint: `東京 → ${nightBusDestination}周辺`,
    details: 'バス比較なびで検索',
  };

  // 4. カーシェアステーション（最寄り駅・空港のハブ名で検索）
  const carShareStations: TimesCarShareStation[] = [];
  const seenHubs = new Set<string>();

  for (const station of rankedStations) {
    if (!seenHubs.has(station.name)) {
      seenHubs.add(station.name);
      const nearby = TIMES_CARSHARE_STATIONS.filter((s) => s.nearHub === station.name);
      carShareStations.push(...nearby);
    }
  }

  for (const airport of rankedAirports) {
    if (!seenHubs.has(airport.name)) {
      seenHubs.add(airport.name);
      const nearby = TIMES_CARSHARE_STATIONS.filter((s) => s.nearHub === airport.name);
      carShareStations.push(...nearby);
    }
  }

  return {
    mountain,
    date,
    nearestStations: stationOptions,
    nearestAirports: airportOptions,
    nightBus,
    carShareStations,
  };
}
