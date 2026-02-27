import { useRef, useState } from 'react';
import { parseGpxFile, type ParsedGpxData } from '../../utils/gpxParser.ts';

interface GpxUploadFormProps {
  onUpload: (parsed: ParsedGpxData & { fileName: string }, rawGpx: string) => void;
}

export function GpxUploadForm({ onUpload }: GpxUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const gpxString = ev.target?.result as string;
        const parsed = parseGpxFile(gpxString, file.name);
        onUpload({ ...parsed, fileName: file.name }, gpxString);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'GPXファイルの読み込みに失敗しました');
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setError('ファイルの読み込みに失敗しました');
      setLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="gpx-upload">
      <label className="btn btn-primary gpx-upload-btn">
        {loading ? '読み込み中...' : 'GPXファイルをアップロード'}
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          onChange={handleFileChange}
          disabled={loading}
          hidden
        />
      </label>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
