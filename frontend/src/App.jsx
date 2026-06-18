import React from 'react';
import IEEECertificatePortal from './components/IEEECertificatePortal';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Decorative Background Elements behind the Portal */}
      <div className="bg-decoration">
        {/* Top-Left Rings / Orbits */}
        <svg className="bg-orbit bg-orbit-left" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="120" cy="120" r="90" stroke="rgba(0, 98, 155, 0.04)" strokeWidth="1.5" />
          <circle cx="120" cy="120" r="160" stroke="rgba(0, 98, 155, 0.03)" strokeWidth="1.2" />
          <circle cx="120" cy="120" r="230" stroke="rgba(0, 98, 155, 0.02)" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="120" cy="120" r="45" fill="rgba(0, 98, 155, 0.02)" />
        </svg>

        {/* Top-Right Soft Orb */}
        <div className="bg-blur-circle-right"></div>

        {/* Bottom Smooth Waves */}
        <div className="bg-waves-container">
          <svg className="bg-wave" viewBox="0 0 1440 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* First soft wave */}
            <path d="M0,160 C360,260 720,120 1080,220 C1260,270 1380,240 1440,220 L1440,300 L0,300 Z" fill="rgba(255, 255, 255, 0.45)" />
            {/* Second overlay wave */}
            <path d="M0,200 C360,120 720,240 1080,160 C1260,120 1380,180 1440,200 L1440,300 L0,300 Z" fill="rgba(219, 234, 254, 0.35)" />
            {/* Third foreground wave */}
            <path d="M0,240 C360,200 720,260 1080,220 C1260,200 1380,250 1440,240 L1440,300 L0,300 Z" fill="rgba(255, 255, 255, 0.7)" />
          </svg>
        </div>
      </div>

      <IEEECertificatePortal />
    </div>
  );
}

export default App;