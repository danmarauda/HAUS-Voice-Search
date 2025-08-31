
import React, { useEffect } from 'react';
import { type Property } from '../types';
import { XIcon, MapPinIcon, EyeIcon, RouteIcon } from './IconComponents';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
}

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const { title, location, price, details, imageUrl, description, button } = property;
  const ButtonIcon = button.icon === 'eye' ? EyeIcon : RouteIcon;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-modal-title"
    >
      <div
        className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="relative flex-shrink-0">
          <img src={imageUrl} alt={title} className="w-full h-56 sm:h-64 object-cover rounded-t-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="property-modal-title" className="text-2xl font-semibold font-geist tracking-tight text-white">{title}</h2>
              <p className="text-sm text-neutral-400 mt-1 flex items-center gap-1.5 font-geist">
                <MapPinIcon className="w-4 h-4 stroke-[1.5]" />
                {location}
              </p>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0 flex-shrink-0 sm:ml-4">
              <div className="text-2xl font-semibold text-white font-geist">{price}</div>
              <div className="text-sm text-neutral-400 font-geist">{details}</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-medium font-geist text-white">About this property</h3>
            <p className="mt-2 text-sm text-neutral-300 leading-relaxed font-geist">{description}</p>
          </div>
        </div>
        <div className="mt-auto p-6 border-t border-white/10 flex justify-end flex-shrink-0 bg-neutral-900/50 rounded-b-2xl">
            <button className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium tracking-tight text-white bg-blue-600 hover:bg-blue-700 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
              <ButtonIcon className="w-4 h-4 stroke-[1.5]" />
              <span className="font-geist">{button.text}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailModal;
