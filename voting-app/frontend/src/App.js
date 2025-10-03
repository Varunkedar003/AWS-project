import React, { useState } from "react";
import Voting from "./components/Voting";
import Results from "./components/Results";
import LocationSelector from "./LocationSelector";
import "./index.css"; // ✅ Global styles

function App() {
  const [location, setLocation] = useState({
    country: '',
    state: '',
    city: '',
    center: ''
  });

  // ✅ Inline background style to avoid Webpack errors
  const appStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL + '/images/evm-background.jpg'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh'
  };

  return (
    <div style={appStyle}>
      {/* ✅ Header Banner */}
      <header className="voting-header">
        <img src="/images/evm-logo.png" alt="EVM Logo" className="logo" />
        <h1>AWS Voting System</h1>
      </header>

      {/* ✅ Step Indicator */}
      <div className="step-indicator">
        <span className="step active">1. Select Location</span>
        <span className="step">2. Cast Vote</span>
        <span className="step">3. View Results</span>
      </div>

      {/* ✅ Main Voting Card */}
      <div className="voting-card">
        <LocationSelector onLocationChange={setLocation} />
        <Voting location={location} />
        <Results />
      </div>

      {/* ✅ Footer Attribution */}
      <footer className="voting-footer">
        <p>
          © {new Date().getFullYear()} AWS Voting System. Visual assets from Freepik & Icons8. Attribution required.
        </p>
      </footer>
    </div>
  );
}

export default App;