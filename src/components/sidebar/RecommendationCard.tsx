import type { MountainRecommendation } from '../../utils/weatherScoring.ts';
import type { Mountain } from '../../types/index.ts';

interface RecommendationCardProps {
  rec: MountainRecommendation;
  onSelect: (mountain: Mountain) => void;
  onAccessPlan: (mountain: Mountain, date: string) => void;
}

export function RecommendationCard({ rec, onSelect, onAccessPlan }: RecommendationCardProps) {
  const scoreColor = rec.score >= 80 ? '#27ae60' : '#f39c12';
  const scoreWidth = `${rec.score}%`;

  const categoryClass = rec.mountain.category === 'その他' ? 'other' : rec.mountain.category;

  return (
    <div className="recommendation-card" onClick={() => onSelect(rec.mountain)}>
      <div className="rec-card-header">
        <span className="rec-weather-emoji">{rec.weatherEmoji}</span>
        <div className="rec-mountain-info">
          <div className="rec-mountain-name">{rec.mountain.name}</div>
          <div className="rec-mountain-meta">
            <span className={`badge badge-${categoryClass}`}>
              {rec.mountain.category}
            </span>
            <span className="rec-elevation">{rec.mountain.elevation}m</span>
          </div>
        </div>
        <div className="rec-score" style={{ color: scoreColor }}>
          {rec.score}
        </div>
      </div>
      <div className="rec-score-bar">
        <div
          className="rec-score-bar-fill"
          style={{ width: scoreWidth, backgroundColor: scoreColor }}
        />
      </div>
      <div className="rec-weather-details">
        <span title="天気">{rec.weatherLabel}</span>
        <span title="気温">🌡️ {rec.forecast.temperatureMin}〜{rec.forecast.temperatureMax}℃</span>
        <span title="風速">💨 {rec.forecast.windSpeedMax}km/h</span>
        <span title="降水量">💧 {rec.forecast.precipitationSum}mm</span>
      </div>
      <div className="rec-card-actions">
        <button
          className="btn btn-sm btn-secondary rec-access-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAccessPlan(rec.mountain, rec.date);
          }}
        >
          🚅 アクセス計画
        </button>
      </div>
    </div>
  );
}
