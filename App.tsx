
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedListings from './components/FeaturedListings';
import About from './components/About';
import Footer from './components/Footer';
import PropertyDetailModal from './components/PropertyDetailModal';
import Toast from './components/Toast';
import { type Property } from './types';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info';
}

const App: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [savedProperties, setSavedProperties] = useState<Set<number>>(new Set());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const storedSaved = localStorage.getItem('haus_saved_properties');
    if (storedSaved) {
      setSavedProperties(new Set(JSON.parse(storedSaved)));
    }
  }, []);
  
  const addToast = (message: string, type: 'success' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleSavedProperty = (propertyId: number) => {
    const wasSaved = savedProperties.has(propertyId);
    setSavedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      localStorage.setItem('haus_saved_properties', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
    
    if (!wasSaved) {
      addToast('Property saved!', 'success');
    } else {
      addToast('Removed from saved properties.', 'info');
    }
  };

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
        <Hero 
          onPropertyClick={handleOpenPropertyModal} 
          savedProperties={savedProperties}
          onToggleSave={toggleSavedProperty}
        />
        <FeaturedListings 
          onPropertyClick={handleOpenPropertyModal}
          savedProperties={savedProperties}
          onToggleSave={toggleSavedProperty}
        />
        <About />
      </main>
      <Footer />
      {selectedProperty && (
        <PropertyDetailModal 
          property={selectedProperty} 
          onClose={handleClosePropertyModal}
          savedProperties={savedProperties}
          onToggleSave={toggleSavedProperty}
        />
      )}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2">
        {toasts.map(toast => (
            <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </>
  );
};

export default App;