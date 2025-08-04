import React, { useContext } from "react";
import { ImageContext } from "../context/ImageContext";

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
    <div>
      <h2>Import Chart</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {imageData && <img src={imageData} alt="Uploaded Chart" className="upload-preview" />}
    </div>
  );
}
