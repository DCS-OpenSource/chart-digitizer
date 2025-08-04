import React, { useContext, useState } from "react";
import { ImageContext } from "../context/ImageContext";

export default function QueryPage() {
  const { series, axes } = useContext(ImageContext);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [inputX, setInputX] = useState("");
  const [resultY, setResultY] = useState(null);

  const selectedSeries = series.find((s) => s.id === selectedSeriesId);

  const convertPixelToReal = (axis, point) => {
    const { p1, p2, min, max } = axis;
    if (!p1 || !p2 || min == null || max == null) return null;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dpx = point.x - p1.x;
    const dpy = point.y - p1.y;
    const dot = (dpx * dx + dpy * dy) / (dx * dx + dy * dy);
    const clamped = Math.max(0, Math.min(1, dot));
    return min + clamped * (max - min);
  };

  const interpolate = (series, inputX) => {
    if (!axes.x || !axes.y) return null;

    const points = series.points
      .map((pt) => ({
        realX: parseFloat(convertPixelToReal(axes.x, pt)),
        realY: parseFloat(convertPixelToReal(axes.y, pt))
      }))
      .filter((pt) => !isNaN(pt.realX) && !isNaN(pt.realY))
      .sort((a, b) => a.realX - b.realX);

    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (inputX >= a.realX && inputX <= b.realX) {
        const ratio = (inputX - a.realX) / (b.realX - a.realX);
        return (a.realY + ratio * (b.realY - a.realY)).toFixed(2);
      }
    }

    return "Out of bounds";
  };

  const handleQuery = () => {
    if (!selectedSeries || inputX === "") {
      setResultY(null);
      return;
    }
    const interpolated = interpolate(selectedSeries, parseFloat(inputX));
    setResultY(interpolated);
  };

  return (
    <div>
      <h2>Query Tool</h2>
      {series.length === 0 ? (
        <p>No series available. Go to the Digitize page to add data.</p>
      ) : (
        <div style={{ maxWidth: "400px" }}>
          <label>
            Select Series:
            <select
              style={{ width: "100%", marginBottom: "1rem" }}
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
            >
              <option value="">-- Choose Line --</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Enter X Value (e.g., Pressure Altitude):
            <input
              type="number"
              value={inputX}
              onChange={(e) => setInputX(e.target.value)}
              style={{ width: "100%", marginBottom: "1rem" }}
            />
          </label>

          <button onClick={handleQuery}>Query</button>

          {resultY !== null && (
            <div style={{ marginTop: "1rem" }}>
              <strong>Resulting Y Value:</strong> {resultY}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
