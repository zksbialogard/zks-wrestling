export default function LogoFilters() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden">
      <defs>
        <filter
          id="zks-logo-soft"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0.278 0.278 0.278 0 0"
            result="luma"
          />
          <feGaussianBlur in="luma" stdDeviation="0.55" result="softLuma" />
          <feComponentTransfer in="softLuma" result="alpha">
            <feFuncA type="linear" slope="4.5" intercept="-0.22" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="alpha" operator="in" result="cutout" />
          <feColorMatrix
            in="cutout"
            type="matrix"
            values="
              0.94 0 0 0 0.02
              0 0.94 0 0 0.02
              0 0 0.9 0 0.025
              0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
