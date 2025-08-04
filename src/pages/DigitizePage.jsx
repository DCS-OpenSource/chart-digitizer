import React, { useContext, useRef, useEffect, useState } from "react";
import { ImageContext } from "../context/ImageContext";

export default function DigitizePage() {
  const {
    imageData,
    axes,
    series,
    activeSeriesId,
    addSeries,
    addPointToActiveSeries,
    deleteSeries,
    clearPointsFromSeries,
    setActiveSeriesId
  } = useContext(ImageContext);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [newSeriesName, setNewSeriesName] = useState("");
  const [newSeriesColor, setNewSeriesColor] = useState("#ff0000");

  // 📌 Add point on image click
  const handleImageClick = (e) => {
    if (!activeSeriesId) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPointToActiveSeries({ x, y });
  };

  // 🧠 Draw all series
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = imageRef.current;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    for (const s of series) {
      ctx.fillStyle = s.color;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;

      // Draw points
      s.points.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Connect with lines
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(s.points[i - 1].x, s.points[i - 1].y);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
        }
      });
    }
  }, [series, imageData]);

  return (
    <div>
      <h2>Digitize Points</h2>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Left: Chart viewer */}
        <div style={{ position: "relative", display: "inline-block" }}>
          {imageData && (
            <>
              <img
                ref={imageRef}
                src={imageData}
                alt="chart"
                onClick={handleImageClick}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  cursor: activeSeriesId ? "crosshair" : "not-allowed"
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none"
                }}
              />
            </>
          )}
        </div>

        {/* Right: Controls */}
        <div style={{ minWidth: "250px" }}>
          {/* Add new series */}
          <div>
            <h3>Create New Line</h3>
            <input
              type="text"
              placeholder="Series name"
              value={newSeriesName}
              onChange={(e) => setNewSeriesName(e.target.value)}
              style={{ width: "100%", marginBottom: "0.5rem" }}
            />
            <input
              type="color"
              value={newSeriesColor}
              onChange={(e) => setNewSeriesColor(e.target.value)}
              style={{ marginBottom: "0.5rem" }}
            />
            <button
              onClick={() => {
                if (newSeriesName) {
                  addSeries(newSeriesName, newSeriesColor);
                  setNewSeriesName("");
                }
              }}
            >
              Add Line
            </button>
          </div>

          <hr style={{ margin: "1rem 0" }} />

          {/* Series list */}
          <div>
            <h3>Series List</h3>
            {series.map((s) => (
              <div
                key={s.id}
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  marginBottom: "0.5rem",
                  backgroundColor: activeSeriesId === s.id ? "#eef" : "#fff"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveSeriesId(s.id)}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        backgroundColor: s.color,
                        marginRight: "6px"
                      }}
                    ></span>
                    {s.name} ({s.points.length} pts)
                  </div>
                  <div>
                    <button
                      onClick={() => clearPointsFromSeries(s.id)}
                      style={{ marginRight: "4px" }}
                    >
                      Clear
                    </button>
                    <button onClick={() => deleteSeries(s.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
