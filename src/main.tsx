import { createRoot } from "react-dom/client";
import { useState } from "react";
import Landing from "./app/Landing.tsx";
import Auth from "./app/Auth.tsx";
import OnboardingWizard from "./app/OnboardingWizard.tsx";
import App from "./app/App.tsx";
import type { SessionUser, Screen } from "./types.ts";
import "./styles/index.css";

function Root() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [session, setSession] = useState<SessionUser | null>(null);
  const [firstShopName, setFirstShopName] = useState("");
  const [firstShopAddress, setFirstShopAddress] = useState("");

  const handleAuthSuccess = (user: SessionUser) => {
    setSession(user);
    // STAFF don't create a shop — they join an existing one, skip onboarding
    if (user.role === "STAFF") {
      setFirstShopName("Warsaw Flagship");
      setFirstShopAddress("ul. Nowy Świat 14, Warsaw");
      setScreen("app");
    } else {
      setScreen("onboarding");
    }
  };

  const handleOnboardingComplete = (shopName: string, shopAddress: string) => {
    setFirstShopName(shopName);
    setFirstShopAddress(shopAddress);
    setScreen("app");
  };

  switch (screen) {
    case "landing":
      return (
        <Landing
          onLogin={() => setScreen("login")}
          onRegister={() => setScreen("register")}
        />
      );
    case "login":
      return (
        <Auth
          mode="login"
          onSuccess={handleAuthSuccess}
          onSwitch={() => setScreen("register")}
          onBack={() => setScreen("landing")}
        />
      );
    case "register":
      return (
        <Auth
          mode="register"
          onSuccess={handleAuthSuccess}
          onSwitch={() => setScreen("login")}
          onBack={() => setScreen("landing")}
        />
      );
    case "onboarding":
      return (
        <OnboardingWizard
          user={session!}
          onComplete={handleOnboardingComplete}
        />
      );
    case "app":
      return (
        <App
          initialShopName={firstShopName}
          initialShopAddress={firstShopAddress}
          user={session!}
          role={session!.role}
          onLogout={() => { setSession(null); setScreen("landing"); }}
        />
      );
  }
}

createRoot(document.getElementById("root")!).render(<Root />);