const BASE = 'https://api.openweathermap.org/data/2.5';
const KEY  = import.meta.env.VITE_WEATHER_KEY;

export async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(
    `${BASE}/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric`
  );
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

export async function fetchWeatherByCity(city) {
  const res = await fetch(
    `${BASE}/weather?q=${city}&appid=${KEY}&units=metric`
  );
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

// Map OpenWeatherMap condition code → internal effect name
export function getWeatherEffect(weatherCode, hour = new Date().getHours()) {
  const isNight = hour < 6 || hour >= 20;

  if (weatherCode >= 200 && weatherCode < 300) return 'storm';
  if (weatherCode >= 300 && weatherCode < 600) return 'rain';
  if (weatherCode >= 600 && weatherCode < 700) return 'snow';
  if (weatherCode >= 700 && weatherCode < 800) return 'fog';
  if (weatherCode === 800) return isNight ? 'night' : 'sunny';
  if (weatherCode > 800)   return isNight ? 'night' : 'cloudy';
  return 'clear';
}

// Habit recommendations based on weather
export function getWeatherRecommendations(effect, tempC) {
  const recs = {
    sunny:  [
      { emoji: '🏃', text: 'Perfect weather for your outdoor run!' },
      { emoji: '💧', text: `It's ${Math.round(tempC)}°C — drink extra water today` },
      { emoji: '🧘', text: 'Great morning for outdoor meditation' },
    ],
    rain: [
      { emoji: '📚', text: 'Rainy day — ideal for indoor reading' },
      { emoji: '🏋️', text: 'Skip the run, do home workout instead' },
      { emoji: '🍵', text: 'Cozy weather for mindful tea breaks' },
    ],
    snow: [
      { emoji: '🧘', text: 'Cold outside — perfect for indoor yoga' },
      { emoji: '📖', text: 'Snow day reading session?' },
      { emoji: '💊', text: 'Take your vitamins — cold season!' },
    ],
    fog: [
      { emoji: '🚶', text: 'Foggy morning — slow mindful walk?' },
      { emoji: '✍️', text: 'Misty vibes call for journaling' },
      { emoji: '🍵', text: 'Warm up with your morning ritual' },
    ],
    storm: [
      { emoji: '🏠', text: 'Stay safe indoors today' },
      { emoji: '📚', text: 'Storm outside = deep focus inside' },
      { emoji: '💪', text: 'Perfect for an indoor workout' },
    ],
    night: [
      { emoji: '😴', text: 'Wind down — time for sleep habits' },
      { emoji: '📵', text: 'Reduce screen time before bed' },
      { emoji: '✍️', text: 'Evening journal before sleep?' },
    ],
    cloudy: [
      { emoji: '🚶', text: 'Cool cloudy day — great for a walk' },
      { emoji: '📚', text: 'Overcast = perfect reading light' },
    ],
  };
  return recs[effect] || recs.cloudy;
}

// Temperature-based comfort description
export function getTempDescription(tempC) {
  if (tempC <= 0)  return { label: 'Freezing ❄️', color: '#a8d8ea' };
  if (tempC <= 10) return { label: 'Cold 🥶',     color: '#48cae4' };
  if (tempC <= 18) return { label: 'Cool 🌤️',     color: '#74c69d' };
  if (tempC <= 26) return { label: 'Pleasant 😊', color: '#52b788' };
  if (tempC <= 34) return { label: 'Warm ☀️',     color: '#f4a261' };
  return                  { label: 'Hot 🔥',       color: '#e07070' };
}