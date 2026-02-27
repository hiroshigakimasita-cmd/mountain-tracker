import type { ShinkansenStation, Airport, TimesCarShareStation } from '../types/index.ts';

/** 出発地: 成城学園前駅 */
export const ORIGIN = {
  name: '成城学園前',
  lat: 35.6417,
  lng: 139.5981,
} as const;

/** 新幹線停車駅（東京から直通可能な主要駅） */
export const SHINKANSEN_STATIONS: ShinkansenStation[] = [
  // 東海道新幹線
  { name: '品川', lat: 35.6284, lng: 139.7388, line: '東海道新幹線' },
  { name: '新横浜', lat: 35.5076, lng: 139.6173, line: '東海道新幹線' },
  { name: '小田原', lat: 35.2564, lng: 139.1543, line: '東海道新幹線' },
  { name: '熱海', lat: 35.1042, lng: 139.0778, line: '東海道新幹線' },
  { name: '三島', lat: 35.1265, lng: 138.9119, line: '東海道新幹線' },
  { name: '新富士', lat: 35.1419, lng: 138.6655, line: '東海道新幹線' },
  { name: '静岡', lat: 34.9717, lng: 138.3887, line: '東海道新幹線' },
  { name: '掛川', lat: 34.7693, lng: 137.9983, line: '東海道新幹線' },
  { name: '浜松', lat: 34.7038, lng: 137.7349, line: '東海道新幹線' },
  { name: '豊橋', lat: 34.7636, lng: 137.3817, line: '東海道新幹線' },
  { name: '名古屋', lat: 35.1709, lng: 136.8815, line: '東海道新幹線' },
  { name: '岐阜羽島', lat: 35.3146, lng: 136.6856, line: '東海道新幹線' },
  { name: '米原', lat: 35.3148, lng: 136.2897, line: '東海道新幹線' },
  { name: '京都', lat: 34.9856, lng: 135.7583, line: '東海道新幹線' },
  { name: '新大阪', lat: 34.7334, lng: 135.5001, line: '東海道新幹線' },
  // 山陽新幹線
  { name: '新神戸', lat: 34.6886, lng: 135.1975, line: '山陽新幹線' },
  { name: '姫路', lat: 34.8265, lng: 134.6916, line: '山陽新幹線' },
  { name: '岡山', lat: 34.6661, lng: 133.9178, line: '山陽新幹線' },
  { name: '広島', lat: 34.3984, lng: 132.4750, line: '山陽新幹線' },
  { name: '新山口', lat: 34.1700, lng: 131.3533, line: '山陽新幹線' },
  { name: '小倉', lat: 33.8869, lng: 130.8828, line: '山陽新幹線' },
  { name: '博多', lat: 33.5898, lng: 130.4207, line: '山陽新幹線' },
  // 東北新幹線
  { name: '大宮', lat: 35.9063, lng: 139.6237, line: '東北新幹線' },
  { name: '小山', lat: 36.3145, lng: 139.8005, line: '東北新幹線' },
  { name: '宇都宮', lat: 36.5595, lng: 139.8985, line: '東北新幹線' },
  { name: '那須塩原', lat: 36.9582, lng: 139.9538, line: '東北新幹線' },
  { name: '新白河', lat: 37.1245, lng: 140.2040, line: '東北新幹線' },
  { name: '郡山', lat: 37.3982, lng: 140.3880, line: '東北新幹線' },
  { name: '福島', lat: 37.7543, lng: 140.4596, line: '東北新幹線' },
  { name: '仙台', lat: 38.2601, lng: 140.8824, line: '東北新幹線' },
  { name: '古川', lat: 38.5727, lng: 140.9537, line: '東北新幹線' },
  { name: '一ノ関', lat: 38.9261, lng: 141.1270, line: '東北新幹線' },
  { name: '北上', lat: 39.2864, lng: 141.1130, line: '東北新幹線' },
  { name: '盛岡', lat: 39.7013, lng: 141.1369, line: '東北新幹線' },
  { name: '八戸', lat: 40.5126, lng: 141.4884, line: '東北新幹線' },
  { name: '新青森', lat: 40.8246, lng: 140.6973, line: '東北新幹線' },
  // 上越新幹線
  { name: '高崎', lat: 36.3221, lng: 139.0124, line: '上越新幹線' },
  { name: '上毛高原', lat: 36.6406, lng: 138.9830, line: '上越新幹線' },
  { name: '越後湯沢', lat: 36.9338, lng: 138.8170, line: '上越新幹線' },
  { name: '浦佐', lat: 37.0581, lng: 138.9654, line: '上越新幹線' },
  { name: '長岡', lat: 37.4497, lng: 138.8530, line: '上越新幹線' },
  { name: '燕三条', lat: 37.6355, lng: 138.9295, line: '上越新幹線' },
  { name: '新潟', lat: 37.9130, lng: 139.0634, line: '上越新幹線' },
  // 北陸新幹線
  { name: '安中榛名', lat: 36.3597, lng: 138.8576, line: '北陸新幹線' },
  { name: '軽井沢', lat: 36.3448, lng: 138.6360, line: '北陸新幹線' },
  { name: '佐久平', lat: 36.2494, lng: 138.4853, line: '北陸新幹線' },
  { name: '上田', lat: 36.4027, lng: 138.1618, line: '北陸新幹線' },
  { name: '長野', lat: 36.6432, lng: 138.1887, line: '北陸新幹線' },
  { name: '飯山', lat: 36.8519, lng: 138.3655, line: '北陸新幹線' },
  { name: '上越妙高', lat: 37.0541, lng: 138.2372, line: '北陸新幹線' },
  { name: '糸魚川', lat: 37.0446, lng: 137.8632, line: '北陸新幹線' },
  { name: '黒部宇奈月温泉', lat: 36.8647, lng: 137.4500, line: '北陸新幹線' },
  { name: '富山', lat: 36.7010, lng: 137.2135, line: '北陸新幹線' },
  { name: '新高岡', lat: 36.7161, lng: 137.0261, line: '北陸新幹線' },
  { name: '金沢', lat: 36.5781, lng: 136.6483, line: '北陸新幹線' },
  { name: '小松', lat: 36.4013, lng: 136.4467, line: '北陸新幹線' },
  { name: '福井', lat: 36.0625, lng: 136.2238, line: '北陸新幹線' },
  { name: '敦賀', lat: 35.6454, lng: 136.0554, line: '北陸新幹線' },
  // 北海道新幹線
  { name: '新函館北斗', lat: 41.9046, lng: 140.6488, line: '北海道新幹線' },
  // 秋田新幹線
  { name: '田沢湖', lat: 39.7036, lng: 140.7261, line: '秋田新幹線' },
  { name: '角館', lat: 39.5932, lng: 140.5620, line: '秋田新幹線' },
  { name: '大曲', lat: 39.4534, lng: 140.4748, line: '秋田新幹線' },
  { name: '秋田', lat: 39.7173, lng: 140.1029, line: '秋田新幹線' },
  // 山形新幹線
  { name: '米沢', lat: 37.9124, lng: 140.1143, line: '山形新幹線' },
  { name: '山形', lat: 38.2488, lng: 140.3278, line: '山形新幹線' },
  { name: '天童', lat: 38.3613, lng: 140.3791, line: '山形新幹線' },
  { name: '新庄', lat: 38.7647, lng: 140.3098, line: '山形新幹線' },
];

