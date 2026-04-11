import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchWeatherByCoords, fetchWeatherByCity, getWeatherEffect } from '../api/weather';

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const [weather, setWeather]   = useState(null);  // raw OWM data
  const [effect, setEffect]     = useState('clear'); // fog/rain/snow/sunny/etc
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [city, setCity]         = useState('');

  const applyWeather = useCallback((data) => {
    setWeather(data);
    const code = data.weather?.[0]?.id || 800;
    setEffect(getWeatherEffect(code));
    setCity(data.name || '');
    // Cache
    localStorage.setItem('ht_weather', JSON.stringify({ data, ts: Date.now() }));
  }, []);

  useEffect(() => {
    // Try cache first (valid for 30 minutes)
    try {
      const cached = JSON.parse(localStorage.getItem('ht_weather') || 'null');
      if (cached && Date.now() - cached.ts < 30 * 60 * 1000) {
        applyWeather(cached.data);
        setLoading(false);
        return;
      }
    } catch {}

    // No valid key → skip silently
    const key = import.meta.env.VITE_WEATHER_KEY;
    if (!key || key === 'your_openweathermap_key_here') {
      setLoading(false);
      return;
    }

    // Geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const data = await fetchWeatherByCoords(
              pos.coords.latitude, pos.coords.longitude
            );
            applyWeather(data);
          } catch (e) {
            setError(e.message);
          } finally {
            setLoading(false);
          }
        },
        async () => {
          // Fallback to IP-based city
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ip    = await ipRes.json();
            const data  = await fetchWeatherByCity(ip.city || 'Delhi');
            applyWeather(data);
          } catch (e) {
            setError(e.message);
          } finally {
            setLoading(false);
          }
        }
      );
    } else {
      setLoading(false);
    }
  }, [applyWeather]);

  const tempC    = weather?.main?.temp ?? null;
  const humidity = weather?.main?.humidity ?? null;
  const desc     = weather?.weather?.[0]?.description ?? '';
  const icon     = weather?.weather?.[0]?.icon ?? '';

  return (
    <WeatherContext.Provider value={{
      weather, effect, loading, error,
      tempC, humidity, desc, icon, city,
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => useContext(WeatherContext);