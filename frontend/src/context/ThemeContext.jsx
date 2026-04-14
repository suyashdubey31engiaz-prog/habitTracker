import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  // ── Light themes ────────────────────────────────────────────────
  forest: {
    label: 'Forest', emoji: '🌿', dark: false, season: 'spring',
    vars: { '--bg':'#f5f7f4','--surface':'#ffffff','--surface2':'#eef2ee','--primary':'#2d6a4f','--primary-light':'#52b788','--primary-pale':'#d8f3dc','--accent':'#d4a853','--accent-pale':'#fef3c7','--danger':'#e07070','--text':'#1a2e1a','--text-muted':'#6b8c7b','--border':'#dde8dd','--shadow':'0 2px 16px rgba(45,106,79,0.10)','--shadow-lg':'0 8px 32px rgba(45,106,79,0.18)','--glow':'none','--radius':'16px' },
  },
  spring: {
    label: 'Spring', emoji: '🌸', dark: false, season: 'spring',
    vars: { '--bg':'#fff9fb','--surface':'#ffffff','--surface2':'#fce7ef','--primary':'#e75480','--primary-light':'#f4a7bb','--primary-pale':'#fde8f0','--accent':'#8b6914','--accent-pale':'#fef9c3','--danger':'#dc2626','--text':'#1a0a10','--text-muted':'#9c6b7a','--border':'#f4c2d0','--shadow':'0 2px 16px rgba(231,84,128,0.10)','--shadow-lg':'0 8px 32px rgba(231,84,128,0.18)','--glow':'none','--radius':'24px' },
  },
  summer: {
    label: 'Summer', emoji: '☀️', dark: false, season: 'summer',
    vars: { '--bg':'#fffbeb','--surface':'#ffffff','--surface2':'#fef3c7','--primary':'#d97706','--primary-light':'#f59e0b','--primary-pale':'#fde68a','--accent':'#059669','--accent-pale':'#d1fae5','--danger':'#dc2626','--text':'#1c1917','--text-muted':'#78716c','--border':'#fde68a','--shadow':'0 2px 16px rgba(217,119,6,0.12)','--shadow-lg':'0 8px 32px rgba(217,119,6,0.2)','--glow':'none','--radius':'16px' },
  },
  autumn: {
    label: 'Autumn', emoji: '🍂', dark: false, season: 'autumn',
    vars: { '--bg':'#fdf6ee','--surface':'#ffffff','--surface2':'#fdebd0','--primary':'#b45309','--primary-light':'#d97706','--primary-pale':'#fde8c5','--accent':'#7c3aed','--accent-pale':'#ede9fe','--danger':'#dc2626','--text':'#1c0a00','--text-muted':'#92400e','--border':'#fcd9a0','--shadow':'0 2px 16px rgba(180,83,9,0.10)','--shadow-lg':'0 8px 32px rgba(180,83,9,0.18)','--glow':'none','--radius':'16px' },
  },
  ocean: {
    label: 'Ocean', emoji: '🌊', dark: false, season: 'summer',
    vars: { '--bg':'#f0f7ff','--surface':'#ffffff','--surface2':'#e1f0ff','--primary':'#0077b6','--primary-light':'#48cae4','--primary-pale':'#caf0f8','--accent':'#f77f00','--accent-pale':'#fff0d6','--danger':'#e07070','--text':'#03045e','--text-muted':'#5d7a8a','--border':'#b8d8f0','--shadow':'0 2px 16px rgba(0,119,182,0.12)','--shadow-lg':'0 8px 32px rgba(0,119,182,0.2)','--glow':'none','--radius':'16px' },
  },
  candy: {
    label: 'Candy', emoji: '🍬', dark: false, season: 'spring',
    vars: { '--bg':'#fff5f8','--surface':'#ffffff','--surface2':'#ffe4ee','--primary':'#f72585','--primary-light':'#ff85ae','--primary-pale':'#ffd6e8','--accent':'#7209b7','--accent-pale':'#e9d5ff','--danger':'#dc2626','--text':'#2d0a1e','--text-muted':'#9c4870','--border':'#f9a8d4','--shadow':'0 2px 16px rgba(247,37,133,0.12)','--shadow-lg':'0 8px 32px rgba(247,37,133,0.2)','--glow':'none','--radius':'20px' },
  },
  // ── Dark themes ─────────────────────────────────────────────────
  forest_dark: {
    label: 'Forest Dark', emoji: '🌲', dark: true, season: 'spring',
    vars: { '--bg':'#0f1a0f','--surface':'#1a2e1a','--surface2':'#213221','--primary':'#52b788','--primary-light':'#74c69d','--primary-pale':'#1a3a2a','--accent':'#d4a853','--accent-pale':'#2a2010','--danger':'#f08080','--text':'#e8f5e8','--text-muted':'#8aab8a','--border':'#2d4a2d','--shadow':'0 2px 16px rgba(0,0,0,0.4)','--shadow-lg':'0 8px 32px rgba(0,0,0,0.5)','--glow':'none','--radius':'16px' },
  },
  winter: {
    label: 'Winter', emoji: '❄️', dark: true, season: 'winter',
    vars: { '--bg':'#0a0f1a','--surface':'#0f1829','--surface2':'#162035','--primary':'#60a5fa','--primary-light':'#93c5fd','--primary-pale':'#60a5fa15','--accent':'#a78bfa','--accent-pale':'#a78bfa15','--danger':'#f87171','--text':'#e0f2fe','--text-muted':'#7ca8c8','--border':'#60a5fa25','--shadow':'0 2px 20px rgba(96,165,250,0.15)','--shadow-lg':'0 8px 40px rgba(96,165,250,0.25)','--glow':'0 0 10px rgba(96,165,250,0.4), 0 0 25px rgba(167,139,250,0.2)','--radius':'18px' },
  },
  monsoon: {
    label: 'Monsoon', emoji: '🌧️', dark: true, season: 'monsoon',
    vars: { '--bg':'#0a1020','--surface':'#0f1830','--surface2':'#162040','--primary':'#38bdf8','--primary-light':'#7dd3fc','--primary-pale':'#38bdf815','--accent':'#34d399','--accent-pale':'#34d39915','--danger':'#f87171','--text':'#dbeafe','--text-muted':'#5b8fa8','--border':'#38bdf820','--shadow':'0 2px 20px rgba(56,189,248,0.12)','--shadow-lg':'0 8px 40px rgba(56,189,248,0.2)','--glow':'none','--radius':'16px' },
  },
  sunset: {
    label: 'Sunset', emoji: '🌅', dark: true, season: 'autumn',
    vars: { '--bg':'#1a0a1a','--surface':'#2a1030','--surface2':'#38163e','--primary':'#ff6b6b','--primary-light':'#ffa07a','--primary-pale':'#ff6b6b20','--accent':'#ffd700','--accent-pale':'#ffd70020','--danger':'#ff4444','--text':'#ffe8e8','--text-muted':'#c08090','--border':'#ff6b6b30','--shadow':'0 2px 16px rgba(255,107,107,0.15)','--shadow-lg':'0 8px 32px rgba(255,107,107,0.25)','--glow':'none','--radius':'16px' },
  },
  midnight: {
    label: 'Midnight', emoji: '🌙', dark: true, season: 'winter',
    vars: { '--bg':'#0d1117','--surface':'#161b22','--surface2':'#21262d','--primary':'#f1c40f','--primary-light':'#f39c12','--primary-pale':'#f1c40f15','--accent':'#e74c3c','--accent-pale':'#e74c3c15','--danger':'#e74c3c','--text':'#f0f6fc','--text-muted':'#8b949e','--border':'#30363d','--shadow':'0 2px 16px rgba(0,0,0,0.5)','--shadow-lg':'0 8px 40px rgba(0,0,0,0.6)','--glow':'none','--radius':'16px' },
  },
  neon: {
    label: 'Neon', emoji: '⚡', dark: true, season: null,
    vars: { '--bg':'#050508','--surface':'#0d0d14','--surface2':'#13131f','--primary':'#00ff88','--primary-light':'#00ffaa','--primary-pale':'#00ff8812','--accent':'#ff00ff','--accent-pale':'#ff00ff12','--danger':'#ff3366','--text':'#e0ffe8','--text-muted':'#60906a','--border':'#00ff8825','--shadow':'0 2px 20px rgba(0,255,136,0.12)','--shadow-lg':'0 8px 40px rgba(0,255,136,0.2)','--glow':'0 0 8px rgba(0,255,136,0.6), 0 0 20px rgba(0,255,136,0.3)','--radius':'16px' },
  },
  aurora: {
    label: 'Aurora', emoji: '🌌', dark: true, season: 'winter',
    vars: { '--bg':'#050a18','--surface':'#0a1628','--surface2':'#0f2040','--primary':'#a78bfa','--primary-light':'#c4b5fd','--primary-pale':'#a78bfa15','--accent':'#34d399','--accent-pale':'#34d39915','--danger':'#f87171','--text':'#e0e7ff','--text-muted':'#7c8db5','--border':'#a78bfa25','--shadow':'0 2px 20px rgba(167,139,250,0.15)','--shadow-lg':'0 8px 40px rgba(167,139,250,0.25)','--glow':'0 0 12px rgba(167,139,250,0.5), 0 0 30px rgba(52,211,153,0.2)','--radius':'20px' },
  },
  cyberpunk: {
    label: 'Cyberpunk', emoji: '🤖', dark: true, season: null,
    vars: { '--bg':'#0a0015','--surface':'#120025','--surface2':'#1a0035','--primary':'#fcee09','--primary-light':'#ffe55c','--primary-pale':'#fcee0912','--accent':'#ff2d78','--accent-pale':'#ff2d7815','--danger':'#ff2d78','--text':'#f0e6ff','--text-muted':'#8b78a0','--border':'#fcee0930','--shadow':'0 2px 20px rgba(252,238,9,0.1)','--shadow-lg':'0 8px 40px rgba(252,238,9,0.2)','--glow':'0 0 10px rgba(252,238,9,0.7), 0 0 25px rgba(255,45,120,0.3)','--radius':'4px' },
  },
  desert: {
    label: 'Desert', emoji: '🏜️', dark: false, season: 'summer',
    vars: { '--bg':'#fdf8f0','--surface':'#ffffff','--surface2':'#f5e6d0','--primary':'#c2410c','--primary-light':'#ea580c','--primary-pale':'#fed7aa','--accent':'#854d0e','--accent-pale':'#fef3c7','--danger':'#dc2626','--text':'#1c0a00','--text-muted':'#92400e','--border':'#fde8c8','--shadow':'0 2px 16px rgba(194,65,12,0.10)','--shadow-lg':'0 8px 32px rgba(194,65,12,0.18)','--glow':'none','--radius':'12px' },
  },
  arctic: {
    label: 'Arctic', emoji: '🧊', dark: false, season: 'winter',
    vars: { '--bg':'#f0f8ff','--surface':'#ffffff','--surface2':'#e0f0ff','--primary':'#0369a1','--primary-light':'#0ea5e9','--primary-pale':'#bae6fd','--accent':'#7c3aed','--accent-pale':'#ede9fe','--danger':'#dc2626','--text':'#0c1a2e','--text-muted':'#4a6fa5','--border':'#bae6fd','--shadow':'0 2px 16px rgba(3,105,161,0.10)','--shadow-lg':'0 8px 32px rgba(3,105,161,0.18)','--glow':'none','--radius':'20px' },
  },
  volcano: {
    label: 'Volcano', emoji: '🌋', dark: true, season: 'summer',
    vars: { '--bg':'#0d0500','--surface':'#1a0800','--surface2':'#2a1000','--primary':'#f97316','--primary-light':'#fb923c','--primary-pale':'#f9731615','--accent':'#fbbf24','--accent-pale':'#fbbf2415','--danger':'#ef4444','--text':'#fff7ed','--text-muted':'#9a7040','--border':'#f9731630','--shadow':'0 2px 20px rgba(249,115,22,0.15)','--shadow-lg':'0 8px 40px rgba(249,115,22,0.25)','--glow':'0 0 10px rgba(249,115,22,0.5), 0 0 25px rgba(251,191,36,0.2)','--radius':'12px' },
  },
};

