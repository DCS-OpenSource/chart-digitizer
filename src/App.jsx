import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ImportPage from "./pages/ImportPage";
import DefineAxesPage from "./pages/DefineAxesPage";
import DigitizePage from "./pages/DigitizePage";
import ViewDataPage from "./pages/ViewDataPage";
import QueryPage from "./pages/QueryPage";
import ExportPage from "./pages/ExportPage";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-view">
          <Routes>
            <Route path="/" element={<ImportPage />} />
            <Route path="/axes" element={<DefineAxesPage />} />
            <Route path="/digitize" element={<DigitizePage />} />
            <Route path="/data" element={<ViewDataPage />} />
            <Route path="/query" element={<QueryPage />} />
            <Route path="/export" element={<ExportPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