/** 国内主要空港（羽田/成田から直行便がある空港） */
export const AIRPORTS: Airport[] = [
  { name: '新千歳空港', code: 'CTS', lat: 42.7752, lng: 141.6922 },
  { name: '函館空港', code: 'HKD', lat: 41.7700, lng: 140.8222 },
  { name: '青森空港', code: 'AOJ', lat: 40.7347, lng: 140.6908 },
  { name: '秋田空港', code: 'AXT', lat: 39.6156, lng: 140.2186 },
  { name: '庄内空港', code: 'SYO', lat: 38.8122, lng: 139.7872 },
  { name: '仙台空港', code: 'SDJ', lat: 38.1397, lng: 140.9172 },
  { name: '新潟空港', code: 'KIJ', lat: 37.9561, lng: 139.1064 },
  { name: '富山空港', code: 'TOY', lat: 36.6483, lng: 137.1875 },
  { name: '小松空港', code: 'KMQ', lat: 36.3946, lng: 136.4067 },
  { name: '松本空港', code: 'MMJ', lat: 36.1668, lng: 137.9228 },
  { name: '静岡空港', code: 'FSZ', lat: 34.7960, lng: 138.1894 },
  { name: '中部国際空港', code: 'NGO', lat: 34.8585, lng: 136.8125 },
  { name: '伊丹空港', code: 'ITM', lat: 34.7855, lng: 135.4381 },
  { name: '関西空港', code: 'KIX', lat: 34.4347, lng: 135.2440 },
  { name: '南紀白浜空港', code: 'SHM', lat: 33.6624, lng: 135.3641 },
  { name: '鳥取空港', code: 'TTJ', lat: 35.5301, lng: 134.1668 },
  { name: '出雲空港', code: 'IZO', lat: 35.4136, lng: 132.8903 },
  { name: '岡山空港', code: 'OKJ', lat: 34.7569, lng: 133.8551 },
  { name: '広島空港', code: 'HIJ', lat: 34.4361, lng: 132.9192 },
  { name: '山口宇部空港', code: 'UBJ', lat: 33.9300, lng: 131.2789 },
  { name: '高松空港', code: 'TAK', lat: 34.2142, lng: 134.0156 },
  { name: '松山空港', code: 'MYJ', lat: 33.8272, lng: 132.6997 },
  { name: '高知空港', code: 'KCZ', lat: 33.5461, lng: 133.6694 },
  { name: '福岡空港', code: 'FUK', lat: 33.5859, lng: 130.4511 },
  { name: '熊本空港', code: 'KMJ', lat: 32.8373, lng: 130.8551 },
  { name: '大分空港', code: 'OIT', lat: 33.4794, lng: 131.7372 },
  { name: '宮崎空港', code: 'KMI', lat: 31.8772, lng: 131.4492 },
  { name: '鹿児島空港', code: 'KOJ', lat: 31.8034, lng: 130.7196 },
  { name: '屋久島空港', code: 'KUM', lat: 30.3856, lng: 130.6589 },
];

