import { Navigate } from "react-router-dom";
import { useAppState } from "@/lib/store";
import Onboarding from "./Onboarding";
import Home from "./Home";
import AppShell from "@/components/AppShell";

const Index = () => {
  const { state } = useAppState();
  if (!state.onboarded || !state.plan) return <Onboarding />;
  return (
    <AppShell>
      <Home />
    </AppShell>
  );
};

export default Index;
export const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAppState();
  if (!state.onboarded || !state.plan) return <Navigate to="/" replace />;
  return <AppShell>{children}</AppShell>;
};
