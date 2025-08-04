import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Import Chart" },
  { path: "/axes", label: "Define Axes" },
  { path: "/digitize", label: "Digitize Points" },
  { path: "/data", label: "View Data" },
  { path: "/query", label: "Query Tool" },
  { path: "/export", label: "Export" },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h1>Chart Digitizer</h1>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
