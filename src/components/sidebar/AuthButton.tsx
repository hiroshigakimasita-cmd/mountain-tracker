import type { User } from 'firebase/auth';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface AuthButtonProps {
  user: User | null;
  isConfigured: boolean;
  syncStatus: SyncStatus;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function AuthButton({ user, isConfigured, syncStatus, onSignIn, onSignOut }: AuthButtonProps) {
  if (!isConfigured) {
    return null;
  }

  if (!user) {
    return (
      <div className="auth-section">
        <button className="btn btn-sm btn-primary auth-login-btn" onClick={onSignIn}>
          Google でログイン
        </button>
      </div>
    );
  }

  const syncLabel = {
    idle: '',
    syncing: '同期中...',
    synced: '同期済み',
    error: '同期エラー',
  }[syncStatus];

  return (
    <div className="auth-section">
      <div className="auth-user-info">
        {user.photoURL && (
          <img className="auth-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        )}
        <span className="auth-user-name">{user.displayName || user.email}</span>
        {syncLabel && (
          <span className={`sync-status sync-status-${syncStatus}`}>{syncLabel}</span>
        )}
      </div>
      <button className="btn btn-sm btn-secondary auth-logout-btn" onClick={onSignOut}>
        ログアウト
      </button>
    </div>
  );
}
