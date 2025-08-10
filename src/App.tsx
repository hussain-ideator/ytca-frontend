import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import VideoInsights from './pages/VideoInsights';
import Engagement from './pages/Engagement';
import KIAbyAI from './pages/KIAbyAI';
import './App.scss';

const App: React.FC = () => {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/video-insights" element={<VideoInsights />} />
          <Route path="/engagement" element={<Engagement />} />
          <Route path="/keywords" element={<KIAbyAI />} />
        </Routes>
      </Router>
      </div>
  );
};

export default App;
