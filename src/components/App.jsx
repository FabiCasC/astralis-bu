import React, { useState } from 'react';
import CinematicIntro from './CinematicIntro';
import AsteroidSimulator from './AsteroidSimulator';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  
  const handleIntroComplete = () => {
    setTransitioning(true);
    setTimeout(() => {
      setShowIntro(false);
      setTransitioning(false);
    }, 1500);
  };
  
  if (showIntro) {
    return (
      <div className={`intro-transition ${transitioning ? 'fade-out' : ''}`}>
        <CinematicIntro onComplete={handleIntroComplete} />
      </div>
    );
  }
  
  return <AsteroidSimulator />;
}

export default App;