export const FONTS = {
  classic:  { label:'Classic',  emoji:'📖', heading:'DM Serif Display', body:'DM Sans',        url:'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap' },
  modern:   { label:'Modern',   emoji:'✦',  heading:'Space Grotesk',    body:'Space Grotesk',  url:'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap' },
  elegant:  { label:'Elegant',  emoji:'🎩', heading:'Playfair Display', body:'Lato',           url:'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap' },
  playful:  { label:'Playful',  emoji:'🎈', heading:'Nunito',           body:'Nunito',         url:'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap' },
  hacker:   { label:'Hacker',   emoji:'💻', heading:'JetBrains Mono',   body:'JetBrains Mono', url:'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap' },
  raleway:  { label:'Raleway',  emoji:'💎', heading:'Raleway',          body:'Raleway',        url:'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&display=swap' },
  outfit:   { label:'Outfit',   emoji:'👗', heading:'Outfit',           body:'Outfit',         url:'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap' },
  syne:     { label:'Syne',     emoji:'🎭', heading:'Syne',             body:'DM Sans',        url:'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap' },
  bitter:   { label:'Bitter',   emoji:'☕', heading:'Bitter',           body:'Source Sans Pro', url:'https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+Pro:wght@300;400;600&display=swap' },
  quicksand:{ label:'Quicksand',emoji:'🌀', heading:'Quicksand',        body:'Quicksand',      url:'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap' },
};

