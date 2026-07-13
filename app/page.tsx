"use client";

import { PracticeProvider } from "@/contexts/PracticeContext";
import Menu from "@/components/Menu";
import SetupOps from "@/components/SetupOps";
import SetUpRoot from "@/components/SetupRoot";
import Practice from "@/components/Practice";
import Results from "@/components/Results";
import Library from "@/components/Library";
import CustomBuilder from "@/components/CustomBuilder"; // <-- IMPORT
import NumberDiscoSetup from "@/components/NumberDiscoSetup";
import NumberDiscoPractice from "@/components/NumberDiscoPractice";
import { usePractice } from "@/contexts/PracticeContext";

function MainApp() {
  const { screen } = usePractice();

  return (
    <div className="app-container">
      {screen === "menu" && <Menu />}
      {screen === "setupOps" && <SetupOps />}
      {screen === "setupRootPow" && <SetUpRoot />}
      {screen === "practice" && <Practice />}
      {screen === "results" && <Results />}
      {screen === "library" && <Library />}
      {screen === "custom" && <CustomBuilder />} {/* <-- TAMBAHKAN */}
    </div>
  );
}

export default function Home() {
  return (
    <PracticeProvider>
      <MainApp />
    </PracticeProvider>
  );
}