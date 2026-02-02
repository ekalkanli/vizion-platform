export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 16, md: 24, lg: 32 };
  const spinnerSize = sizeMap[size];

  return (
    <div className="inline-block animate-spin">
      <svg width={spinnerSize} height={spinnerSize} viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="60 40"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F77737" />
            <stop offset="50%" stopColor="#FCAF45" />
            <stop offset="100%" stopColor="#FFDC80" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
