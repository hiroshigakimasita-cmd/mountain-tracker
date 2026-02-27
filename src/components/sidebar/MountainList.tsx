import type { Mountain } from '../../types/index.ts';

interface MountainListProps {
  mountains: Mountain[];
  selectedId: string | null;
  onSelect: (mountain: Mountain) => void;
}

export function MountainList({ mountains, selectedId, onSelect }: MountainListProps) {
  if (mountains.length === 0) {
    return <div className="mountain-list-empty">山が登録されていません</div>;
  }

  return (
    <div className="mountain-list">
      {mountains.map((m) => (
        <div
          key={m.id}
          className={`mountain-list-item ${selectedId === m.id ? 'selected' : ''} ${m.isClimbed ? 'climbed' : 'unclimbed'}`}
          onClick={() => onSelect(m)}
        >
          <div className="mountain-list-item-header">
            <span className={`status-dot ${m.isClimbed ? 'dot-climbed' : 'dot-unclimbed'}`} />
            <span className="mountain-list-name">{m.name}</span>
            <span className="mountain-list-elevation">{m.elevation}m</span>
          </div>
          <div className="mountain-list-item-meta">
            <span className={`badge badge-sm badge-${m.category === 'その他' ? 'other' : m.category}`}>
              {m.category}
            </span>
            {m.isClimbed && m.climbDate && (
              <span className="mountain-list-date">{m.climbDate}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
