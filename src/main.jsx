import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ImageProvider } from "./context/ImageContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ImageProvider>
      <App />
    </ImageProvider>
  </React.StrictMode>
);