/** 主要新幹線駅・空港付近のタイムズカーシェアステーション */
export const TIMES_CARSHARE_STATIONS: TimesCarShareStation[] = [
  // 東北方面
  { name: 'タイムズ大宮駅東口', lat: 35.9068, lng: 139.6270, nearHub: '大宮' },
  { name: 'タイムズ宇都宮駅西口', lat: 36.5590, lng: 139.8960, nearHub: '宇都宮' },
  { name: 'タイムズ那須塩原駅前', lat: 36.9580, lng: 139.9535, nearHub: '那須塩原' },
  { name: 'タイムズ郡山駅前', lat: 37.3985, lng: 140.3890, nearHub: '郡山' },
  { name: 'タイムズ福島駅東口', lat: 37.7545, lng: 140.4600, nearHub: '福島' },
  { name: 'タイムズ仙台駅東口', lat: 38.2605, lng: 140.8835, nearHub: '仙台' },
  { name: 'タイムズ盛岡駅前', lat: 39.7015, lng: 141.1375, nearHub: '盛岡' },
  { name: 'タイムズ新青森駅前', lat: 40.8248, lng: 140.6978, nearHub: '新青森' },
  // 上越・北陸方面
  { name: 'タイムズ高崎駅東口', lat: 36.3225, lng: 139.0150, nearHub: '高崎' },
  { name: 'タイムズ越後湯沢駅前', lat: 36.9335, lng: 138.8165, nearHub: '越後湯沢' },
  { name: 'タイムズ長岡駅前', lat: 37.4500, lng: 138.8535, nearHub: '長岡' },
  { name: 'タイムズ新潟駅前', lat: 37.9135, lng: 139.0640, nearHub: '新潟' },
  { name: 'タイムズ軽井沢駅前', lat: 36.3445, lng: 138.6370, nearHub: '軽井沢' },
  { name: 'タイムズ長野駅善光寺口', lat: 36.6435, lng: 138.1870, nearHub: '長野' },
  { name: 'タイムズ富山駅前', lat: 36.7015, lng: 137.2140, nearHub: '富山' },
  { name: 'タイムズ金沢駅前', lat: 36.5785, lng: 136.6490, nearHub: '金沢' },
  { name: 'タイムズ福井駅前', lat: 36.0628, lng: 136.2242, nearHub: '福井' },
  // 東海道方面
  { name: 'タイムズ新横浜駅前', lat: 35.5075, lng: 139.6180, nearHub: '新横浜' },
  { name: 'タイムズ三島駅前', lat: 35.1268, lng: 138.9125, nearHub: '三島' },
  { name: 'タイムズ静岡駅前', lat: 34.9715, lng: 138.3880, nearHub: '静岡' },
  { name: 'タイムズ名古屋駅前', lat: 35.1710, lng: 136.8830, nearHub: '名古屋' },
  { name: 'タイムズ京都駅前', lat: 34.9858, lng: 135.7585, nearHub: '京都' },
  { name: 'タイムズ新大阪駅前', lat: 34.7336, lng: 135.5005, nearHub: '新大阪' },
  // 山陽方面
  { name: 'タイムズ岡山駅前', lat: 34.6665, lng: 133.9182, nearHub: '岡山' },
  { name: 'タイムズ広島駅前', lat: 34.3988, lng: 132.4755, nearHub: '広島' },
  { name: 'タイムズ博多駅前', lat: 33.5900, lng: 130.4210, nearHub: '博多' },
  // 空港付近
  { name: 'タイムズ新千歳空港', lat: 42.7755, lng: 141.6930, nearHub: '新千歳空港' },
  { name: 'タイムズ仙台空港', lat: 38.1400, lng: 140.9180, nearHub: '仙台空港' },
  { name: 'タイムズ松本空港', lat: 36.1670, lng: 137.9230, nearHub: '松本空港' },
  // 秋田・山形方面
  { name: 'タイムズ秋田駅前', lat: 39.7175, lng: 140.1035, nearHub: '秋田' },
  { name: 'タイムズ山形駅前', lat: 38.2490, lng: 140.3280, nearHub: '山形' },
];

/** 予約サイトURL */
export const BOOKING_SITES = {
  ekinet: { name: 'えきねっと', url: 'https://www.eki-net.com/' },
  smartex: { name: 'SmartEX', url: 'https://smart-ex.jp/' },
  skyticket: { name: 'skyticket', url: 'https://skyticket.jp/' },
  bushikaku: { name: 'バス比較なび', url: 'https://www.bushikaku.net/' },
  timescar: { name: 'タイムズカーシェア', url: 'https://share.timescar.jp/' },
} as const;
