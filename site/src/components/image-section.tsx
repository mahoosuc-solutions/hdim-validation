interface ImageSectionProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function ImageSection({
  src,
  alt,
  width,
  height,
  priority = false,
}: ImageSectionProps) {
  const hasImage = src && src.length > 0;

  const fullSrc = hasImage ? src : "";
  const srcSet = hasImage
    ? (() => {
        const base = fullSrc.replace(/\.\w+$/, "");
        const ext = fullSrc.match(/\.\w+$/)?.[0] ?? ".webp";
        return `${base}-640${ext} 640w, ${base}-1280${ext} 1280w, ${fullSrc} 1792w`;
      })()
    : undefined;

  return (
    <div className="image-section">
      {hasImage ? (
        <img
          src={fullSrc}
          srcSet={srcSet}
          sizes="(max-width: 768px) 640px, (max-width: 1400px) 1280px, 1792px"
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : undefined}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "var(--radius-lg)",
            objectFit: "cover",
          }}
        />
      ) : (
        <div className="image-placeholder" style={{ aspectRatio: `${width}/${height}` }}>
          <div className="placeholder-content" role="img" aria-label={alt}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="placeholder-label">{alt}</span>
          </div>
        </div>
      )}
    </div>
  );
}
