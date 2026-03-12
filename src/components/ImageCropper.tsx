"use client";

import { useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";

interface ImageCropperProps {
  imageSrc: string;
  onCropDone: (blob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageSrc,
  onCropDone,
  onCancel,
}: ImageCropperProps) {
  const cropperRef = useRef<ReactCropperElement>(null);

  function handleDone() {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob(
      (blob) => {
        if (blob) onCropDone(blob);
      },
      "image/jpeg",
      0.9
    );
  }

  function handleRotate() {
    cropperRef.current?.cropper.rotate(90);
  }

  return (
    <div className="space-y-3">
      <link rel="stylesheet" href="/cropper.min.css" />
      <Cropper
        ref={cropperRef}
        src={imageSrc}
        style={{ height: 300, width: "100%" }}
        guides={true}
        viewMode={1}
        autoCropArea={1}
        responsive={true}
        checkOrientation={true}
        crossOrigin="anonymous"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRotate}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Rotate 90°
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
        >
          Crop
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
