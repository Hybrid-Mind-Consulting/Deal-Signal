import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

import { AppLayout } from '@/components/layout/AppLayout';
import Portfolio from '@/pages/Portfolio';
import Watchtower from '@/pages/Watchtower';
import Signals from '@/pages/Signals';
import DealBrief from '@/pages/DealBrief';
import AskWatchtower from '@/pages/AskWatchtower';
import AnalysisTrace from '@/pages/AnalysisTrace';
import DataSources from '@/pages/DataSources';
import Settings from '@/pages/Settings';
import SignalDetail from '@/pages/SignalDetail';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <AppLayout>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Portfolio} />
          <Route path="/watchtower" component={Watchtower} />
          <Route path="/signals" component={Signals} />
          <Route path="/deal-brief" component={DealBrief} />
          <Route path="/ask-watchtower" component={AskWatchtower} />
          <Route path="/analysis-trace" component={AnalysisTrace} />
          <Route path="/signals/customer-concentration" component={SignalDetail} />
          <Route path="/data-sources" component={DataSources} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </AppLayout>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
