import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import DrinkSearchSection from '../components/DrinkSearchSection';
import { LocationProvider } from '../contexts/LocationContext';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LocationProvider>
        <HeroSection />
        <DrinkSearchSection />
      </LocationProvider>
    </div>
  );
};

export default Index;
