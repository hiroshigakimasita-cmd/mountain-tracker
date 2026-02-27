import { MOUNTAIN_CATEGORIES } from '../../types/index.ts';
import type { Mountain, GpxTrack } from '../../types/index.ts';

interface StatsPanelProps {
  mountains: Mountain[];
  gpxTracks: GpxTrack[];
}

export function StatsPanel({ mountains, gpxTracks }: StatsPanelProps) {
  const totalClimbed = mountains.filter((m) => m.isClimbed).length;

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{mountains.length}</div>
          <div className="stat-label">登録数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalClimbed}</div>
          <div className="stat-label">登頂済み</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{mountains.length - totalClimbed}</div>
          <div className="stat-label">未登頂</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{gpxTracks.length}</div>
          <div className="stat-label">GPXトラック</div>
        </div>
      </div>

      <h3 className="stats-section-title">カテゴリ別</h3>
      <div className="stats-categories">
        {MOUNTAIN_CATEGORIES.map((cat) => {
          const total = mountains.filter((m) => m.category === cat).length;
          const climbed = mountains.filter(
            (m) => m.category === cat && m.isClimbed,
          ).length;
          if (total === 0) return null;
          return (
            <div key={cat} className="stats-category-row">
              <span className="stats-category-name">{cat}</span>
              <span className="stats-category-count">
                {climbed} / {total}
              </span>
              <div className="stats-bar">
                <div
                  className="stats-bar-fill"
                  style={{ width: `${total > 0 ? (climbed / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
