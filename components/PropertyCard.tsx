
import React, { useState } from 'react';
import { type Property } from '../types';
import { MapPinIcon, EyeIcon, HeartIcon, RouteIcon } from './IconComponents';

interface PropertyCardProps {
  property: Property;
  onButtonClick: (property: Property) => void;
  savedProperties: Set<number>;
  onToggleSave: (id: number) => void;
}

const tagStyles = {
  new: 'bg-cyan-600/90 text-white',
  premium: 'bg-indigo-900/90 text-white',
  'open-house': 'bg-white/90 text-indigo-900',
  auction: 'bg-amber-600/90 text-white',
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onButtonClick, savedProperties, onToggleSave }) => {
  const { id, title, location, price, details, imageUrl, tag, button } = property;
  
  const ButtonIcon = button.icon === 'eye' ? EyeIcon : RouteIcon;
  const isSaved = savedProperties.has(id);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggleSave = () => {
    if (!isSaved) { // Only animate when saving
      setIsAnimating(true);
      // The animation duration is 400ms, remove the class after it finishes
      setTimeout(() => setIsAnimating(false), 400); 
    }
    onToggleSave(id);
  };

  return (
    <article className="group overflow-hidden bg-neutral-900/90 border border-white/10 rounded-lg h-full flex flex-col">
      <div className="relative aspect-[16/10]">
        <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        {tag && (
          <div className={`absolute top-3 left-3 text-[11px] font-medium backdrop-blur-sm rounded-lg px-2.5 py-1 border border-white/20 font-geist ${tagStyles[tag.type]}`}>
            {tag.text}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-neutral-100 font-geist">{title}</h3>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1 font-geist">
              <MapPinIcon className="w-3.5 h-3.5 stroke-[1.5]" />
              {location}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <div className="text-lg font-semibold text-neutral-100 font-geist">{price}</div>
            <div className="text-[11px] text-neutral-400 font-geist">{details}</div>
          </div>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <button 
            onClick={() => onButtonClick(property)}
            className="inline-flex items-center gap-2 text-xs font-medium tracking-tight text-neutral-200 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 border border-white/10 font-geist">
            <ButtonIcon className="w-3.5 h-3.5 stroke-[1.5]" />
            {button.text}
          </button>
          <button 
            onClick={handleToggleSave}
            aria-label={isSaved ? "Unsave property" : "Save property"}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-neutral-200 hover:bg-white/10 transition-colors"
          >
            <HeartIcon className={`w-4 h-4 stroke-[1.5] transition-colors ${isSaved ? 'fill-red-500 stroke-red-500' : ''} ${isAnimating ? 'animate-heart-pop' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;