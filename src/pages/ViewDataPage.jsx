import React, { useContext } from "react";
import { ImageContext } from "../context/ImageContext";

export default function ViewDataPage() {
  const { axes, series, setSeries } = useContext(ImageContext);

  // 🧮 Helper: convert pixel -> real value for an axis
  const convertPixelToReal = (axis, point) => {
    const { p1, p2, min, max } = axis;
    if (!p1 || !p2 || min == null || max == null) return null;

    // Vector from p1 to p2
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // Vector from p1 to point
    const dpx = point.x - p1.x;
    const dpy = point.y - p1.y;

    // Project point onto axis vector
    const dot = (dpx * dx + dpy * dy) / (dx * dx + dy * dy);

    // Clamp between 0–1 if needed
    const clamped = Math.max(0, Math.min(1, dot));

    const real = min + clamped * (max - min);
    return real.toFixed(2);
  };

  const deletePoint = (seriesId, index) => {
    setSeries((prev) =>
      prev.map((s) =>
        s.id === seriesId
          ? { ...s, points: s.points.filter((_, i) => i !== index) }
          : s
      )
    );
  };

  return (
    <div>
      <h2>View Digitized Data</h2>
      {series.length === 0 ? (
        <p>No series available. Go to the Digitize page and add some points.</p>
      ) : (
        series.map((s) => (
          <div key={s.id} style={{ marginBottom: "2rem" }}>
            <h3>
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  backgroundColor: s.color,
                  marginRight: "6px"
                }}
              ></span>
              {s.name}
            </h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "0.5rem"
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#eee" }}>
                  <th style={cellStyle}>#</th>
                  <th style={cellStyle}>Pixel X</th>
                  <th style={cellStyle}>Pixel Y</th>
                  <th style={cellStyle}>Real X</th>
                  <th style={cellStyle}>Real Y</th>
                  <th style={cellStyle}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {s.points.map((pt, idx) => (
                  <tr key={idx}>
                    <td style={cellStyle}>{idx + 1}</td>
                    <td style={cellStyle}>{pt.x.toFixed(1)}</td>
                    <td style={cellStyle}>{pt.y.toFixed(1)}</td>
                    <td style={cellStyle}>{convertPixelToReal(axes.x, pt)}</td>
                    <td style={cellStyle}>{convertPixelToReal(axes.y, pt)}</td>
                    <td style={cellStyle}>
                      <button onClick={() => deletePoint(s.id, idx)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

const cellStyle = {
  border: "1px solid #ccc",
  padding: "6px",
  textAlign: "center"
};
