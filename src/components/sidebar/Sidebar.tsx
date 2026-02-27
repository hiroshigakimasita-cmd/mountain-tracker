import { useState, useRef } from 'react';
import { FilterPanel } from './FilterPanel.tsx';
import { MountainList } from './MountainList.tsx';
import { StatsPanel } from './StatsPanel.tsx';
import { RecommendationPanel } from './RecommendationPanel.tsx';
import { AuthButton, type SyncStatus } from './AuthButton.tsx';
import { GpxUploadForm } from '../forms/GpxUploadForm.tsx';
import { exportData, importData } from '../../utils/exportImport.ts';
import type { Mountain, GpxTrack, MountainFilter } from '../../types/index.ts';
import type { ParsedGpxData } from '../../utils/gpxParser.ts';
import type { MountainRecommendation } from '../../utils/weatherScoring.ts';
import type { User } from 'firebase/auth';

type Tab = 'mountains' | 'gpx' | 'stats' | 'recommend';

interface SidebarProps {
  mountains: Mountain[];
  allMountains: Mountain[];
  gpxTracks: GpxTrack[];
  filter: MountainFilter;
  onFilterChange: (filter: MountainFilter) => void;
  selectedMountainId: string | null;
  onSelectMountain: (mountain: Mountain) => void;
  onAddMountainClick: () => void;
  onGpxUpload: (parsed: ParsedGpxData & { fileName: string }, rawGpx: string) => void;
  onDeleteTrack: (id: string) => void;
  onImportData: (mountains: Mountain[], gpxTracks: GpxTrack[]) => void;
  mapMode: string;
  onCancelAddMode: () => void;
  onLoadPreset: () => void;
  // Weather recommendations
  recommendations: Map<string, MountainRecommendation[]>;
  recommendationsLoading: boolean;
  recommendationsError: string | null;
  recommendationsLastUpdated: string | null;
  recommendationsProgress: { completed: number; total: number } | null;
  onRefreshRecommendations: () => void;
  onAccessPlan: (mountain: Mountain, date: string) => void;
  // Auth
  user: User | null;
  firebaseConfigured: boolean;
  syncStatus: SyncStatus;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Sidebar({
  mountains,
  allMountains,
  gpxTracks,
  filter,
  onFilterChange,
  selectedMountainId,
  onSelectMountain,
  onAddMountainClick,
  onGpxUpload,
  onDeleteTrack,
  onImportData,
  mapMode,
  onCancelAddMode,
  onLoadPreset,
  recommendations,
  recommendationsLoading,
  recommendationsError,
  recommendationsLastUpdated,
  recommendationsProgress,
  onRefreshRecommendations,
  onAccessPlan,
  user,
  firebaseConfigured,
  syncStatus,
  onSignIn,
  onSignOut,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('mountains');
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importData(file);
      onImportData(data.mountains, data.gpxTracks);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'インポートに失敗しました');
    }
    if (importInputRef.current) importInputRef.current.value = '';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>山岳登頂トラッカー</h1>
        <AuthButton
          user={user}
          isConfigured={firebaseConfigured}
          syncStatus={syncStatus}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
        />
      </div>

      <div className="sidebar-tabs">
        <button
          className={`tab ${activeTab === 'mountains' ? 'active' : ''}`}
          onClick={() => setActiveTab('mountains')}
        >
          山リスト
        </button>
        <button
          className={`tab ${activeTab === 'gpx' ? 'active' : ''}`}
          onClick={() => setActiveTab('gpx')}
        >
          GPX
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          統計
        </button>
        <button
          className={`tab ${activeTab === 'recommend' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommend')}
        >
          おすすめ
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'mountains' && (
          <>
            <div className="sidebar-actions">
              {mapMode === 'addMountain' ? (
                <button className="btn btn-secondary btn-full" onClick={onCancelAddMode}>
                  追加モードを解除
                </button>
              ) : (
                <button className="btn btn-primary btn-full" onClick={onAddMountainClick}>
                  + 山を追加（地図クリック）
                </button>
              )}
            </div>
            <FilterPanel filter={filter} onChange={onFilterChange} />
            <div className="mountain-list-count">
              {mountains.length} 件表示 / {allMountains.length} 件登録
            </div>
            <MountainList
              mountains={mountains}
              selectedId={selectedMountainId}
              onSelect={onSelectMountain}
            />
          </>
        )}

        {activeTab === 'gpx' && (
          <>
            <div className="sidebar-actions">
              <GpxUploadForm onUpload={onGpxUpload} />
            </div>
            <div className="gpx-track-list">
              {gpxTracks.length === 0 ? (
                <div className="gpx-empty">GPXトラックがありません</div>
              ) : (
                gpxTracks.map((track) => (
                  <div key={track.id} className="gpx-track-item">
                    <div
                      className="gpx-track-color"
                      style={{ backgroundColor: track.color }}
                    />
                    <div className="gpx-track-info">
                      <div className="gpx-track-name">{track.name}</div>
                      <div className="gpx-track-meta">
                        {track.trackDate && <span>{track.trackDate}</span>}
                        {track.totalDistance != null && (
                          <span>{(track.totalDistance / 1000).toFixed(1)} km</span>
                        )}
                        {track.elevationGain != null && (
                          <span>↑{track.elevationGain}m</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDeleteTrack(track.id)}
                    >
                      削除
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <StatsPanel mountains={allMountains} gpxTracks={gpxTracks} />
        )}

        {activeTab === 'recommend' && (
          <RecommendationPanel
            recommendations={recommendations}
            loading={recommendationsLoading}
            error={recommendationsError}
            lastUpdated={recommendationsLastUpdated}
            progress={recommendationsProgress}
            onRefresh={onRefreshRecommendations}
            onSelectMountain={onSelectMountain}
            onAccessPlan={onAccessPlan}
          />
        )}
      </div>

      <div className="sidebar-footer">
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => exportData(allMountains, gpxTracks)}
        >
          エクスポート
        </button>
        <label className="btn btn-sm btn-secondary">
          インポート
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            hidden
          />
        </label>
        <button
          className="btn btn-sm btn-secondary"
          onClick={onLoadPreset}
          title="百名山・二百名山・三百名山（301座）を再読み込み"
        >
          301座再読込
        </button>
      </div>
    </aside>
  );
}
