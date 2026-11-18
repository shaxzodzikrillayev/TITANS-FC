/** Local, offline-safe artwork. Data URLs keep the site fully functional without external hosting. */
const uri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export function playerArt(name: string, surname: string, number: number): string {
  const initials = `${name[0] ?? ''}${surname[0] ?? ''}`.toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1b1b1b"/><stop offset="1" stop-color="#080808"/></linearGradient>
      <linearGradient id="kit" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2a2a2a"/><stop offset="1" stop-color="#0d0d0d"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="#d4af37" stop-opacity=".28"/><stop offset="1" stop-color="#d4af37" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="400" height="480" fill="url(#bg)"/>
    <circle cx="200" cy="190" r="180" fill="url(#glow)"/>
    <path d="M0 480 L0 380 Q80 340 130 325 L200 360 L270 325 Q320 340 400 380 L400 480Z" fill="url(#kit)"/>
    <path d="M165 300 L165 338 Q200 360 235 338 L235 300Z" fill="#c9a227"/>
    <path d="M200 360 L200 480 M165 338 L145 480 M235 338 L255 480" stroke="#d4af37" stroke-opacity=".35" stroke-width="3" fill="none"/>
    <ellipse cx="200" cy="176" rx="66" ry="80" fill="#8a6b4a"/>
    <path d="M134 168 Q132 84 200 84 Q268 84 266 168 Q250 128 200 126 Q150 128 134 168Z" fill="#161616"/>
    <path d="M168 170 h14 M218 170 h14" stroke="#241a12" stroke-width="4" stroke-linecap="round"/>
    <path d="M186 212 Q200 222 214 212" stroke="#5c4030" stroke-width="3" fill="none" stroke-linecap="round"/>
    <text x="200" y="440" text-anchor="middle" font-family="Oswald,Arial,sans-serif" font-size="86" font-weight="700" fill="#d4af37" opacity=".9">${number}</text>
    <text x="24" y="46" font-family="Oswald,Arial,sans-serif" font-size="26" font-weight="700" fill="#ffffff" opacity=".12">${initials}</text>
  </svg>`;
  return uri(svg);
}

export function newsArt(index: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480">
    <defs><linearGradient id="n" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#202020"/><stop offset="1" stop-color="#080808"/></linearGradient>
    <radialGradient id="r"><stop stop-color="#d4af37" stop-opacity=".35"/><stop offset="1" stop-color="#d4af37" stop-opacity="0"/></radialGradient></defs>
    <rect width="800" height="480" fill="url(#n)"/>
    <circle cx="620" cy="120" r="260" fill="url(#r)"/>
    <g stroke="#ffffff" stroke-opacity=".09" fill="none" stroke-width="2"><circle cx="400" cy="240" r="130"/><circle cx="400" cy="240" r="70"/><path d="M270 240h260 M400 110v260"/></g>
    <path d="M0 400 Q200 330 400 400 T800 400" stroke="#d4af37" stroke-opacity=".45" stroke-width="3" fill="none"/>
    <text x="52" y="420" font-family="Oswald,Arial,sans-serif" font-size="150" font-weight="700" fill="#ffffff" opacity=".05">0${index + 1}</text>
  </svg>`;
  return uri(svg);
}

export function resolvePhoto(photo: string, name: string, surname: string, number: number): string {
  if (photo && (photo.startsWith('http') || photo.startsWith('data:') || photo.startsWith('/'))) return photo;
  return playerArt(name, surname, number);
}
