export interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  details: string;
  imageUrl: string;
  description: string;
  tag?: {
    text: string;
    type: 'new' | 'premium' | 'open-house' | 'auction';
  };
  tourAvailable: boolean;
  button: {
    text: string;
    icon: 'eye' | 'route';
  };
}

export interface SearchParams {
  location?: string;
  locationRadiusKm?: number;
  propertyType?: string;
  listingType?: 'For Sale' | 'For Rent' | 'For Lease';
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  sizeMetersMin?: number;
  sizeMetersMax?: number;
  style?: string;
  styleImage?: string;
  amenities?: string[];
  tags?: ('new' | 'premium' | 'open-house' | 'auction')[];
}


export const generateMockResults = (params: SearchParams): Property[] => {
    const results: Property[] = [];
    const count = 3 + Math.floor(Math.random() * 2); 

    const defaultLocations = ['Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Perth, WA', 'Auckland', 'Queenstown', 'Wellington'];
    const defaultTypes = ['Condo', 'House', 'Loft', 'Townhouse', 'Apartment'];
    
    const allTags: { text: string; type: 'new' | 'premium' | 'open-house' | 'auction' }[] = [
      { text: 'New', type: 'new' },
      { text: 'Premium', type: 'premium' },
      { text: 'Open House', type: 'open-house' },
      { text: 'Auction', type: 'auction' }
    ];

    for (let i = 0; i < count; i++) {
        const id = Date.now() + i;
        const location = params.location || defaultLocations[i % defaultLocations.length];
        const propertyType = params.propertyType || defaultTypes[i % defaultTypes.length];
        const bedrooms = params.bedroomsMin || (2 + i);
        const bathrooms = params.bathroomsMin || (bedrooms > 1 ? bedrooms - 1 : 1);
        
        let sqm: number;
        // Default size in square meters: 110sqm base + 35sqm per bedroom.
        const defaultSqm = 110 + bedrooms * 35;

        if (params.sizeMetersMin !== undefined || params.sizeMetersMax !== undefined) {
            const minSqm = params.sizeMetersMin ?? 0;
            const maxSqm = params.sizeMetersMax ?? (minSqm + 150); // Provide a reasonable range if max is missing
            sqm = Math.round(minSqm + Math.random() * (maxSqm - minSqm));
        } else {
            // Add some variance to default
            sqm = defaultSqm + Math.floor(Math.random() * 40 - 20); 
        }
        
        const amenities = params.amenities || [];
        let title = `${params.style || 'Spacious'} ${propertyType}`;
        if (amenities.length > 0) {
           title = `${params.style || 'Modern'} ${propertyType} with ${amenities[0]}`;
        }
        
        let priceDisplay: string;

        if (params.listingType === 'For Rent' || params.listingType === 'For Lease') {
            const minRentDefault = 2000;
            const maxRentDefault = 15000;
            let rent = (params.priceMin || minRentDefault) + Math.random() * ( (params.priceMax || maxRentDefault) - (params.priceMin || minRentDefault) );
            rent = Math.round(rent / 100) * 100;
            if (params.priceMax && rent > params.priceMax) rent = params.priceMax;
            if (params.priceMin && rent < params.priceMin) rent = params.priceMin;
            priceDisplay = `$${rent.toLocaleString()}/mo`;
        } else {
            const minPriceDefault = 800000;
            const maxPriceDefault = 5000000;
            // FIX: Corrected a typo where 'minRentDefault' was used instead of 'minPriceDefault'.
            let price = (params.priceMin || minPriceDefault) + Math.random() * ( (params.priceMax || maxPriceDefault) - (params.priceMin || minPriceDefault) );
            if (params.priceMin && !params.priceMax) price = Math.max(price, params.priceMin);
            if (params.priceMax && !params.priceMin) price = Math.min(price, params.priceMax);
            price = Math.round(price / 100000) * 100000;
            if (params.priceMax && price > params.priceMax) price = params.priceMax;
            if (params.priceMin && price < params.priceMin) price = params.priceMin;
            priceDisplay = `$${Number((price / 1_000_000).toFixed(2))}M`;
        }

        let tag;
        if (params.tags && params.tags.length > 0) {
            const selectedTagType = params.tags[i % params.tags.length];
            tag = allTags.find(t => t.type === selectedTagType);
        } else if (Math.random() > 0.6) {
            tag = allTags[Math.floor(Math.random() * allTags.length)];
        }
        
        results.push({
            id: id,
            title: title,
            location: location,
            price: priceDisplay,
            details: `${bedrooms} bd • ${bathrooms} ba • ${sqm} sqm`,
            imageUrl: `https://picsum.photos/800/600?random=${id}`,
            description: `Discover this stunning ${propertyType.toLowerCase()} in the heart of ${location}. Featuring ${bedrooms} bedrooms and ${bathrooms} bathrooms, this property offers an expansive ${sqm} sqm of modern living space. The open-concept layout is perfect for entertaining, with high ceilings and large windows that flood the space with natural light. The gourmet kitchen is equipped with top-of-the-line appliances and custom cabinetry. The master suite is a private oasis, complete with a spa-like ensuite bathroom and a walk-in closet. Enjoy the beautiful city views from your private balcony. This is a unique opportunity to own a piece of paradise.`,
            tag: tag,
            tourAvailable: Math.random() > 0.5,
            button: { text: 'Virtual tour', icon: 'eye' }
        });
    }
    return results;
}