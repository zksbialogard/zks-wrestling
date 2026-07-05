export default function LogoFilters() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden">
      <defs>
        <filter
          id="zks-logo-knockout"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0.333 0.333 0.333 0 0"
            result="luma"
          />
          <feComponentTransfer in="luma" result="alpha">
            <feFuncA type="linear" slope="8" intercept="-0.35" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="alpha" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}
