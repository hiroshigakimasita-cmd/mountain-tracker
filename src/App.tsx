import { useState, useCallback, useEffect, useRef } from 'react';
import { MapView } from './components/map/MapView.tsx';
import { Sidebar } from './components/sidebar/Sidebar.tsx';
import { MountainForm } from './components/forms/MountainForm.tsx';
import { AccessPlanModal } from './components/sidebar/AccessPlanModal.tsx';
import { useMountains } from './hooks/useMountains.ts';
import { useGpxTracks } from './hooks/useGpxTracks.ts';
import { useAuth } from './hooks/useAuth.ts';
import { useWeatherRecommendations } from './hooks/useWeatherRecommendations.ts';
import type { Mountain, MapMode, MountainFormData, GpxTrack } from './types/index.ts';
import type { ParsedGpxData } from './utils/gpxParser.ts';
import './App.css';

function App() {
  const { user, signIn, signOut, isConfigured: firebaseConfigured } = useAuth();

  const {
    mountains,
    filteredMountains,
    filter,
    setFilter,
    addMountain,
    updateMountain,
    deleteMountain,
    toggleClimbed,
    linkGpxTrack,
    importMountains,
    loadPresetData,
    syncStatus: mountainsSyncStatus,
  } = useMountains(user);

  const { tracks, addTrack, deleteTrack, importTracks, syncStatus: tracksSyncStatus } = useGpxTracks(user);

  // Combined sync status: show worst status
  const syncStatus = mountainsSyncStatus === 'error' || tracksSyncStatus === 'error'
    ? 'error'
    : mountainsSyncStatus === 'syncing' || tracksSyncStatus === 'syncing'
      ? 'syncing'
      : mountainsSyncStatus === 'synced' || tracksSyncStatus === 'synced'
        ? 'synced'
        : 'idle';

  const {
    recommendations,
    loading: recLoading,
    error: recError,
    lastUpdated: recLastUpdated,
    progress: recProgress,
    fetchRecommendations,
  } = useWeatherRecommendations(mountains);

  const [mapMode, setMapMode] = useState<MapMode>('view');
  const [selectedMountainId, setSelectedMountainId] = useState<string | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Mountain form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingMountain, setEditingMountain] = useState<Mountain | null>(null);
  const [clickedLat, setClickedLat] = useState<number | undefined>();
  const [clickedLng, setClickedLng] = useState<number | undefined>();

  // Access plan modal state
  const [accessPlanOpen, setAccessPlanOpen] = useState(false);
  const [accessPlanMountain, setAccessPlanMountain] = useState<Mountain | null>(null);
  const [accessPlanDate, setAccessPlanDate] = useState<string | null>(null);

  // Auto-load preset data on first launch (skip if syncing from Firestore)
  const presetLoadedRef = useRef(false);
  useEffect(() => {
    if (presetLoadedRef.current) return;
    // Wait for sync to settle before deciding to load presets
    if (syncStatus === 'syncing') return;
    if (mountains.length === 0) {
      presetLoadedRef.current = true;
      const count = loadPresetData();
      console.log(`プリセットデータ ${count} 座を読み込みました`);
    } else {
      presetLoadedRef.current = true;
    }
  }, [mountains.length, syncStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setClickedLat(lat);
    setClickedLng(lng);
    setEditingMountain(null);
    setFormOpen(true);
    setMapMode('view');
  }, []);

  const handleEditMountain = useCallback((mountain: Mountain) => {
    setEditingMountain(mountain);
    setClickedLat(undefined);
    setClickedLng(undefined);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data: MountainFormData) => {
      if (editingMountain) {
        updateMountain(editingMountain.id, data);
      } else {
        addMountain(data);
      }
    },
    [editingMountain, updateMountain, addMountain],
  );

  const handleFormDelete = useCallback(() => {
    if (editingMountain) {
      deleteMountain(editingMountain.id);
    }
  }, [editingMountain, deleteMountain]);

  const handleSelectMountain = useCallback(
    (mountain: Mountain) => {
      setSelectedMountainId(mountain.id);
      setFlyToTarget({ lat: mountain.lat, lng: mountain.lng });
    },
    [],
  );

  const handleGpxUpload = useCallback(
    (parsed: ParsedGpxData & { fileName: string }, rawGpx: string) => {
      const track = addTrack(parsed, rawGpx);
      if (selectedMountainId) {
        linkGpxTrack(selectedMountainId, track.id);
      }
    },
    [addTrack, selectedMountainId, linkGpxTrack],
  );

  const handleImportData = useCallback(
    (importedMountains: Mountain[], importedTracks: GpxTrack[]) => {
      importMountains(importedMountains);
      importTracks(importedTracks);
    },
    [importMountains, importTracks],
  );

  const handleLoadPreset = useCallback(() => {
    if (confirm('既存データを上書きして、百名山・二百名山・三百名山（301座）のプリセットデータを読み込みますか？')) {
      const count = loadPresetData();
      alert(`${count} 座のプリセットデータを読み込みました`);
    }
  }, [loadPresetData]);

  const handleAccessPlan = useCallback((mountain: Mountain, date: string) => {
    setAccessPlanMountain(mountain);
    setAccessPlanDate(date);
    setAccessPlanOpen(true);
  }, []);

  return (
    <div className="app">
      <Sidebar
        mountains={filteredMountains}
        allMountains={mountains}
        gpxTracks={tracks}
        filter={filter}
        onFilterChange={setFilter}
        selectedMountainId={selectedMountainId}
        onSelectMountain={handleSelectMountain}
        onAddMountainClick={() => setMapMode('addMountain')}
        onGpxUpload={handleGpxUpload}
        onDeleteTrack={deleteTrack}
        onImportData={handleImportData}
        mapMode={mapMode}
        onCancelAddMode={() => setMapMode('view')}
        onLoadPreset={handleLoadPreset}
        recommendations={recommendations}
        recommendationsLoading={recLoading}
        recommendationsError={recError}
        recommendationsLastUpdated={recLastUpdated}
        recommendationsProgress={recProgress}
        onRefreshRecommendations={fetchRecommendations}
        onAccessPlan={handleAccessPlan}
        user={user}
        firebaseConfigured={firebaseConfigured}
        syncStatus={syncStatus}
        onSignIn={signIn}
        onSignOut={signOut}
      />
      <MapView
        mountains={filteredMountains}
        gpxTracks={tracks}
        mapMode={mapMode}
        onMapClick={handleMapClick}
        onEditMountain={handleEditMountain}
        onToggleClimbed={toggleClimbed}
        onSelectMountain={(id) => setSelectedMountainId(id)}
        flyToTarget={flyToTarget}
      />
      <MountainForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingMountain(null);
        }}
        onSubmit={handleFormSubmit}
        onDelete={handleFormDelete}
        editingMountain={editingMountain}
        initialLat={clickedLat}
        initialLng={clickedLng}
      />
      <AccessPlanModal
        isOpen={accessPlanOpen}
        onClose={() => {
          setAccessPlanOpen(false);
          setAccessPlanMountain(null);
          setAccessPlanDate(null);
        }}
        mountain={accessPlanMountain}
        date={accessPlanDate}
      />
    </div>
  );
}

export default App;
