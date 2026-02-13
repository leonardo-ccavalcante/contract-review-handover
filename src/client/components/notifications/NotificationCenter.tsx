import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useNavigate } from 'react-router-dom';

const typeIcon: Record<string, string> = {
  VALIDATION_FAILED: '❌',
  VALIDATION_PASSED: '✅',
  MANUAL_REVIEW_REQUIRED: '🔍',
  OVERRIDE_REQUESTED: '⚡',
  OVERRIDE_APPROVED: '✅',
  AUDIT_DISCREPANCY: '⚠️',
  AUDIT_RESOLVED: '✅',
  PROFILE_CREATED: '👤',
  PROFILE_UPDATED: '✏️',
  SYSTEM_ALERT: '🔔',
};

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationCenter() {
  const { t } = useTranslation('admin');
  const nav = useNavigate();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: notifications, refetch } = trpc.admin.getNotifications.useQuery({ unreadOnly });
  const markRead = trpc.admin.markNotificationRead.useMutation({ onSuccess: () => refetch() });
  const markAll = trpc.admin.markAllRead.useMutation({ onSuccess: () => refetch() });

  const unreadCount = (notifications ?? []).filter((n: any) => !n.is_read).length;

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('notifications.title')}</h1>
          {unreadCount > 0 && (
            <span className="badge-amber mt-1">{unreadCount} unread</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)}
              className="accent-bolt-green" />
            {t('notifications.unreadOnly')}
          </label>
          {unreadCount > 0 && (
            <button className="btn-secondary text-xs" onClick={() => markAll.mutate()}>
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
      </div>

      <div className="card divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
        {!notifications?.length ? (
          <div className="p-8 text-center text-gray-400">{t('notifications.noNotifications')}</div>
        ) : (
          (notifications as any[]).map((n: any) => (
            <div
              key={n.notification_id}
              className={`flex items-start gap-3 p-4 transition-colors cursor-pointer
                         hover:bg-bolt-green-50 dark:hover:bg-gray-700/50
                         ${!n.is_read ? 'bg-bolt-green-light/30' : ''}`}
              onClick={() => {
                if (!n.is_read) markRead.mutate({ notificationId: n.notification_id });
                if (n.action_url) nav(n.action_url);
              }}
            >
              <span className="text-lg leading-none mt-0.5">{typeIcon[n.notification_type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium truncate ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {n.title}
                  </p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
              </div>
              {!n.is_read && <span className="w-2 h-2 rounded-full bg-bolt-green mt-1.5 flex-shrink-0"></span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
