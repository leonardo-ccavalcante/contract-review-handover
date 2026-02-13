import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { trpc } from '../../utils/trpc';

interface LayoutProps {
  children: ReactNode;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
    isActive
      ? 'border-bolt-green text-gray-900 dark:text-white'
      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
  }`;

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation('common');
  const nav = useNavigate();
  const { data: notifications } = trpc.admin.getNotifications.useQuery(
    { unreadOnly: true },
    { staleTime: 30_000 }
  );
  const unreadCount = (notifications ?? []).length;

  return (
    <div className="min-h-screen bg-bolt-light dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-card border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <button className="flex items-center gap-3" onClick={() => nav('/dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-bolt-green flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t('app.title')}</p>
                <p className="text-xs text-gray-400 leading-tight">{t('app.subtitle')}</p>
              </div>
            </button>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => nav('/notifications')}
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto">
            <NavLink to="/dashboard"            className={navLinkClass}>{t('navigation.dashboard')}</NavLink>
            <NavLink to="/validation"           className={navLinkClass}>{t('navigation.queue')}</NavLink>
            <NavLink to="/contract-audit"       className={navLinkClass}>{t('navigation.contractAudit')}</NavLink>
            <NavLink to="/merchant-profiles"    className={navLinkClass}>{t('navigation.merchantProfiles')}</NavLink>
            <NavLink to="/transcription/upload" className={navLinkClass}>{t('navigation.upload')}</NavLink>
            <NavLink to="/reports"              className={navLinkClass}>{t('navigation.reports')}</NavLink>
            <NavLink to="/admin"                className={navLinkClass}>{t('navigation.admin')}</NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            © 2026 Bolt Merchant Automation · Pre-Contract Validation System
          </p>
        </div>
      </footer>
    </div>
  );
}
