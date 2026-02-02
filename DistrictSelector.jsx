import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';

const DistrictSelector = ({ city, districts, onSelect, onClose }) => {
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const handleSelect = (district) => {
    setSelectedDistrict(district);
    onSelect(district);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            你想在 {city} 的哪个区域吃？
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            {districts.map((district) => (
              <button
                key={district.district}
                onClick={() => handleSelect(district)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedDistrict?.district === district.district
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">{district.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictSelector;
