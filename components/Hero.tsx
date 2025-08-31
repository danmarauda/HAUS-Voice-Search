import React, { useState, useEffect } from 'react';
import VoiceCopilot from './VoiceCopilot';
import PropertyCard from './PropertyCard';
import { type Property, type SearchParams, generateMockResults } from '../types';
import AIVoice from './AIVoice';
import { 
  MapPinIcon, 
  HomeIcon, 
  CalendarIcon, 
  ShieldCheckIcon,
  SearchIcon,
  WavesIcon,
  TreesIcon,
  CarIcon,
  GymIcon,
  FireplaceIcon,
  BalconyIcon,
  Building2Icon,
  LaundryIcon,
  SnowflakeIcon,
  PawPrintIcon,
  UserIcon,
  SlidersHorizontalIcon,
  BedIcon,
  BathIcon,
  RulerIcon,
  ZapIcon,
  BriefcaseIcon,
  ClapperboardIcon,
  WineIcon,
  AccessibilityIcon,
  FenceIcon,
  SofaIcon,
  WarehouseIcon,
  SunIcon,
  ThermometerIcon,
  LayersIcon,
  UtensilsIcon,
  ArrowUpDownIcon,
  EvStationIcon,
} from './IconComponents';
import CustomDropdown from './CustomDropdown';

interface HeroProps {
  onPropertyClick: (property: Property) => void;
}

const searchExamples = [
    "Find modern homes in Melbourne with a pool.",
    "Apartments in Sydney with a city view for rent under $5,000 a month.",
    "A house in Brisbane with a garden and a garage.",
    "Pet-friendly townhouses in Perth near the waterfront.",
    "Three bedroom house for sale in Adelaide.",
    "Luxury penthouse with a gym and doorman in Gold Coast.",
    "A quiet two-bedroom apartment with a balcony in Canberra.",
    "Find me a property with AC and parking."
];

