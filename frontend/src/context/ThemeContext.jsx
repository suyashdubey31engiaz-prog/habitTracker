import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  forest: {
    label: 'Forest', emoji: '🌿', dark: false,
    vars: { '--bg':'#f5f7f4','--surface':'#ffffff','--surface2':'#eef2ee','--primary':'#2d6a4f','--primary-light':'#52b788','--primary-pale':'#d8f3dc','--accent':'#d4a853','--accent-pale':'#fef3c7','--danger':'#e07070','--text':'#1a2e1a','--text-muted':'#6b8c7b','--border':'#dde8dd','--shadow':'0 2px 16px rgba(45,106,79,0.10)','--shadow-lg':'0 8px 32px rgba(45,106,79,0.18)','--glow':'none','--radius':'16px' },
  },
  forest_dark: {
    label: 'Forest Dark', emoji: '🌲', dark: true,
    vars: { '--bg':'#0f1a0f','--surface':'#1a2e1a','--surface2':'#213221','--primary':'#52b788','--primary-light':'#74c69d','--primary-pale':'#1a3a2a','--accent':'#d4a853','--accent-pale':'#2a2010','--danger':'#f08080','--text':'#e8f5e8','--text-muted':'#8aab8a','--border':'#2d4a2d','--shadow':'0 2px 16px rgba(0,0,0,0.4)','--shadow-lg':'0 8px 32px rgba(0,0,0,0.5)','--glow':'none','--radius':'16px' },
  },
  ocean: {
    label: 'Ocean', emoji: '🌊', dark: false,
    vars: { '--bg':'#f0f7ff','--surface':'#ffffff','--surface2':'#e1f0ff','--primary':'#0077b6','--primary-light':'#48cae4','--primary-pale':'#caf0f8','--accent':'#f77f00','--accent-pale':'#fff0d6','--danger':'#e07070','--text':'#03045e','--text-muted':'#5d7a8a','--border':'#b8d8f0','--shadow':'0 2px 16px rgba(0,119,182,0.12)','--shadow-lg':'0 8px 32px rgba(0,119,182,0.2)','--glow':'none','--radius':'16px' },
  },
  sunset: {
    label: 'Sunset', emoji: '🌅', dark: true,
    vars: { '--bg':'#1a0a1a','--surface':'#2a1030','--surface2':'#38163e','--primary':'#ff6b6b','--primary-light':'#ffa07a','--primary-pale':'#ff6b6b20','--accent':'#ffd700','--accent-pale':'#ffd70020','--danger':'#ff4444','--text':'#ffe8e8','--text-muted':'#c08090','--border':'#ff6b6b30','--shadow':'0 2px 16px rgba(255,107,107,0.15)','--shadow-lg':'0 8px 32px rgba(255,107,107,0.25)','--glow':'none','--radius':'16px' },
  },
  midnight: {
    label: 'Midnight', emoji: '🌙', dark: true,
    vars: { '--bg':'#0d1117','--surface':'#161b22','--surface2':'#21262d','--primary':'#f1c40f','--primary-light':'#f39c12','--primary-pale':'#f1c40f15','--accent':'#e74c3c','--accent-pale':'#e74c3c15','--danger':'#e74c3c','--text':'#f0f6fc','--text-muted':'#8b949e','--border':'#30363d','--shadow':'0 2px 16px rgba(0,0,0,0.5)','--shadow-lg':'0 8px 40px rgba(0,0,0,0.6)','--glow':'none','--radius':'16px' },
  },
  neon: {
    label: 'Neon', emoji: '⚡', dark: true,
    vars: { '--bg':'#050508','--surface':'#0d0d14','--surface2':'#13131f','--primary':'#00ff88','--primary-light':'#00ffaa','--primary-pale':'#00ff8812','--accent':'#ff00ff','--accent-pale':'#ff00ff12','--danger':'#ff3366','--text':'#e0ffe8','--text-muted':'#60906a','--border':'#00ff8825','--shadow':'0 2px 20px rgba(0,255,136,0.12)','--shadow-lg':'0 8px 40px rgba(0,255,136,0.2)','--glow':'0 0 8px rgba(0,255,136,0.6), 0 0 20px rgba(0,255,136,0.3)','--radius':'16px' },
  },
  aurora: {
    label: 'Aurora', emoji: '🌌', dark: true,
    vars: { '--bg':'#050a18','--surface':'#0a1628','--surface2':'#0f2040','--primary':'#a78bfa','--primary-light':'#c4b5fd','--primary-pale':'#a78bfa15','--accent':'#34d399','--accent-pale':'#34d39915','--danger':'#f87171','--text':'#e0e7ff','--text-muted':'#7c8db5','--border':'#a78bfa25','--shadow':'0 2px 20px rgba(167,139,250,0.15)','--shadow-lg':'0 8px 40px rgba(167,139,250,0.25)','--glow':'0 0 12px rgba(167,139,250,0.5), 0 0 30px rgba(52,211,153,0.2)','--radius':'20px' },
  },
  candy: {
    label: 'Candy', emoji: '🍬', dark: false,
    vars: { '--bg':'#fff5f8','--surface':'#ffffff','--surface2':'#ffe4ee','--primary':'#f72585','--primary-light':'#ff85ae','--primary-pale':'#ffd6e8','--accent':'#7209b7','--accent-pale':'#e9d5ff','--danger':'#dc2626','--text':'#2d0a1e','--text-muted':'#9c4870','--border':'#f9a8d4','--shadow':'0 2px 16px rgba(247,37,133,0.12)','--shadow-lg':'0 8px 32px rgba(247,37,133,0.2)','--glow':'none','--radius':'20px' },
  },
  cyberpunk: {
    label: 'Cyberpunk', emoji: '🤖', dark: true,
    vars: { '--bg':'#0a0015','--surface':'#120025','--surface2':'#1a0035','--primary':'#fcee09','--primary-light':'#ffe55c','--primary-pale':'#fcee0912','--accent':'#ff2d78','--accent-pale':'#ff2d7815','--danger':'#ff2d78','--text':'#f0e6ff','--text-muted':'#8b78a0','--border':'#fcee0930','--shadow':'0 2px 20px rgba(252,238,9,0.1)','--shadow-lg':'0 8px 40px rgba(252,238,9,0.2)','--glow':'0 0 10px rgba(252,238,9,0.7), 0 0 25px rgba(255,45,120,0.3)','--radius':'4px' },
  },
  sakura: {
    label: 'Sakura', emoji: '🌸', dark: false,
    vars: { '--bg':'#fff9fb','--surface':'#ffffff','--surface2':'#fce7ef','--primary':'#e75480','--primary-light':'#f4a7bb','--primary-pale':'#fde8f0','--accent':'#8b6914','--accent-pale':'#fef9c3','--danger':'#dc2626','--text':'#1a0a10','--text-muted':'#9c6b7a','--border':'#f4c2d0','--shadow':'0 2px 16px rgba(231,84,128,0.10)','--shadow-lg':'0 8px 32px rgba(231,84,128,0.18)','--glow':'none','--radius':'24px' },
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
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('ht_theme') || 'forest');
  const [fontKey,  setFontKey]  = useState(() => localStorage.getItem('ht_font')  || 'classic');

  const theme = THEMES[themeKey] || THEMES.forest;
  const font  = FONTS[fontKey]   || FONTS.classic;
  const isDark = theme.dark;
  const isNeon = themeKey === 'neon';

  useEffect(() => {
    const root = document.documentElement;
    if (theme.dark) root.classList.add('dark');
    else            root.classList.remove('dark');

    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty('--font-heading', `'${font.heading}', serif`);
    root.style.setProperty('--font-body',    `'${font.body}', sans-serif`);
    document.body.style.fontFamily = `'${font.body}', sans-serif`;

    if (themeKey === 'neon')      document.body.classList.add('neon-scanlines');
    else                          document.body.classList.remove('neon-scanlines');
    if (themeKey === 'cyberpunk') document.body.classList.add('cyberpunk-glitch');
    else                          document.body.classList.remove('cyberpunk-glitch');

    let link = document.getElementById('theme-font');
    if (!link) { link = document.createElement('link'); link.id = 'theme-font'; link.rel = 'stylesheet'; document.head.appendChild(link); }
    link.href = font.url;

    localStorage.setItem('ht_theme', themeKey);
    localStorage.setItem('ht_font',  fontKey);
  }, [themeKey, fontKey, theme, font]);

  const toggleTheme = () => {
    if (themeKey === 'forest')      setThemeKey('forest_dark');
    else if (themeKey === 'forest_dark') setThemeKey('forest');
  };

  return (
    <ThemeContext.Provider value={{ themeKey, setThemeKey, fontKey, setFontKey, theme, font, isDark, isNeon, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);