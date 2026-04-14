import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage";

export default function App() {
  return (
    <div className="min-h-screen">
      <Authenticated>
        <Dashboard />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      <Toaster richColors position="top-right" />
    </div>
  );
}
