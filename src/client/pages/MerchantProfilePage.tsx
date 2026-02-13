import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/common/Layout';
import { ProfileDashboard } from '../components/merchantProfile/ProfileDashboard';
import { ProfileDetail } from '../components/merchantProfile/ProfileDetail';

export function MerchantProfilePage() {
  const { merchantId } = useParams<{ merchantId?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('merchantProfile');

  return (
    <Layout>
      <div className="space-y-4">
        {merchantId ? (
          <>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/merchant-profiles')}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← {t('page.backToList')}
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('page.detailTitle')}
              </h1>
            </div>
            <ProfileDetail merchantId={merchantId} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('page.title')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('page.subtitle')}</p>
            </div>
            <ProfileDashboard />
          </>
        )}
      </div>
    </Layout>
  );
}
