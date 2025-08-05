import React, { useContext } from "react";
import { ImageContext } from "../context/ImageContext";
import "../pages/css/ExportPage.css";

export default function ExportPage() {
  const { series, axes } = useContext(ImageContext);

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

  const buildExportData = () => ({
    title: axes.title || "",
    xAxisLabel: axes.x.label || "",
    yAxisLabel: axes.y.label || "",
    series: series.map((s) => ({
      name: s.name,
      color: s.color,
      points: s.points.map((pt) => ({
        pixel: pt,
        real: {
          x: convertPixelToReal(axes.x, pt),
          y: convertPixelToReal(axes.y, pt)
        }
      }))
    }))
  });

  const downloadJSON = () => {
    const data = buildExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, "chart_data.json");
  };

  const downloadCSV = () => {
    const data = buildExportData();
    let csv = `Title:,${data.title}\nX Axis:,${data.xAxisLabel}\nY Axis:,${data.yAxisLabel}\n\n`;
    csv += "Series,Color,Pixel X,Pixel Y,Real X,Real Y\n";

    data.series.forEach((s) => {
      s.points.forEach((pt) => {
        const line = [
          s.name,
          s.color,
          pt.pixel.x.toFixed(2),
          pt.pixel.y.toFixed(2),
          pt.real.x?.toFixed(2) ?? "",
          pt.real.y?.toFixed(2) ?? ""
        ].join(",");
        csv += line + "\n";
      });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, "chart_data.csv");
  };

  const triggerDownload = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-page">
      <h2>Export Chart Data</h2>

      {series.length === 0 ? (
        <p>No data available. Go to the Digitize page to add data first.</p>
      ) : (
        <>
          <div className="export-meta">
            <div><strong>Title:</strong> {axes.title || "—"}</div>
            <div><strong>X Axis Label:</strong> {axes.x.label || "—"}</div>
            <div><strong>Y Axis Label:</strong> {axes.y.label || "—"}</div>

            <div className="series-summary">
              <h4>Series Summary:</h4>
              {series.map((s) => (
              <div className="series-item" key={s.name}>
                <span className="series-color" style={{ backgroundColor: s.color }}></span>
                <span className="series-label">
                  {s.name} ({s.points.length} points)
                </span>
              </div>

              ))}
            </div>
          </div>
          <div className="export-buttons">
            <button onClick={downloadJSON}>Export as JSON</button>
            <button onClick={downloadCSV}>Export as CSV</button>
          </div>
        </>
      )}
    </div>
  );
}
