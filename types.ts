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
    type: 'new' | 'premium' | 'open-house';
  };
  tourAvailable: boolean;
  button: {
    text: string;
    icon: 'eye' | 'route';
  };
}

export interface SearchParams {
  location?: string;
  propertyType?: string;
  listingType?: 'For Sale' | 'For Rent';
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  squareFootageMin?: number;
  squareFootageMax?: number;
  amenities?: string[];
}


export const generateMockResults = (params: SearchParams): Property[] => {
    const results: Property[] = [];
    const count = 3 + Math.floor(Math.random() * 2); 

    const defaultLocations = ['Miami, FL', 'Denver, CO', 'San Francisco, CA', 'Seattle, WA'];
    const defaultTypes = ['Condo', 'House', 'Loft', 'Townhouse', 'Apartment'];

    for (let i = 0; i < count; i++) {
        const id = Date.now() + i;
        const location = params.location || defaultLocations[i % defaultLocations.length];
        const propertyType = params.propertyType || defaultTypes[i % defaultTypes.length];
        const bedrooms = params.bedroomsMin || (2 + i);
        const bathrooms = params.bathroomsMin || (bedrooms > 1 ? bedrooms - 1 : 1);
        
        let sqft: number;
        const defaultSqft = 1200 + bedrooms * 400;

        if (params.squareFootageMin !== undefined || params.squareFootageMax !== undefined) {
            const minSqft = params.squareFootageMin !== undefined ? params.squareFootageMin * 10.7639 : 0;
            const maxSqft = params.squareFootageMax !== undefined ? params.squareFootageMax * 10.7639 : minSqft + 1000;
            sqft = Math.round(minSqft + Math.random() * (maxSqft - minSqft));
        } else {
            sqft = defaultSqft;
        }
        
        const amenities = params.amenities || [];
        let title = `Spacious ${propertyType}`;
        if (amenities.length > 0) {
           title = `Modern ${propertyType} with ${amenities[0]}`;
        }
        
        let priceDisplay: string;

        if (params.listingType === 'For Rent') {
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
            let price = (params.priceMin || minPriceDefault) + Math.random() * ( (params.priceMax || maxPriceDefault) - (params.priceMin || minPriceDefault) );
            if (params.priceMin && !params.priceMax) price = Math.max(price, params.priceMin);
            if (params.priceMax && !params.priceMin) price = Math.min(price, params.priceMax);
            price = Math.round(price / 100000) * 100000;
            if (params.priceMax && price > params.priceMax) price = params.priceMax;
            if (params.priceMin && price < params.priceMin) price = params.priceMin;
            priceDisplay = `$${(price / 1_000_000).toFixed(2)}M`;
        }

        results.push({
            id: id,
            title: title,
            location: location,
            price: priceDisplay,
            details: `${bedrooms} bd • ${bathrooms} ba • ${sqft} sqft`,
            imageUrl: `https://picsum.photos/800/600?random=${id}`,
            description: `Discover this stunning ${propertyType.toLowerCase()} in the heart of ${location}. Featuring ${bedrooms} bedrooms and ${bathrooms} bathrooms, this property offers an expansive ${sqft} sqft of modern living space. The open-concept layout is perfect for entertaining, with high ceilings and large windows that flood the space with natural light. The gourmet kitchen is equipped with top-of-the-line appliances and custom cabinetry. The master suite is a private oasis, complete with a spa-like ensuite bathroom and a walk-in closet. Enjoy the beautiful city views from your private balcony. This is a unique opportunity to own a piece of paradise.`,
            tag: i === 0 ? { text: 'New', type: 'new' } : undefined,
            tourAvailable: Math.random() > 0.5,
            button: { text: 'Virtual tour', icon: 'eye' }
        });
    }
    return results;
}