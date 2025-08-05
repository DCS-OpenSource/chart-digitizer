import React, { useContext, useRef, useEffect, useState } from "react";
import { ImageContext } from "../context/ImageContext";
import "../pages/css/DigitizePage.css";

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
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const [newSeriesName, setNewSeriesName] = useState("");
  const [newSeriesColor, setNewSeriesColor] = useState("#ff0000");
  const [imageObj, setImageObj] = useState(null);

  const defaultViewport = {
    offsetX: 0,
    offsetY: 0,
    scale: 1
  };
  const viewport = useRef({ ...defaultViewport });

  // 📷 Load image object
  useEffect(() => {
    if (!imageData) return;
    const img = new Image();
    img.onload = () => setImageObj(img);
    img.src = imageData;
  }, [imageData]);

  // 🖌️ Draw all series
  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY, scale } = viewport.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!imageObj) return;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.drawImage(imageObj, 0, 0);

    // Draw axes lines
    ["x", "y"].forEach((axis) => {
      const { p1, p2, min, max } = axes[axis];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = axis === "x" ? "red" : "blue";
        ctx.lineWidth = 2 / scale;
        ctx.stroke();
      
        if (min != null && max != null) {
          ctx.fillStyle = "black";
          ctx.font = `${14 / scale}px sans-serif`;
          ctx.fillText(`${min}`, p1.x + 5, p1.y - 5);
          ctx.fillText(`${max}`, p2.x + 5, p2.y - 5);
        }
      }
    });
    for (const s of series) {
      ctx.fillStyle = s.color;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2 / scale;

      s.points.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4 / scale, 0, Math.PI * 2);
        ctx.fill();

        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(s.points[i - 1].x, s.points[i - 1].y);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
        }
      });
    }

    ctx.restore();
  };

  // 🧠 Clamp pan so image stays in view
  const clampPan = () => {
    const canvas = canvasRef.current;
    const { scale } = viewport.current;

    const imgWidth = imageObj.width * scale;
    const imgHeight = imageObj.height * scale;

    const minOffsetX = canvas.width - imgWidth;
    const minOffsetY = canvas.height - imgHeight;
    const maxOffsetX = 0;
    const maxOffsetY = 0;

    viewport.current.offsetX = Math.min(maxOffsetX, Math.max(minOffsetX, viewport.current.offsetX));
    viewport.current.offsetY = Math.min(maxOffsetY, Math.max(minOffsetY, viewport.current.offsetY));
  };

  // 📏 Resize canvas on window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !imageObj) return;

      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      clampPan();
      draw();
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [imageObj, series]);

  // 🖱 Handle left click to place points
  const handleCanvasClick = (e) => {
    if (!activeSeriesId || !imageObj) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { offsetX, offsetY, scale } = viewport.current;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const x = (screenX - offsetX) / scale;
    const y = (screenY - offsetY) / scale;

    addPointToActiveSeries({ x, y });
  };

  // 🖱 Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { offsetX, offsetY, scale } = viewport.current;
    const zoomFactor = 1.1;
    const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    const clampedScale = Math.min(5, Math.max(0.25, newScale));

    const wx = (mouseX - offsetX) / scale;
    const wy = (mouseY - offsetY) / scale;

    viewport.current.scale = clampedScale;
    viewport.current.offsetX = mouseX - wx * clampedScale;
    viewport.current.offsetY = mouseY - wy * clampedScale;

    clampPan();
    draw();
  };

  // 🖱 Pan with middle mouse drag
  const handleMouseDown = (e) => {
    if (e.button !== 1) return;
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;

    lastMouse.current = { x: e.clientX, y: e.clientY };

    viewport.current.offsetX += dx;
    viewport.current.offsetY += dy;

    clampPan();
    draw();
  };

  useEffect(() => {
    draw();
  }, [series, imageObj]);

  // Disable context menu
  useEffect(() => {
    const canvas = canvasRef.current;
    const preventContextMenu = (e) => e.preventDefault();
    canvas?.addEventListener("contextmenu", preventContextMenu);
    return () => canvas?.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  return (
    <div className="digitize-page">
      <h2>Digitize Points</h2>
      <p>Add a Series name, select a colour, then click Add Line. Then Select points for that line, then repeat as needed.</p>
      <div className="digitize-layout">
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          />
        </div>

        <div className="digitize-controls">
          <div className="controls-header">
            <div className="series-input-row">
              <input
                type="text"
                placeholder="Series name"
                value={newSeriesName}
                onChange={(e) => setNewSeriesName(e.target.value)}
              />
              <input
                type="color"
                value={newSeriesColor}
                onChange={(e) => setNewSeriesColor(e.target.value)}
              />
            </div>

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
            
          <div className="series-list-container">
            <h3>Series List</h3>
            <div className="series-list">
              {series.map((s) => (
                <div key={s.id} className={`series-card ${activeSeriesId === s.id ? "active" : ""}`}>
                  <div className="series-name" onClick={() => setActiveSeriesId(s.id)}>
                    <span className="series-color" style={{ backgroundColor: s.color }} />
                    {s.name} ({s.points.length} pts)
                  </div>
                  <div className="series-actions">
                    <button onClick={() => clearPointsFromSeries(s.id)}>Clear</button>
                    <button onClick={() => deleteSeries(s.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
