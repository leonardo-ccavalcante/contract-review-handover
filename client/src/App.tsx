import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DashboardLayout from "./components/DashboardLayout";
import UploadTranscription from "./pages/UploadTranscription";
import UploadAudio from "./pages/UploadAudio";
import UploadContract from "./pages/UploadContract";
import TranscriptionsList from "./pages/TranscriptionsList";
import ContractsList from "./pages/ContractsList";
import MerchantsList from "./pages/MerchantsList";
import MerchantDetail from "./pages/MerchantDetail";
import ValidationQueue from "./pages/ValidationQueue";
import AuditsList from "./pages/AuditsList";
import AdminPanel from "./pages/AdminPanel";
import Notifications from "./pages/Notifications";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      
      {/* Dashboard routes */}
      <Route path={"/dashboard"}>
        {() => (
          <DashboardLayout>
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Bienvenido al sistema de automatización de handover de ventas</p>
            </div>
          </DashboardLayout>
        )}
      </Route>
      
      {/* Upload routes */}
      <Route path={"/upload/transcription"}>
        {() => (
          <DashboardLayout>
            <UploadTranscription />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path={"/upload/audio"}>
        {() => (
          <DashboardLayout>
            <UploadAudio />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path={"/upload/contract"}>
        {() => (
          <DashboardLayout>
            <UploadContract />
          </DashboardLayout>
        )}
      </Route>
      
      {/* List routes */}
      <Route path={"/transcriptions"}>
        {() => (
          <DashboardLayout>
            <TranscriptionsList />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path={"/contracts"}>
        {() => (
          <DashboardLayout>
            <ContractsList />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path={"/merchants"}>
        {() => (
          <DashboardLayout>
            <MerchantsList />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path={"/merchants/:profileId"}>
        {(params) => (
          <DashboardLayout>
            <MerchantDetail profileId={params.profileId} />
          </DashboardLayout>
        )}
      </Route>
      
      {/* Validation & Audit routes */}
      <Route path={"/validations"}>
        {() => (
          <DashboardLayout>
            <ValidationQueue />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path={"/audits"}>
        {() => (
          <DashboardLayout>
            <AuditsList />
          </DashboardLayout>
        )}
      </Route>
      
      {/* Admin routes */}
      <Route path={"/admin"}>
        {() => (
          <DashboardLayout>
            <AdminPanel />
          </DashboardLayout>
        )}
      </Route>
      
      {/* Notifications */}
      <Route path={"/notifications"}>
        {() => (
          <DashboardLayout>
            <Notifications />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
