import React, { createContext, useState } from "react";

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [imageData, setImageData] = useState(null);

  const [axes, setAxes] = useState({
    title: '',
    x: { label: '', min: null, max: null, p1: null, p2: null },
    y: { label: '', min: null, max: null, p1: null, p2: null }
  });

  const [series, setSeries] = useState([]);
  const [activeSeriesId, setActiveSeriesId] = useState(null);

  const addSeries = (name, color) => {
    const id = Date.now().toString();
    setSeries((prev) => [...prev, { id, name, color, points: [] }]);
    setActiveSeriesId(id);
  };

  const deleteSeries = (id) => {
    setSeries((prev) => prev.filter((s) => s.id !== id));
    if (activeSeriesId === id) setActiveSeriesId(null);
  };

  const clearPointsFromSeries = (id) => {
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, points: [] } : s))
    );
  };

  const addPointToActiveSeries = (point) => {
    if (!activeSeriesId) return;
    setSeries((prev) =>
      prev.map((s) =>
        s.id === activeSeriesId
          ? { ...s, points: [...s.points, point] }
          : s
      )
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
        addSeries,
        deleteSeries,
        clearPointsFromSeries,
        addPointToActiveSeries,
        activeSeriesId,
        setActiveSeriesId
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
