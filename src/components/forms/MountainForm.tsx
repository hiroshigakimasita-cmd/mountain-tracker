import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { MOUNTAIN_CATEGORIES } from '../../types/index.ts';
import type { Mountain, MountainFormData, MountainCategory } from '../../types/index.ts';

interface MountainFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MountainFormData) => void;
  onDelete?: () => void;
  editingMountain?: Mountain | null;
  initialLat?: number;
  initialLng?: number;
}

const emptyForm: MountainFormData = {
  name: '',
  elevation: '',
  lat: '',
  lng: '',
  category: 'その他',
  isClimbed: false,
  climbDate: '',
  notes: '',
};

export function MountainForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingMountain,
  initialLat,
  initialLng,
}: MountainFormProps) {
  const [form, setForm] = useState<MountainFormData>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingMountain) {
      setForm({
        name: editingMountain.name,
        elevation: String(editingMountain.elevation),
        lat: String(editingMountain.lat),
        lng: String(editingMountain.lng),
        category: editingMountain.category,
        isClimbed: editingMountain.isClimbed,
        climbDate: editingMountain.climbDate ?? '',
        notes: editingMountain.notes,
      });
    } else {
      setForm({
        ...emptyForm,
        lat: initialLat != null ? initialLat.toFixed(5) : '',
        lng: initialLng != null ? initialLng.toFixed(5) : '',
      });
    }
    setShowDeleteConfirm(false);
  }, [editingMountain, initialLat, initialLng, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.lat || !form.lng) return;
    onSubmit(form);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMountain ? '山を編集' : '山を追加'}
    >
      <form onSubmit={handleSubmit} className="mountain-form">
        <div className="form-group">
          <label>山名 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例: 富士山"
            required
          />
        </div>

        <div className="form-group">
          <label>標高 (m)</label>
          <input
            type="number"
            value={form.elevation}
            onChange={(e) => setForm({ ...form, elevation: e.target.value })}
            placeholder="例: 3776"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>緯度 *</label>
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              placeholder="例: 35.36074"
              required
            />
          </div>
          <div className="form-group">
            <label>経度 *</label>
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              placeholder="例: 138.72743"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>カテゴリ</label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as MountainCategory })
            }
          >
            {MOUNTAIN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group form-checkbox">
          <label>
            <input
              type="checkbox"
              checked={form.isClimbed}
              onChange={(e) => setForm({ ...form, isClimbed: e.target.checked })}
            />
            登頂済み
          </label>
        </div>

        {form.isClimbed && (
          <div className="form-group">
            <label>登頂日</label>
            <input
              type="date"
              value={form.climbDate}
              onChange={(e) => setForm({ ...form, climbDate: e.target.value })}
            />
          </div>
        )}

        <div className="form-group">
          <label>メモ</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="メモ（任意）"
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingMountain ? '更新' : '追加'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            キャンセル
          </button>
          {editingMountain && onDelete && (
            <>
              {showDeleteConfirm ? (
                <div className="delete-confirm">
                  <span>本当に削除しますか？</span>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      onDelete();
                      onClose();
                    }}
                  >
                    削除する
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    やめる
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  削除
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
