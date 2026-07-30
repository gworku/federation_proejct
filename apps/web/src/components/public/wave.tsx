export function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={flip ? "rotate-180" : undefined} aria-hidden="true">
      <svg
        viewBox="0 0 1440 80"
        className="wave-divider block h-12 w-full sm:h-16"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,32 L1440,80 L0,80 Z"
        />
      </svg>
    </div>
  );
}
