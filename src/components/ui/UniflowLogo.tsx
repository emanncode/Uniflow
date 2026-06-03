'use client'
interface UniflowLogoProps {
  size?: number
  showWordmark?: boolean
  color?: string
}

export default function UniflowLogo({
  size = 32,
  showWordmark = true,
  color = 'var(--brand)',
}: UniflowLogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* ── icon mark ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* outer U shape */}
        <path
          d="M6 6 L6 20 Q6 28 16 28 Q26 28 26 20 L26 6"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* flow line 1 — short, left */}
        <line
          x1="10" y1="13"
          x2="16" y2="13"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* flow line 2 — full, middle */}
        <line
          x1="10" y1="18"
          x2="22" y2="18"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* flow dot — right end brand */}
        <circle
          cx="25"
          cy="18"
          r="2"
          fill={color}
        />
      </svg>

      {/* ── wordmark ── */}
      {showWordmark && (
        <span style={{
          fontSize: size * 0.65,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          fontFamily: 'Sora, sans-serif',
          lineHeight: 1,
        }}>
          uni<span style={{ color }}>flow</span>
        </span>
      )}
    </div>
  )
}