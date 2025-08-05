import React, { useContext, useEffect, useRef, useState } from "react";
import { ImageContext } from "../context/ImageContext";
import "../pages/css/DefineAxesPage.css";


export default function DefineAxesPage() {
  const { imageData, axes, setAxes } = useContext(ImageContext);
  const [currentAxis, setCurrentAxis] = useState("x");
  const [clicks, setClicks] = useState([]);
  const [imageObj, setImageObj] = useState(null);
  const [originalSize, setOriginalSize] = useState({ width: 1, height: 1 });

  const canvasRef = useRef(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const defaultViewport = {
    offsetX: 0,
    offsetY: 0,
    scale: 1
  };
  const viewport = useRef({ ...defaultViewport });

  // Load image
  useEffect(() => {
    if (!imageData) return;
    const img = new Image();
    img.onload = () => {
      setOriginalSize({ width: img.width, height: img.height });
      setImageObj(img);
    };
    img.src = imageData;
  }, [imageData]);

  // Resize canvas to fit container (maintain aspect ratio)
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
  }, [imageObj, axes]);

  // Draw canvas content
  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!imageObj) return;

    const { offsetX, offsetY, scale } = viewport.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.drawImage(imageObj, 0, 0);

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

    ctx.restore();
  };

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

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { offsetX, offsetY, scale } = viewport.current;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const x = (screenX - offsetX) / scale;
    const y = (screenY - offsetY) / scale;

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

  const handleMouseDown = (e) => {
    if (e.button !== 1) return; // Only allow middle mouse for pan
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

  // Disable right-click context menu
  useEffect(() => {
    const canvas = canvasRef.current;
    const preventContextMenu = (e) => e.preventDefault();
    canvas?.addEventListener("contextmenu", preventContextMenu);
    return () => canvas?.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  useEffect(() => {
    draw();
  }, [axes, imageObj]);

  return (
    <div className="define-axes-container">
      <h2>Define Axes</h2>
      <p>
        Click two points on the <strong>{currentAxis.toUpperCase()}</strong> axis, then enter min/max values:
      </p>

      <div className="define-axes-layout">
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
          />
        </div>

        <div className="axis-controls">
          <label>
            Graph Title:
            <input
              type="text"
              value={axes.title}
              onChange={(e) =>
                setAxes((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </label>
            
          <button onClick={() => setCurrentAxis("x")}>Define X Axis</button>
          <label>
            X Label:
            <input
              type="text"
              value={axes.x.label || ""}
              onChange={(e) =>
                setAxes((prev) => ({
                  ...prev,
                  x: { ...prev.x, label: e.target.value }
                }))
              }
            />
          </label>
          <label>
            X Min:
            <input
              type="number"
              value={axes.x.min ?? ""}
              onChange={(e) => handleInputChange("x", "min", e.target.value)}
            />
          </label>
          <label>
            X Max:
            <input
              type="number"
              value={axes.x.max ?? ""}
              onChange={(e) => handleInputChange("x", "max", e.target.value)}
            />
          </label>
            
          <button onClick={() => setCurrentAxis("y")}>Define Y Axis</button>
          <label>
            Y Label:
            <input
              type="text"
              value={axes.y.label || ""}
              onChange={(e) =>
                setAxes((prev) => ({
                  ...prev,
                  y: { ...prev.y, label: e.target.value }
                }))
              }
            />
          </label>
          <label>
            Y Min:
            <input
              type="number"
              value={axes.y.min ?? ""}
              onChange={(e) => handleInputChange("y", "min", e.target.value)}
            />
          </label>
          <label>
            Y Max:
            <input
              type="number"
              value={axes.y.max ?? ""}
              onChange={(e) => handleInputChange("y", "max", e.target.value)}
            />
          </label>
          <button
            onClick={() => {
              viewport.current = { ...defaultViewport };
              draw();
            }}
          >
            Reset Zoom
          </button>
        </div>

      </div>
    </div>
  );
}
