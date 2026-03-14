import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EventCodeEntry from "./components/EventCodeEntry";
import EventGallery from "./components/EventGallery";

export default function App() {
  const [language, setLanguage] = useState(
    () => window.localStorage.getItem("snapvault-language") || "en"
  );

  useEffect(() => {
    window.localStorage.setItem("snapvault-language", language);
  }, [language]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<EventCodeEntry language={language} setLanguage={setLanguage} />}
        />
        <Route
          path="/event/:code"
          element={<EventGallery language={language} setLanguage={setLanguage} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
