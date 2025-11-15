import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { Dashboard } from "./components/Dashboard";

type Screen = "login" | "signup" | "dashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  
  // Remove dark mode - use light theme
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const handleLogin = () => {
    setCurrentScreen("dashboard");
  };

  const handleSignup = () => {
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
    setCurrentScreen("login");
  };

  return (
    <>
      {currentScreen === "login" && (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToSignup={() => setCurrentScreen("signup")}
        />
      )}
      
      {currentScreen === "signup" && (
        <SignupPage
          onSignup={handleSignup}
          onNavigateToLogin={() => setCurrentScreen("login")}
        />
      )}
      
      {currentScreen === "dashboard" && (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
}