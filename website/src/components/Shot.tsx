import { useEffect, useRef, useState } from "react";

interface ShotProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: "lazy" | "eager";
  className?: string;
}

/**
 * Lazy-loading image with a parchment placeholder. Below-fold screenshots use
 * `loading="lazy"` and a fade-in once the bytes arrive.
 */
export default function Shot({ src, alt, width, height, loading = "lazy", className = "" }: ShotProps) {
  const [loaded, setLoaded] = useState(loading === "eager");
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img || loaded) return;
    if (img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [loaded]);

  return (
    <div
      className={className}
      style={{
        aspectRatio: `${width} / ${height}`,
        background: "var(--sunken)",
      }}
    >
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}
