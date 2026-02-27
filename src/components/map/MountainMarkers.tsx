import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { Mountain, MountainCategory } from '../../types/index.ts';

function createIcon(color: string, symbol: string = '▲'): L.DivIcon {
  return L.divIcon({
    className: 'mountain-marker-icon',
    html: `<svg width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z"
            fill="${color}" stroke="#fff" stroke-width="2"/>
      <text x="14" y="18" text-anchor="middle" fill="#fff" font-size="14">${symbol}</text>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

// 登頂済み: 緑
const climbedIcon = createIcon('#27ae60');

// 未登頂: カテゴリ別に色分け
const unclimbedIcons: Record<MountainCategory, L.DivIcon> = {
  '百名山': createIcon('#dc2626'),   // 赤
  '二百名山': createIcon('#ea580c'), // オレンジ
  '三百名山': createIcon('#ca8a04'), // 黄
  'その他': createIcon('#95a5a6'),   // グレー
};

function getIcon(mountain: Mountain): L.DivIcon {
  if (mountain.isClimbed) return climbedIcon;
  return unclimbedIcons[mountain.category] ?? unclimbedIcons['その他'];
}

interface MountainMarkersProps {
  mountains: Mountain[];
  onEdit: (mountain: Mountain) => void;
  onToggleClimbed: (id: string) => void;
  onSelect: (id: string) => void;
}

export function MountainMarkers({
  mountains,
  onEdit,
  onToggleClimbed,
  onSelect,
}: MountainMarkersProps) {
  return (
    <>
      {mountains.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={getIcon(m)}
          eventHandlers={{ click: () => onSelect(m.id) }}
        >
          <Popup>
            <div className="popup-content">
              <h3>{m.name}</h3>
              <p className="popup-elevation">{m.elevation}m</p>
              <p>
                <span className={`badge badge-${m.category === 'その他' ? 'other' : m.category}`}>
                  {m.category}
                </span>
              </p>
              {m.isClimbed && m.climbDate && (
                <p className="popup-date">登頂日: {m.climbDate}</p>
              )}
              {m.notes && <p className="popup-notes">{m.notes}</p>}
              <div className="popup-actions">
                <button onClick={() => onEdit(m)}>編集</button>
                <button onClick={() => onToggleClimbed(m.id)}>
                  {m.isClimbed ? '未登頂にする' : '登頂済みにする'}
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
