import React, { useContext } from "react";
import { ImageContext } from "../context/ImageContext";
import "../pages/css/ImportPage.css";

export default function ImportPage() {
  const { imageData, setImageData } = useContext(ImageContext);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageData(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="import-page">
      <h2>Import Chart</h2>

      <label className="file-label">
        <span>Select an image file:</span>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>

      {imageData && (
        <div className="preview-container">
          <h3>Preview</h3>
          <img src={imageData} alt="Uploaded Chart" className="upload-preview" />
        </div>
      )}
    </div>
  );
}
