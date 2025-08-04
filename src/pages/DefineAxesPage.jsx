import React, { useContext, useEffect, useRef, useState } from "react";
import { ImageContext } from "../context/ImageContext";

export default function DefineAxesPage() {
  const { imageData, axes, setAxes } = useContext(ImageContext);
  const [currentAxis, setCurrentAxis] = useState("x");
  const [clicks, setClicks] = useState([]);

  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageClick = (e) => {
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newClick = { x, y };
    const newClicks = [...clicks, newClick];

    if (newClicks.length === 2) {
      setAxes((prev) => ({
        ...prev,
        [currentAxis]: {
          ...prev[currentAxis],
          p1: newClicks[0],
          p2: newClicks[1]
        }
      }));
      setClicks([]);
    } else {
      setClicks(newClicks);
    }
  };

  const handleInputChange = (axis, field, value) => {
    setAxes((prev) => ({
      ...prev,
      [axis]: {
        ...prev[axis],
        [field]: parseFloat(value)
      }
    }));
  };

  // 🧠 Draw axis lines and labels
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = imageRef.current;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    ["x", "y"].forEach((axis) => {
      const { p1, p2, min, max } = axes[axis];
      if (p1 && p2) {
        // Draw line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = axis === "x" ? "red" : "blue";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw min/max text
        if (min !== null && max !== null) {
          ctx.fillStyle = "black";
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(`${min}`, p1.x + 5, p1.y - 5);
          ctx.fillText(`${max}`, p2.x + 5, p2.y - 5);
        }
      }
    });
  }, [axes, imageData]);

  return (
    <div>
      <h2>Define Axes</h2>
      <p>
        Click two points on the <strong>{currentAxis.toUpperCase()}</strong> axis, then enter min/max values:
      </p>

      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          {imageData && (
            <>
              <img
                ref={imageRef}
                src={imageData}
                alt="chart"
                onClick={handleImageClick}
                style={{ display: "block", maxWidth: "100%", maxHeight: "70vh", cursor: "crosshair" }}
              />
              <canvas
                ref={canvasRef}
                style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
              />
            </>
          )}
        </div>

        <div>
          <label>
            X Min:
            <input
              type="number"
              value={axes.x.min ?? ""}
              onChange={(e) => handleInputChange("x", "min", e.target.value)}
            />
          </label>
          <br />
          <label>
            X Max:
            <input
              type="number"
              value={axes.x.max ?? ""}
              onChange={(e) => handleInputChange("x", "max", e.target.value)}
            />
          </label>
          <br />
          <br />
          <label>
            Y Min:
            <input
              type="number"
              value={axes.y.min ?? ""}
              onChange={(e) => handleInputChange("y", "min", e.target.value)}
            />
          </label>
          <br />
          <label>
            Y Max:
            <input
              type="number"
              value={axes.y.max ?? ""}
              onChange={(e) => handleInputChange("y", "max", e.target.value)}
            />
          </label>
          <br /><br />
          <button onClick={() => setCurrentAxis("x")}>Define X Axis</button>
          <button onClick={() => setCurrentAxis("y")}>Define Y Axis</button>
        </div>
      </div>
    </div>
  );
}
