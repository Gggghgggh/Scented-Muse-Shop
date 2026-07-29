import type { SVGAttributes } from 'react';

export default function HeroIllustration(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 960 420"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f8ece2" />
                    <stop offset="1" stopColor="#ecd3c2" />
                </linearGradient>
                <linearGradient id="hero-bottle-plum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#54305f" />
                    <stop offset="1" stopColor="#3b2147" />
                </linearGradient>
                <linearGradient id="hero-bottle-coral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f27a6c" />
                    <stop offset="1" stopColor="#e85d4f" />
                </linearGradient>
                <linearGradient id="hero-bottle-gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#d9ab5f" />
                    <stop offset="1" stopColor="#c7984a" />
                </linearGradient>
            </defs>

            <rect width="960" height="420" fill="url(#hero-bg)" />
            <circle cx="130" cy="80" r="150" fill="#c7984a" opacity="0.12" />
            <circle cx="860" cy="360" r="190" fill="#3b2147" opacity="0.08" />
            <circle cx="700" cy="70" r="90" fill="#e85d4f" opacity="0.08" />

            {/* Tall plum perfume bottle */}
            <g>
                <rect x="150" y="150" width="120" height="190" rx="20" fill="url(#hero-bottle-plum)" />
                <rect x="185" y="110" width="50" height="46" rx="8" fill="url(#hero-bottle-plum)" />
                <rect x="175" y="90" width="70" height="26" rx="10" fill="url(#hero-bottle-gold)" />
                <rect x="168" y="200" width="18" height="90" rx="6" fill="#ffffff" opacity="0.18" />
            </g>

            {/* Coral atomizer bottle */}
            <g>
                <rect x="330" y="200" width="100" height="140" rx="18" fill="url(#hero-bottle-coral)" />
                <rect x="358" y="168" width="44" height="38" rx="8" fill="url(#hero-bottle-coral)" />
                <circle cx="380" cy="150" r="20" fill="url(#hero-bottle-gold)" />
                <path
                    d="M400 140 L440 108 M410 152 L452 132 M398 160 L444 156"
                    stroke="#c7984a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.7"
                />
                <circle cx="452" cy="126" r="4" fill="#c7984a" opacity="0.7" />
                <circle cx="446" cy="150" r="3" fill="#c7984a" opacity="0.6" />
                <circle cx="436" cy="104" r="3" fill="#c7984a" opacity="0.6" />
                <rect x="345" y="230" width="14" height="70" rx="5" fill="#ffffff" opacity="0.2" />
            </g>

            {/* Gold body-spray can */}
            <g>
                <rect x="480" y="180" width="80" height="160" rx="16" fill="url(#hero-bottle-gold)" />
                <rect x="500" y="150" width="40" height="34" rx="6" fill="#3b2147" />
                <rect x="512" y="130" width="16" height="24" rx="4" fill="#3b2147" />
                <rect x="492" y="205" width="12" height="90" rx="4" fill="#ffffff" opacity="0.22" />
            </g>

            {/* Wristwatch */}
            <g transform="translate(640,230)">
                <path
                    d="M-16 -70 L16 -70 L10 -34 L-10 -34 Z"
                    fill="url(#hero-bottle-plum)"
                />
                <path
                    d="M-16 70 L16 70 L10 34 L-10 34 Z"
                    fill="url(#hero-bottle-plum)"
                />
                <circle r="48" fill="#fdf6ef" stroke="url(#hero-bottle-gold)" strokeWidth="6" />
                <line x1="0" y1="0" x2="0" y2="-26" stroke="#3b2147" strokeWidth="4" strokeLinecap="round" />
                <line x1="0" y1="0" x2="18" y2="8" stroke="#3b2147" strokeWidth="4" strokeLinecap="round" />
                <circle r="4" fill="#e85d4f" />
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <line
                        key={deg}
                        x1="0"
                        y1="-40"
                        x2="0"
                        y2="-34"
                        stroke="#c7984a"
                        strokeWidth="2"
                        transform={`rotate(${deg})`}
                    />
                ))}
            </g>

            {/* Floating sparkles */}
            {[
                [230, 100],
                [560, 90],
                [730, 320],
                [110, 300],
            ].map(([sx, sy]) => (
                <path
                    key={`${sx}-${sy}`}
                    d={`M${sx} ${sy - 12} L${sx + 4} ${sy - 4} L${sx + 12} ${sy} L${sx + 4} ${sy + 4} L${sx} ${sy + 12} L${sx - 4} ${sy + 4} L${sx - 12} ${sy} L${sx - 4} ${sy - 4} Z`}
                    fill="#c7984a"
                    opacity="0.5"
                />
            ))}
        </svg>
    );
}
