import React, { useEffect, useState } from "react";
import { fetchLocations } from "./api";

const LocationSelector = ({ onLocationChange }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [centers, setCenters] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");

  // Load countries from "root"
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchLocations("root");
        setCountries(data);
      } catch (err) {
        console.error("Error loading countries:", err?.message || err);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const loadStates = async () => {
      if (selectedCountry) {
        try {
          const data = await fetchLocations("country", selectedCountry);
          setStates(data);
          setSelectedState("");
          setCities([]);
          setSelectedCity("");
          setCenters([]);
          setSelectedCenter("");
        } catch (err) {
          console.error("Error loading states:", err?.message || err);
        }
      }
    };
    loadStates();
  }, [selectedCountry]);

  useEffect(() => {
    const loadCities = async () => {
      if (selectedState) {
        try {
          const data = await fetchLocations("state", selectedState);
          setCities(data);
          setSelectedCity("");
          setCenters([]);
          setSelectedCenter("");
        } catch (err) {
          console.error("Error loading cities:", err?.message || err);
        }
      }
    };
    loadCities();
  }, [selectedState]);

  useEffect(() => {
    const loadCenters = async () => {
      if (selectedCity) {
        try {
          const data = await fetchLocations("city", selectedCity);
          setCenters(data);
          setSelectedCenter(""); // ✅ Manual selection required
        } catch (err) {
          console.error("Error loading centers:", err?.message || err);
        }
      }
    };
    loadCenters();
  }, [selectedCity]);

  useEffect(() => {
    if (
      selectedCountry &&
      selectedState &&
      selectedCity &&
      selectedCenter &&
      typeof onLocationChange === "function"
    ) {
      onLocationChange({
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
        center: selectedCenter
      });
    }
  }, [selectedCountry, selectedState, selectedCity, selectedCenter, onLocationChange]);

  return (
    <div className="voting-card">
      <h3 style={{ textAlign: "center" }}>🗺️ Select Location</h3>

      <label><span role="img" aria-label="country">🌍</span> Country:</label>
      <select className="styled-select" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
        <option value="">-- Select Country --</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>

      <br /><br />

      <label><span role="img" aria-label="state">🗺️</span> State:</label>
      <select className="styled-select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!selectedCountry}>
        <option value="">-- Select State --</option>
        {states.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>

      <br /><br />

      <label><span role="img" aria-label="city">🏙️</span> City:</label>
      <select className="styled-select" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}>
        <option value="">-- Select City --</option>
        {cities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>

      <br /><br />

      <label><span role="img" aria-label="center">🏛️</span> Voting Center:</label>
      <select className="styled-select" value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)} disabled={!selectedCity}>
        <option value="">-- Select Center --</option>
        {centers.map((center) => (
          <option key={center} value={center}>{center}</option>
        ))}
      </select>
    </div>
  );
};

export default LocationSelector;