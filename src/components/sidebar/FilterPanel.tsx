import { MOUNTAIN_CATEGORIES } from '../../types/index.ts';
import type { MountainFilter, MountainCategory } from '../../types/index.ts';

interface FilterPanelProps {
  filter: MountainFilter;
  onChange: (filter: MountainFilter) => void;
}

export function FilterPanel({ filter, onChange }: FilterPanelProps) {
  const toggleCategory = (cat: MountainCategory) => {
    const cats = filter.categories.includes(cat)
      ? filter.categories.filter((c) => c !== cat)
      : [...filter.categories, cat];
    onChange({ ...filter, categories: cats });
  };

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <input
          type="text"
          className="filter-search"
          placeholder="山名で検索..."
          value={filter.searchText}
          onChange={(e) => onChange({ ...filter, searchText: e.target.value })}
        />
      </div>

      <div className="filter-section">
        <div className="filter-label">登頂状態</div>
        <div className="filter-radio-group">
          {([
            ['all', 'すべて'],
            ['climbed', '登頂済み'],
            ['unclimbed', '未登頂'],
          ] as const).map(([value, label]) => (
            <label key={value} className="filter-radio">
              <input
                type="radio"
                name="climbedStatus"
                value={value}
                checked={filter.climbedStatus === value}
                onChange={() =>
                  onChange({ ...filter, climbedStatus: value })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">カテゴリ</div>
        <div className="filter-checkbox-group">
          {MOUNTAIN_CATEGORIES.map((cat) => (
            <label key={cat} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filter.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
