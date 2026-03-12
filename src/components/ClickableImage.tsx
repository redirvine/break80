"use client";

import { useState } from "react";
import ImageViewer from "./ImageViewer";

interface ClickableImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ClickableImage({ src, alt, className }: ClickableImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer hover:opacity-80 ${className ?? ""}`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ImageViewer src={src} alt={alt} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
