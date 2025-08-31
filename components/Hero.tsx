import React, { useState, useEffect, useRef } from 'react';
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
        setMinSquareFootage(lastVoiceSearchParams.square