// Auto-detect season based on month (Northern India seasons)
export function detectSeason(month = new Date().getMonth()) {
  if (month >= 2 && month <= 4)  return 'spring';  // Mar-May
  if (month >= 5 && month <= 6)  return 'summer';  // Jun-Jul
  if (month >= 7 && month <= 9)  return 'monsoon'; // Aug-Oct
  if (month >= 10 && month <= 10) return 'autumn'; // Nov
  return 'winter';                                  // Dec-Feb
}

// Suggest best theme for current season
export function getSeasonTheme(season, preferDark = false) {
  const map = {
    spring:  preferDark ? 'forest_dark' : 'spring',
    summer:  preferDark ? 'sunset'      : 'summer',
    monsoon: preferDark ? 'monsoon'     : 'ocean',
    autumn:  preferDark ? 'sunset'      : 'autumn',
    winter:  preferDark ? 'winter'      : 'arctic',
  };
  return map[season] || (preferDark ? 'forest_dark' : 'forest');
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('ht_theme') || 'forest');
  const [fontKey,  setFontKey]  = useState(() => localStorage.getItem('ht_font')  || 'classic');

  const theme = THEMES[themeKey] || THEMES.forest;
  const font  = FONTS[fontKey]   || FONTS.classic;
  const isDark = theme.dark;
  const isNeon = themeKey === 'neon';
  const currentSeason = detectSeason();

  useEffect(() => {
    const root = document.documentElement;
    if (theme.dark) root.classList.add('dark');
    else            root.classList.remove('dark');

    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty('--font-heading', `'${font.heading}', serif`);
    root.style.setProperty('--font-body',    `'${font.body}', sans-serif`);
    document.body.style.fontFamily = `'${font.body}', sans-serif`;

    // Special body classes
    const bodyClasses = ['neon-scanlines','cyberpunk-glitch','theme-winter','theme-monsoon','theme-aurora','theme-volcano'];
    bodyClasses.forEach(c => document.body.classList.remove(c));
    if (themeKey === 'neon')      document.body.classList.add('neon-scanlines');
    if (themeKey === 'cyberpunk') document.body.classList.add('cyberpunk-glitch');
    if (themeKey === 'winter')    document.body.classList.add('theme-winter');
    if (themeKey === 'monsoon')   document.body.classList.add('theme-monsoon');
    if (themeKey === 'aurora')    document.body.classList.add('theme-aurora');
    if (themeKey === 'volcano')   document.body.classList.add('theme-volcano');

    let link = document.getElementById('theme-font');
    if (!link) { link = document.createElement('link'); link.id = 'theme-font'; link.rel = 'stylesheet'; document.head.appendChild(link); }
    link.href = font.url;

    localStorage.setItem('ht_theme', themeKey);
    localStorage.setItem('ht_font',  fontKey);
  }, [themeKey, fontKey, theme, font]);

  const toggleTheme = () => {
    if (themeKey === 'forest')           setThemeKey('forest_dark');
    else if (themeKey === 'forest_dark') setThemeKey('forest');
  };

  const applySeasonTheme = (preferDark = false) => {
    setThemeKey(getSeasonTheme(currentSeason, preferDark));
  };

  return (
    <ThemeContext.Provider value={{
      themeKey, setThemeKey, fontKey, setFontKey,
      theme, font, isDark, isNeon, toggleTheme,
      currentSeason, applySeasonTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);