const Hero: React.FC<HeroProps> = ({ onPropertyClick }) => {
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  
  // State for advanced filters
  const [listingType, setListingType] = useState<'For Sale' | 'For Rent'>('For Sale');
  const [propertyType, setPropertyType] = useState('any');
  const [minPrice, setMinPrice] = useState('any');
  const [maxPrice, setMaxPrice] = useState('any');
  const [bedrooms, setBedrooms] = useState('any');
  const [bathrooms, setBathrooms] = useState('any');
  const [minSquareFootage, setMinSquareFootage] = useState('any');
  const [maxSquareFootage, setMaxSquareFootage] = useState('any');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const [lastVoiceSearchParams, setLastVoiceSearchParams] = useState<SearchParams | null>(null);
  const [glowingFilters, setGlowingFilters] = useState<string[]>([]);
  
  // State for typing animation
  const [exampleIndex, setExampleIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [animatedText, setAnimatedText] = useState('');

  useEffect(() => {
    if (isDeleting) {
      if (subIndex > 0) {
        const timer = setTimeout(() => setSubIndex(subIndex - 1), 10);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setExampleIndex((prev) => (prev + 1) % searchExamples.length);
        return;
      }
    }

    if (subIndex < searchExamples[exampleIndex].length) {
      const timer = setTimeout(() => setSubIndex(subIndex + 1), 15);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setIsDeleting(true), 250);
    return () => clearTimeout(timer);

  }, [subIndex, isDeleting, exampleIndex]);
  
  useEffect(() => {
      setAnimatedText(searchExamples[exampleIndex].substring(0, subIndex));
  }, [subIndex, exampleIndex]);


  const handleShowResults = (results: Property[], params: SearchParams) => {
    setSearchResults(results);
    setLastVoiceSearchParams(params);
    setIsVoiceSearchActive(false);
  };

  const handleReturnFromVoiceSearch = () => {
    setSearchResults([]);
    setIsVoiceSearchActive(false);
    
    if (lastVoiceSearchParams) {
        setListingType(lastVoiceSearchParams.listingType ?? 'For Sale');
        setPropertyType(lastVoiceSearchParams.propertyType ?? 'any');
        setMinPrice(lastVoiceSearchParams.priceMin?.toString() ?? 'any');
        setMaxPrice(lastVoiceSearchParams.priceMax?.toString() ?? 'any');
        setBedrooms(lastVoiceSearchParams.bedroomsMin?.toString() ?? 'any');
        setBathrooms(lastVoiceSearchParams.bathroomsMin?.toString() ?? 'any');
        setMinSquareFootage(lastVoiceSearchParams.squareFootageMin?.toString() ?? 'any');
        setMaxSquareFootage(lastVoiceSearchParams.squareFootageMax?.toString() ?? 'any');
        
        const amenitiesFromAI = lastVoiceSearchParams.amenities ?? [];
        setSelectedAmenities(amenitiesFromAI);

        const newGlowingFilters: string[] = [];
        if (lastVoiceSearchParams.listingType) newGlowingFilters.push('listingType');
        if (lastVoiceSearchParams.propertyType) newGlowingFilters.push('propertyType');
        if (lastVoiceSearchParams.bedroomsMin !== undefined && lastVoiceSearchParams.bedroomsMin !== null) newGlowingFilters.push('bedrooms');
        if (lastVoiceSearchParams.bathroomsMin !== undefined && lastVoiceSearchParams.bathroomsMin !== null) newGlowingFilters.push('bathrooms');
        if (lastVoiceSearchParams.priceMin !== undefined && lastVoiceSearchParams.priceMin !== null) newGlowingFilters.push('minPrice');
        if (lastVoiceSearchParams.priceMax !== undefined && lastVoiceSearchParams.priceMax !== null) newGlowingFilters.push('maxPrice');
        if (lastVoiceSearchParams.squareFootageMin !== undefined && lastVoiceSearchParams.squareFootageMin !== null) newGlowingFilters.push('minSquareFootage');
        if (lastVoiceSearchParams.squareFootageMax !== undefined && lastVoiceSearchParams.squareFootageMax !== null) newGlowingFilters.push('maxSquareFootage');
        newGlowingFilters.push(...amenitiesFromAI);

        setGlowingFilters(newGlowingFilters);

        setTimeout(() => {
            setGlowingFilters([]);
        }, 3000);

        setLastVoiceSearchParams(null);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };
  
  const handleListingTypeChange = (type: 'For Sale' | 'For Rent') => {
      setListingType(type);
      setMinPrice('any');
      setMaxPrice('any');
  }

  const handleAdvancedSearch = () => {
    const params: SearchParams = {
        listingType,
        propertyType: propertyType !== 'any' ? propertyType : undefined,
        priceMin: minPrice !== 'any' ? Number(minPrice) : undefined,
        priceMax: maxPrice !== 'any' ? Number(maxPrice) : undefined,
        bedroomsMin: bedrooms !== 'any' ? Number(bedrooms) : undefined,
        bathroomsMin: bathrooms !== 'any' ? Number(bathrooms) : undefined,
        squareFootageMin: minSquareFootage !== 'any' ? Number(minSquareFootage) : undefined,
        squareFootageMax: maxSquareFootage !== 'any' ? Number(maxSquareFootage) : undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    };
    const results = generateMockResults(params);
    setSearchResults(results);
  };

  const salePriceOptions = [
    { value: '500000', label: '$500k' }, { value: '750000', label: '$750k' }, { value: '1000000', label: '$1M' },
    { value: '1500000', label: '$1.5M' }, { value: '2000000', label: '$2M' }, { value: '3000000', label: '$3M' },
    { value: '5000000', label: '$5M' },
  ];
  
  const rentPriceOptions = [
      { value: '2000', label: '$2k/mo' }, { value: '3000', label: '$3k/mo' }, { value: '4000', label: '$4k/mo' },
      { value: '5000', label: '$5k/mo' }, { value: '7500', label: '$7.5k/mo' }, { value: '10000', label: '$10k+/mo' },
  ];

  const priceOptions = listingType === 'For Sale' ? salePriceOptions : rentPriceOptions;

  const bedroomOptions = [
      { value: '1', label: '1+' }, { value: '2', label: '2+' }, { value: '3', label: '3+' },
      { value: '4', label: '4+' }, { value: '5', label: '5+' },
  ];
  
  const bathroomOptions = [
      { value: '1', label: '1+' }, { value: '2', label: '2+' }, { value: '3', label: '3+' },
      { value: '4', label: '4+' },
  ];
  
  const propertyTypeOptions = [
      { value: 'House', label: 'House' }, { value: 'Apartment', label: 'Apartment' }, { value: 'Condo', label: 'Condo' },
      { value: 'Townhouse', label: 'Townhouse' }, { value: 'Loft', label: 'Loft' },
  ];

  const sqmOptions = [
    { value: '50', label: '50 m²' }, { value: '75', label: '75 m²' }, { value: '100', label: '100 m²' },
    { value: '150', label: '150 m²' }, { value: '200', label: '200 m²' }, { value: '300', label: '300 m²' },
    { value: '400', label: '400 m²' },
  ];

  const amenities = [
      // Outdoor & Views
      { name: 'Pool', icon: <WavesIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Garden', icon: <TreesIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Balcony', icon: <BalconyIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Patio/Deck', icon: <SunIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Waterfront', icon: <WavesIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'City View', icon: <Building2Icon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Fenced Yard', icon: <FenceIcon className="w-4 h-4 stroke-[1.5]" /> },

      // Parking & Storage
      { name: 'Garage', icon: <CarIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Parking', icon: <CarIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Storage', icon: <WarehouseIcon className="w-4 h-4 stroke-[1.5]" /> },
      
      // Indoor Features
      { name: 'Gym', icon: <GymIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Fireplace', icon: <FireplaceIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Hardwood Floors', icon: <LayersIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Laundry', icon: <LaundryIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Home Office', icon: <BriefcaseIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Media Room', icon: <ClapperboardIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Wine Cellar', icon: <WineIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Furnished', icon: <SofaIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Dishwasher', icon: <UtensilsIcon className="w-4 h-4 stroke-[1.5]" /> },
      
      // Climate Control
      { name: 'AC', icon: <SnowflakeIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Heating', icon: <ThermometerIcon className="w-4 h-4 stroke-[1.5]" /> },
      
      // Building / Community
      { name: 'Security', icon: <ShieldCheckIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Doorman', icon: <UserIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Elevator', icon: <ArrowUpDownIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'EV Charging', icon: <EvStationIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Smart Home', icon: <ZapIcon className="w-4 h-4 stroke-[1.5]" /> },
      
      // Accessibility & Pets
      { name: 'Pets Allowed', icon: <PawPrintIcon className="w-4 h-4 stroke-[1.5]" /> },
      { name: 'Wheelchair Accessible', icon: <AccessibilityIcon className="w-4 h-4 stroke-[1.5]" /> },
  ];

  const renderContent = () => {
    if (isVoiceSearchActive) {
      return <VoiceCopilot onResults={handleShowResults} onClose={() => setIsVoiceSearchActive(false)} />;
    }
    
    if (searchResults.length > 0) {
      return (
        <div className="relative w-full h-full flex flex-col justify-end p-6 sm:p-8">
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl text-neutral-100 font-geist tracking-tighter font-medium">Your Search Results</h2>
                        <p className="text-sm text-neutral-400 font-geist">Found {searchResults.length} properties matching your criteria.</p>
                    </div>
                    <button 
                        onClick={handleReturnFromVoiceSearch}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium tracking-tight text-neutral-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                        <SearchIcon className="w-4 h-4 stroke-[1.5]" />
                        <span className="font-geist">New Search</span>
                    </button>
                </div>
                <div className="flex space-x-5 overflow-x-auto pb-4 -mx-8 px-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {searchResults.map(property => (
                        <div key={property.id} className="flex-shrink-0 w-[320px] h-[380px]">
                           <PropertyCard property={property} onButtonClick={onPropertyClick} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      );
    }

    return (
      <>
        <div className="w-full h-full bg-neutral-950">
          <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,250,0))]"></div>
          <div className="absolute -inset-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>
        <div className="absolute inset-0 sm:p-8 p-6 flex flex-col h-full">
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="max-w-3xl text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-6xl text-white drop-shadow-md font-geist tracking-tighter font-medium">Search with your voice.</h2>
              <p className="mt-2 sm:mt-3 text-white/90 text-base sm:text-lg leading-relaxed drop-shadow-sm font-geist">
                Just tell us what you're looking for.
              </p>
              <div className="h-5" />
              <p className="text-white/90 text-base sm:text-lg leading-relaxed drop-shadow-sm font-geist min-h-[28px]">
                Try "{animatedText}"
                <span className="animate-blink border-l-2 border-white/90 ml-1" aria-hidden="true"></span>
              </p>
            </div>
            <div className="mt-8">
               <AIVoice 
                  submitted={false} 
                  statusText="Click to speak" 
                  onClick={() => setIsVoiceSearchActive(true)} 
               />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-left backdrop-blur-sm bg-black/10 -mx-6 sm:-mx-8 px-6 sm:px-8 pb-6 rounded-b-xl">
             <h3 className="text-sm font-medium text-neutral-300 font-geist mb-3">Or use advanced filters</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                         <label className="text-xs font-geist text-neutral-400 block mb-1.5 flex items-center gap-1.5"><SlidersHorizontalIcon className="w-3.5 h-3.5"/> Listing Type</label>
                         <div className={`flex items-center gap-1 bg-neutral-800 border border-white/10 rounded-lg p-1 text-sm ${glowingFilters.includes('listingType') ? 'animate-glow' : ''}`}>
                            <button onClick={() => handleListingTypeChange('For Sale')} className={`flex-1 px-3 py-1.5 text-center rounded-md font-geist transition-colors ${listingType === 'For Sale' ? 'bg-neutral-600 text-white shadow-sm shadow-black/20' : 'text-neutral-300 hover:text-white'}`}>For Sale</button>
                            <button onClick={() => handleListingTypeChange('For Rent')} className={`flex-1 px-3 py-1.5 text-center rounded-md font-geist transition-colors ${listingType === 'For Rent' ? 'bg-neutral-600 text-white shadow-sm shadow-black/20' : 'text-neutral-300 hover:text-white'}`}>For Rent</button>
                         </div>
                    </div>
                     <div>
                        <label className="text-xs font-geist text-neutral-400 block mb-1.5 flex items-center gap-1.5"><Building2Icon className="w-3.5 h-3.5"/> Property Type</label>
                        <div className={glowingFilters.includes('propertyType') ? 'animate-glow rounded-md' : ''}>
                            <CustomDropdown ariaLabel="Property Type" placeholder="All Types" options={propertyTypeOptions} value={propertyType} onChange={setPropertyType} />
                        </div>
                    </div>
                     <div>
                        <label className="text-xs font-geist text-neutral-400 block mb-1.5 flex items-center gap-1.5"><BedIcon className="w-3.5 h-3.5"/> Bedrooms</label>
                        <div className={glowingFilters.includes('bedrooms') ? 'animate-glow rounded-md' : ''}>
                            <CustomDropdown ariaLabel="Number of Bedrooms" placeholder="Any" options={bedroomOptions} value={bedrooms} onChange={setBedrooms} />
                        </div>
                    </div>
                     <div>
                        <label className="text-xs font-geist text-neutral-400 block mb-1.5 flex items-center gap-1.5"><BathIcon className="w-3.5 h-3.5"/> Bathrooms</label>
                        <div className={glowingFilters.includes('bathrooms') ? 'animate-glow rounded-md' : ''}>
                           <CustomDropdown ariaLabel="Number of Bathrooms" placeholder="Any" options={bathroomOptions} value={bathrooms} onChange={setBathrooms}/>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-geist text-neutral-400 block mb-1.5">Min Price</label>
                        <div className={glowingFilters.includes('minPrice') ? 'animate-glow rounded-md' : ''}>
                            <CustomDropdown ariaLabel="Minimum Price" placeholder="Any" options={priceOptions.filter(p => maxPrice === 'any' || Number(p.value) < Number(maxPrice))} value={minPrice} onChange={setMinPrice} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-geist text-neutral-400 block mb-1.5">Max Price</label>
                        <div className={glowingFilters.includes('maxPrice') ? 'animate-glow rounded-md' : ''}>
                           <CustomDropdown ariaLabel="Maximum Price" placeholder="Any" options={priceOptions.filter(p => minPrice === 'any' || Number(p.value) > Number(minPrice))} value={maxPrice} onChange={setMaxPrice} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-geist text-neutral-400 block mb-1.5">Min Size (m²)</label>
                        <div className={glowingFilters.includes('minSquareFootage') ? 'animate-glow rounded-md' : ''}>
                            <CustomDropdown ariaLabel="Minimum Square Metres" placeholder="Any" options={sqmOptions.filter(o => maxSquareFootage === 'any' || Number(o.value) < Number(maxSquareFootage))} value={minSquareFootage} onChange={setMinSquareFootage} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-geist text-neutral-400 block mb-1.5">Max Size (m²)</label>
                        <div className={glowingFilters.includes('maxSquareFootage') ? 'animate-glow rounded-md' : ''}>
                           <CustomDropdown ariaLabel="Maximum Square Metres" placeholder="Any" options={sqmOptions.filter(o => minSquareFootage === 'any' || Number(o.value) > Number(minSquareFootage))} value={maxSquareFootage} onChange={setMaxSquareFootage} />
                        </div>
                    </div>
                    <div className="lg:col-start-4">
                        <label className="text-xs font-geist text-neutral-400 block mb-1.5">&nbsp;</label>
                         <button onClick={handleAdvancedSearch} className="w-full h-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium tracking-tight text-white bg-blue-600 hover:bg-blue-700 border border-transparent transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                            <SearchIcon className="w-4 h-4 stroke-[1.5]" />
                            <span className="font-geist">Find Properties</span>
                        </button>
                    </div>
                </div>
                <div>
                     <label className="text-xs font-geist text-neutral-400 block mb-1.5 mt-4">Amenities</label>
                     <div className="flex flex-wrap items-center gap-2">
                        {amenities.map(amenity => (
                            <button key={amenity.name} onClick={() => toggleAmenity(amenity.name)}
                                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium tracking-tight border transition-colors font-geist ${selectedAmenities.includes(amenity.name) ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'} ${glowingFilters.includes(amenity.name) ? 'animate-glow' : ''}`}>
                                {amenity.icon}
                                {amenity.name}
                            </button>
                        ))}
                     </div>
                </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <section className="max-w-7xl sm:px-6 mt-8 mx-auto mb-8 px-4">
        <div className="relative sm:mt-12 overflow-hidden shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.3),0px_12px_24px_-12px_rgba(0,0,0,0.5)] bg-black/80 border-white/10 border rounded-3xl backdrop-blur">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>
          </div>

          <div className="relative sm:p-8 pt-6 pr-6 pb-6 pl-6">
            <div className="flex gap-8 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-300 bg-blue-500/10 border border-white/10 rounded-lg px-3 py-1.5">
                  <MapPinIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span className="font-geist">Nationwide • Verified Listings</span>
                </div>
                <h1 className="text-[9.5vw] sm:text-[8vw] md:text-[6.5vw] lg:text-[6vw] leading-[0.95] font-medium text-neutral-100 tracking-tighter font-geist mt-4">
                  Find your next home with confidence
                </h1>
                <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-relaxed text-neutral-400 font-geist">
                  Curated properties across top neighborhoods. Powerful search, virtual tours, and expert support from offer to close.
                </p>
              </div>

              <div className="hidden lg:block w-[22rem] pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <HomeIcon className="w-4 h-4 stroke-[1.5]" />
                    <span className="font-geist">Single-family • Apartments • Penthouses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <CalendarIcon className="w-4 h-4 stroke-[1.5]" />
                    <span className="font-geist">Same‑day showings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <ShieldCheckIcon className="w-4 h-4 stroke-[1.5]" />
                    <span className="font-geist">Verified sellers &amp; documents</span>
                  </div>
                  <div className="border-white/10 border-t pt-4">
                    <p className="leading-relaxed text-sm text-neutral-400 font-geist">
                      HAUS combines market expertise with a seamless experience. Save favorites, compare homes, and close with confidence.
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-2xl mt-6">
                      <div className="rounded-lg bg-neutral-800 border border-white/10 p-3">
                        <div className="text-xl font-semibold tracking-tight text-neutral-100 font-geist">12K+</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 font-geist">Active Listings</p>
                      </div>
                      <div className="rounded-lg bg-neutral-800 border border-white/10 p-3">
                        <div className="text-xl font-semibold tracking-tight text-neutral-100 font-geist">4.9</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 font-geist">Client Rating</p>
                      </div>
                      <div className="rounded-lg bg-neutral-800 border border-white/10 p-3">
                        <div className="text-xl font-semibold tracking-tight text-neutral-100 font-geist">350+</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 font-geist">Virtual Tours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 relative rounded-xl overflow-hidden border border-white/10 h-[52vh] sm:h-[60vh]">
              {renderContent()}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;