import type { AppData, Mountain, GpxTrack } from '../types/index.ts';

const CURRENT_VERSION = 1;

export function exportData(mountains: Mountain[], gpxTracks: GpxTrack[]): void {
  const data: AppData = { mountains, gpxTracks, version: CURRENT_VERSION };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mountain-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(
  file: File,
): Promise<{ mountains: Mountain[]; gpxTracks: GpxTrack[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AppData;
        if (!Array.isArray(data.mountains) || !Array.isArray(data.gpxTracks)) {
          throw new Error('Invalid data format');
        }
        resolve({ mountains: data.mountains, gpxTracks: data.gpxTracks });
      } catch {
        reject(new Error('バックアップファイルの読み込みに失敗しました'));
      }
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file);
  });
}
