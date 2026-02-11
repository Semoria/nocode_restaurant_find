import React, { createContext, useContext, useState } from 'react';

// 创建上下文用于跨组件共享位置状态
const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [locationName, setLocationName] = useState('');

  const value = {
    coordinates,
    setCoordinates,
    locationName,
    setLocationName
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
