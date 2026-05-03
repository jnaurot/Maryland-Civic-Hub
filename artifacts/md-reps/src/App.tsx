import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Home } from "@/pages/Home";
import { FederalRepDetail } from "@/pages/FederalRepDetail";
import { StateRepDetail } from "@/pages/StateRepDetail";
import { FederalBills } from "@/pages/FederalBills";
import { StateBills } from "@/pages/StateBills";
import { FederalBillDetail } from "@/pages/FederalBillDetail";
import { StateBillDetail } from "@/pages/StateBillDetail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/rep/federal/:bioguideId" component={FederalRepDetail} />
          <Route path="/rep/state/:memberId" component={StateRepDetail} />
          <Route path="/bills/federal" component={FederalBills} />
          <Route path="/bills/federal/:congress/:billType/:billNumber" component={FederalBillDetail} />
          <Route path="/bills/state" component={StateBills} />
          <Route path="/bills/state/:billId" component={StateBillDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
