import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { trpc, getTRPCClient } from './utils/trpc';
import { ValidationDashboard } from './components/validation/ValidationDashboard';
import { ReportsPage } from './pages/ReportsPage';
import { ContractAuditPage } from './pages/ContractAuditPage';
import { DiscrepancyReport } from './components/contractAudit/DiscrepancyReport';
import { MerchantProfilePage } from './pages/MerchantProfilePage';
import { AccountManagerDashboardPage } from './pages/AccountManagerDashboardPage';
import { TranscriptionUploadPage } from './pages/TranscriptionUploadPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { AdminPage } from './pages/AdminPage';
import './i18n/config';
import './index.css';

const queryClient = new QueryClient();
const trpcClient = getTRPCClient();

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Phase 7 – Dashboard & UI */}
            <Route path="/dashboard" element={<AccountManagerDashboardPage />} />
            <Route path="/transcription/upload" element={<TranscriptionUploadPage />} />
            <Route path="/audio/upload" element={<TranscriptionUploadPage />} />
            <Route path="/notifications" element={<NotificationCenterPage />} />
            {/* Existing phases */}
            <Route path="/validation" element={<ValidationDashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/contract-audit" element={<ContractAuditPage />} />
            <Route path="/audits/:auditId" element={<DiscrepancyReport />} />
            <Route path="/merchant-profiles" element={<MerchantProfilePage />} />
            <Route path="/merchant-profiles/:merchantId" element={<MerchantProfilePage />} />
            {/* Phase 8 – Admin */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/:section" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
