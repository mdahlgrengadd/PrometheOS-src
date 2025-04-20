import { Cloud, CloudRain, Home, LogOut, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

const StartMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is a simple mock weather data - in a real app you'd fetch from a weather API
    const fetchWeather = async () => {
      setLoading(true);
      // Simulating API call delay
      setTimeout(() => {
        setWeather({
          temperature: 72,
          condition: "Partly Cloudy",
          location: "Your Location",
        });
        setLoading(false);
      }, 1000);
    };

    fetchWeather();
  }, []);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".start-menu") && !target.closest(".taskbar-start")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="start-menu">
      <div className="start-menu-header">
        <Home className="w-5 h-5 mr-2" />
        <h2>Welcome!</h2>
      </div>

      <div className="start-menu-content">
        <div className="weather-widget">
          <h3>Weather</h3>
          {loading ? (
            <div className="weather-loading">Loading weather data...</div>
          ) : (
            <div className="weather-data">
              <div className="weather-icon">
                {weather?.condition.includes("Cloud") ? (
                  <Cloud className="w-8 h-8" />
                ) : weather?.condition.includes("Rain") ? (
                  <CloudRain className="w-8 h-8" />
                ) : (
                  <Sun className="w-8 h-8" />
                )}
              </div>
              <div className="weather-details">
                <div className="weather-temp">{weather?.temperature}°F</div>
                <div className="weather-condition">{weather?.condition}</div>
                <div className="weather-location">{weather?.location}</div>
              </div>
            </div>
          )}
        </div>

        <div className="recent-apps">
          <h3>Quick Access</h3>
          <ul>
            <li>Documents</li>
            <li>Pictures</li>
            <li>Settings</li>
          </ul>
        </div>

        <div className="logout-option">
          <button className="logout-button" onClick={onClose}>
            <LogOut className="w-5 h-5 mr-2" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
