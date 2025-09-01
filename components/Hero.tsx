
import React, { useState } from 'react';
import VoiceCopilot from './VoiceCopilot';
import PropertyCard from './PropertyCard';
import { type Property, type SearchParams } from '../types';

interface HeroProps {
  onPropertyClick: (property: Property) => void;
  savedProperties: Set<number>;
  onToggleSave: (id: number) => void;
}

const Hero: React.FC<HeroProps> = ({ onPropertyClick, savedProperties, onToggleSave }) => {
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  
  const handleShowResults = (results: Property[], params: SearchParams) => {
    setSearchResults(results);
  };

  return (
      <section className="max-w-7xl sm:px-6 mx-auto mb-8 px-4 relative z-10">
          <>
            <div className="pt-24 sm:pt-32 text-center">
              <div className="max-w-xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-geist tracking-tighter font-medium text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400">
                  Search with your voice
                </h1>
                <p className="mt-4 text-base text-neutral-400">
                  Just tell us what you're looking for.
                </p>
              </div>

              <div className="mt-10 max-w-7xl mx-auto">
                <div 
                  className="bg-neutral-950/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-full h-[70vh] max-h-[700px] min-h-[600px] overflow-hidden"
                >
                  <VoiceCopilot onResults={handleShowResults} />
                </div>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-16 animate-scale-up" style={{ animationDuration: '0.5s' }}>
                <h2 className="text-xl sm:text-2xl text-center text-neutral-100 font-geist tracking-tighter font-medium">
                  Your Search Results
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {searchResults.map(property => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onButtonClick={onPropertyClick}
                      savedProperties={savedProperties}
                      onToggleSave={onToggleSave}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
      </section>
  );
};

export default Hero;