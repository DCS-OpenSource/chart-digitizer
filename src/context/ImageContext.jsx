import React, { createContext, useState } from "react";

export const ImageContext = createContext();

export function ImageProvider({ children }) {
  // Stored chart image
  const [imageData, setImageData] = useState(null);

  // Axis calibration info
  const [axes, setAxes] = useState({
    x: { p1: null, p2: null, min: null, max: null },
    y: { p1: null, p2: null, min: null, max: null }
  });

  // Digitized series (e.g., one per weight line)
  const [series, setSeries] = useState([]);
  const [activeSeriesId, setActiveSeriesId] = useState(null);

  // Utility: add a new series
  const addSeries = (name, color) => {
    const id = `series-${Date.now()}`;
    const newSeries = { id, name, color, points: [] };
    setSeries((prev) => [...prev, newSeries]);
    setActiveSeriesId(id);
  };

  // Utility: add a point to the currently selected series
  const addPointToActiveSeries = (point) => {
    setSeries((prev) =>
      prev.map((s) =>
        s.id === activeSeriesId ? { ...s, points: [...s.points, point] } : s
      )
    );
  };

  // Utility: delete a series
  const deleteSeries = (id) => {
    setSeries((prev) => prev.filter((s) => s.id !== id));
    if (activeSeriesId === id) setActiveSeriesId(null);
  };

  // Utility: clear points from selected series
  const clearPointsFromSeries = (id) => {
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, points: [] } : s))
    );
  };

  return (
    <ImageContext.Provider
      value={{
        imageData,
        setImageData,
        axes,
        setAxes,
        series,
        setSeries,
        activeSeriesId,
        setActiveSeriesId,
        addSeries,
        addPointToActiveSeries,
        deleteSeries,
        clearPointsFromSeries
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}
