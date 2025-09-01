
import React from 'react';
import PropertyCard from './PropertyCard';
import { type Property } from '../types';
import { ArrowUpRightIcon } from './IconComponents';

const featuredProperties: Property[] = [
  {
    id: 1,
    title: 'Bondi Beachfront Penthouse',
    location: 'Sydney, NSW',
    price: '$4.5M',
    details: '3 bd • 3 ba • 250 sqm',
    imageUrl: 'https://picsum.photos/800/600?random=21',
    description: 'Experience the ultimate coastal lifestyle in this exquisite Bondi penthouse. Offering panoramic ocean views, designer interiors, and a spacious terrace perfect for entertaining. Steps away from the iconic Bondi Beach, cafes, and boutiques.',
    tag: { text: 'New', type: 'new' },
    tourAvailable: true,
    button: { text: 'Virtual tour', icon: 'eye' }
  },
  {
    id: 2,
    title: 'Chic Laneway Warehouse Conversion',
    location: 'Melbourne, VIC',
    price: '$2.1M',
    details: '2 bd • 2 ba • 180 sqm',
    imageUrl: 'https://picsum.photos/800/600?random=22',
    description: 'A stunning warehouse conversion tucked away in one of Melbourne\'s iconic laneways. Featuring soaring ceilings, exposed brickwork, and industrial-chic finishes. This unique home offers a sophisticated urban sanctuary in the heart of the CBD.',
    tag: { text: 'Premium', type: 'premium' },
    tourAvailable: true,
    button: { text: 'Virtual tour', icon: 'eye' }
  },
  {
    id: 3,
    title: 'Classic Queenslander Home',
    location: 'Brisbane, QLD',
    price: '$1.75M',
    details: '4 bd • 3 ba • 400 sqm',
    imageUrl: 'https://picsum.photos/800/600?random=23',
    description: 'A beautifully restored Queenslander combining classic charm with modern luxury. This family home boasts wide verandas, polished timber floors, and a lush, subtropical garden with a pool. An entertainer\'s dream in a sought-after suburb.',
    tag: { text: 'Open House', type: 'open-house' },
    tourAvailable: false,
    button: { text: 'Directions', icon: 'route' }
  },
   {
    id: 4,
    title: 'Riverside Architectural Masterpiece',
    location: 'Perth, WA',
    price: '$3.2M',
    details: '5 bd • 4 ba • 550 sqm',
    imageUrl: 'https://picsum.photos/800/600?random=24',
    description: 'An architectural statement on the banks of the Swan River. This magnificent home features cutting-edge design, an infinity pool, private jetty, and breathtaking water views from every room. The epitome of modern luxury in Perth.',
    tag: { text: 'Premium', type: 'premium' },
    tourAvailable: true,
    button: { text: 'Virtual tour', icon: 'eye' }
  },
];

interface FeaturedListingsProps {
  onPropertyClick: (property: Property) => void;
  savedProperties: Set<number>;
  onToggleSave: (id: number) => void;
}

const FeaturedListings: React.FC<FeaturedListingsProps> = ({ onPropertyClick, savedProperties, onToggleSave }) => {
  return (
    <section className="max-w-7xl sm:px-6 mt-10 mx-auto mb-8 px-4">
      <div className="relative sm:mt-12 overflow-hidden shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.3),0px_12px_24px_-12px_rgba(0,0,0,0.5)] bg-black/80 border-white/10 border rounded-3xl backdrop-blur">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>
        </div>
        <div className="relative sm:p-8 pt-6 pr-6 pb-6 pl-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl text-neutral-100 font-geist tracking-tighter font-medium">Featured Listings</h2>
            <a href="#" className="inline-flex items-center gap-2 text-sm text-neutral-200 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 border border-white/10">
              <span className="font-geist">View all</span>
              <ArrowUpRightIcon className="w-4 h-4 stroke-[1.5]" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 h-[80vh] max-h-[900px] min-h-[600px]">
            <div className="lg:col-span-2 lg:row-span-2">
              <PropertyCard property={featuredProperties[0]} onButtonClick={onPropertyClick} savedProperties={savedProperties} onToggleSave={onToggleSave} />
            </div>
            <div className="lg:col-span-1 lg:row-span-1">
              <PropertyCard property={featuredProperties[1]} onButtonClick={onPropertyClick} savedProperties={savedProperties} onToggleSave={onToggleSave} />
            </div>
            <div className="lg:col-span-1 lg:row-span-1">
              <PropertyCard property={featuredProperties[2]} onButtonClick={onPropertyClick} savedProperties={savedProperties} onToggleSave={onToggleSave} />
            </div>
            <div className="md:col-span-2 lg:col-span-2 lg:row-span-1">
              <PropertyCard property={featuredProperties[3]} onButtonClick={onPropertyClick} savedProperties={savedProperties} onToggleSave={onToggleSave} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
