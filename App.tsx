
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedListings from './components/FeaturedListings';
import About from './components/About';
import Footer from './components/Footer';
import PropertyDetailModal from './components/PropertyDetailModal';
import { type Property } from './types';

const App: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleOpenPropertyModal = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleClosePropertyModal = () => {
    setSelectedProperty(null);
  };

  return (
    <>
      {/* Background layers */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 hidden opacity-[0.25] bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute inset-0 hidden opacity-[0.12] bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:120px_1px,1px_120px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      <Header />
      <main>
        <Hero onPropertyClick={handleOpenPropertyModal} />
        <FeaturedListings onPropertyClick={handleOpenPropertyModal} />
        <About />
      </main>
      <Footer />
      {selectedProperty && <PropertyDetailModal property={selectedProperty} onClose={handleClosePropertyModal} />}
    </>
  );
};

export default App;