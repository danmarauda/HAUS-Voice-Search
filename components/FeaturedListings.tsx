
import React from 'react';
import PropertyCard from './PropertyCard';
import { type Property } from '../types';
import { ArrowUpRightIcon } from './IconComponents';

const featuredProperties: Property[] = [
  {
    id: 1,
    title: 'Oceanview Modern Villa',
    location: 'Malibu, CA',
    price: '$2.8M',
    details: '4 bd • 3 ba • 2,800 sqft',
    imageUrl: 'https://picsum.photos/800/600?random=11',
    description: 'Breathtaking ocean views from every room. This modern villa in Malibu features floor-to-ceiling windows, an infinity pool, and direct beach access. An entertainer\'s dream with a gourmet kitchen and expansive outdoor living spaces.',
    tag: { text: 'New', type: 'new' },
    tourAvailable: true,
    button: { text: 'Virtual tour', icon: 'eye' }
  },
  {
    id: 2,
    title: 'Skyline Penthouse Suite',
    location: 'Manhattan, NY',
    price: '$5.2M',
    details: '5 bd • 4 ba • 4,500 sqft',
    imageUrl: 'https://picsum.photos/800/600?random=12',
    description: 'A pinnacle of luxury living in Manhattan. This penthouse offers 360-degree views of the city skyline, a private rooftop terrace, and bespoke interiors designed by a world-renowned architect. Includes access to five-star building amenities.',
    tag: { text: 'Premium', type: 'premium' },
    tourAvailable: true,
    button: { text: 'Virtual tour', icon: 'eye' }
  },
  {
    id: 3,
    title: 'Contemporary Townhouse',
    location: 'Austin, TX',
    price: '$1.15M',
    details: '3 bd • 3 ba • 1,900 sqft',
    imageUrl: 'https://picsum.photos/800/600?random=13',
    description: 'Sleek and stylish townhouse in the vibrant heart of Austin. This home features an open-concept living area, a modern kitchen with high-end appliances, and a private backyard patio perfect for relaxing or entertaining.',
    tag: { text: 'Open House', type: 'open-house' },
    tourAvailable: false,
    button: { text: 'Directions', icon: 'route' }
  },
   {
    id: 4,
    title: 'Secluded Forest Retreat',
    location: 'Asheville, NC',
    price: '$1.9M',
    details: '5 bd • 4 ba • 3,500 sqft',
    imageUrl: 'https://picsum.photos/800/600?random=14',
    description: 'Escape to this private retreat nestled in the Blue Ridge Mountains. Surrounded by nature, this home offers tranquility and luxury with its custom woodwork, stone fireplaces, and wrap-around porch overlooking a serene forest.',
    tag: { text: 'Premium', type: 'premium' },
    tourAvailable: true,
    button: { text: 'Virtual tour', icon: 'eye' }
  },
];

interface FeaturedListingsProps {
  onPropertyClick: (property: Property) => void;
}

const FeaturedListings: React.FC<FeaturedListingsProps> = ({ onPropertyClick }) => {
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
              <PropertyCard property={featuredProperties[0]} onButtonClick={onPropertyClick} />
            </div>
            <div className="lg:col-span-1 lg:row-span-1">
              <PropertyCard property={featuredProperties[1]} onButtonClick={onPropertyClick} />
            </div>
            <div className="lg:col-span-1 lg:row-span-1">
              <PropertyCard property={featuredProperties[2]} onButtonClick={onPropertyClick} />
            </div>
            <div className="md:col-span-2 lg:col-span-2 lg:row-span-1">
              <PropertyCard property={featuredProperties[3]} onButtonClick={onPropertyClick} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;