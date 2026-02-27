import { RecommendationCard } from './RecommendationCard.tsx';
import { formatDateDisplay } from '../../utils/dateUtils.ts';
import type { MountainRecommendation } from '../../utils/weatherScoring.ts';
import type { Mountain } from '../../types/index.ts';

interface RecommendationPanelProps {
  recommendations: Map<string, MountainRecommendation[]>;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  progress: { completed: number; total: number } | null;
  onRefresh: () => void;
  onSelectMountain: (mountain: Mountain) => void;
  onAccessPlan: (mountain: Mountain, date: string) => void;
}

export function RecommendationPanel({
  recommendations,
  loading,
  error,
  lastUpdated,
  progress,
  onRefresh,
  onSelectMountain,
  onAccessPlan,
}: RecommendationPanelProps) {
  const sortedDates = Array.from(recommendations.keys()).sort();

  return (
    <div className="recommendation-panel">
      <div className="rec-header">
        <button
          className="btn btn-primary btn-full"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? '取得中...' : '🔄 天気予報を更新'}
        </button>
        {progress && (
          <div className="rec-progress">
            <div className="rec-progress-bar">
              <div
                className="rec-progress-fill"
                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
              />
            </div>
            <span className="rec-progress-text">
              {progress.completed}/{progress.total} 地点
            </span>
          </div>
        )}
        {lastUpdated && (
          <div className="rec-last-updated">最終更新: {lastUpdated}</div>
        )}
      </div>

      {error && (
        <div className="rec-error">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && sortedDates.length === 0 && lastUpdated && (
        <div className="rec-empty">
          <p>おすすめの山が見つかりませんでした。</p>
          <p>天気が良くない週末・祝日が続いているか、未登頂の山がありません。</p>
        </div>
      )}

      {!loading && !error && sortedDates.length === 0 && !lastUpdated && (
        <div className="rec-empty">
          <p>「天気予報を更新」ボタンを押して、</p>
          <p>週末・祝日のおすすめ登山先を確認しましょう！</p>
        </div>
      )}

      {sortedDates.map((dateStr) => {
        const recs = recommendations.get(dateStr) || [];
        return (
          <div key={dateStr} className="rec-date-section">
            <h3 className="rec-date-heading">{formatDateDisplay(dateStr)}</h3>
            <div className="rec-card-list">
              {recs.map((rec) => (
                <RecommendationCard
                  key={`${rec.mountain.id}-${rec.date}`}
                  rec={rec}
                  onSelect={onSelectMountain}
                  onAccessPlan={onAccessPlan}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
