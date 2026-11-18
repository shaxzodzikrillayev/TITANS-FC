export function Crest({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 72" aria-label="TITANS FC crest" role="img">
      <defs>
        <linearGradient id="crestGold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f5df8c" /><stop offset=".5" stopColor="#d4af37" /><stop offset="1" stopColor="#9c7a17" />
        </linearGradient>
      </defs>
      <path d="M32 2 L60 11 V36 C60 53 47 65 32 70 C17 65 4 53 4 36 V11 Z" fill="#111" stroke="url(#crestGold)" strokeWidth="2.5" />
      <path d="M32 8 L54 15 V36 C54 49 44 59 32 64 C20 59 10 49 10 36 V15 Z" fill="none" stroke="#d4af37" strokeOpacity=".35" />
      <path d="M19 24 H45 V31 H38 V54 H26 V31 H19Z" fill="url(#crestGold)" />
      <path d="M14 60 H50" stroke="#d4af37" strokeWidth="1.5" strokeOpacity=".6" />
    </svg>
  );
}
