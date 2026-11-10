export default function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  }

  if (name === 'home') return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></svg>
  if (name === 'add') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
  if (name === 'history') return <svg {...common}><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></svg>
  if (name === 'reports') return <svg {...common}><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-7" /><circle cx="19" cy="6" r="1" /></svg>
  if (name === 'logout') return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>
  if (name === 'sunrise') return <svg {...common}><path d="M3 18h18M5 15a7 7 0 0 1 14 0M12 2v3M4.9 6.1 7 8.2m12.1-2.1L17 8.2M2 11h3m14 0h3" /></svg>
  if (name === 'coffee') return <svg {...common}><path d="M5 8h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8ZM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 4v2m4-2v2" /><path d="M4 22h15" /></svg>
  if (name === 'sun') return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
  if (name === 'moon') return <svg {...common}><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" /></svg>
  if (name === 'calendar') return <svg {...common}><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /></svg>
  if (name === 'pulse') return <svg {...common}><path d="M2.5 12h4l2.2-5.3 4.2 10.6 2.5-6.1h2.2l1.6 2.8h2.3" /></svg>
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
  if (name === 'profile') return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c.8-3.2 3.5-5 7.5-5s6.7 1.8 7.5 5" /></svg>
  if (name === 'eye') return <svg {...common}><path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
  if (name === 'eyeOff') return <svg {...common}><path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6.3 0 9.5 6 9.5 6a15.8 15.8 0 0 1-3.1 3.8M6.2 6.3C3.8 7.8 2.5 12 2.5 12s3.2 6 9.5 6c1.2 0 2.3-.2 3.3-.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
  if (name === 'id') return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="10" r="2" /><path d="M5.5 16c.5-1.5 1.3-2.2 2.5-2.2s2 .7 2.5 2.2M13 9h5m-5 4h5" /></svg>
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
  if (name === 'edit') return <svg {...common}><path d="m14 5 5 5M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" /><path d="M13 20h7" /></svg>
  if (name === 'trash') return <svg {...common}><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 14h11l1-14M9 7V4h6v3" /></svg>
  if (name === 'drop') return <svg {...common}><path d="M12 2.8S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.8 12 2.8Z" /><path d="M9 15.5a3 3 0 0 0 3 3" /></svg>
  if (name === 'trendUp') return <svg {...common}><path d="m4 16 6-6 4 4 6-8" /><path d="M14 6h6v6" /></svg>
  if (name === 'trendDown') return <svg {...common}><path d="m4 8 6 6 4-4 6 8" /><path d="M14 18h6v-6" /></svg>
  return <svg {...common}><circle cx="12" cy="12" r="8" /></svg>
}
