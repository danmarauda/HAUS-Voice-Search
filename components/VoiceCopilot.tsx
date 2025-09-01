
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { type Property, type SearchParams, generateMockResults } from '../types';
import AIVoice from './AIVoice';
import { 
    MapPinIcon, Building2Icon, BedIcon, DollarSignIcon, 
    SparklesIcon, SearchIcon, BathIcon, RulerIcon, KeyIcon,
    WavesIcon, PawPrintIcon, CarIcon, TreesIcon, GymIcon,
    UserIcon, BalconyIcon, SnowflakeIcon, FireplaceIcon, LaundryIcon,
    BriefcaseIcon, EvStationIcon, FenceIcon, ShieldCheckIcon, SofaIcon,
    SunIcon, ThermometerIcon, UtensilsIcon, WarehouseIcon, WineIcon,
    ArrowUpDownIcon, AccessibilityIcon, LayersIcon
} from './IconComponents';

interface VoiceCopilotProps {
  onResults: (results: Property[], params: SearchParams) => void;
}

type SearchStatus = "demo" | "idle" | "listening" | "processing" | "confirming" | "done";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const initialSearchParams: SearchParams = {
    location: undefined,
    propertyType: undefined,
    listingType: undefined,
    priceMin: undefined,
    priceMax: undefined,
    bedroomsMin: undefined,
    bathroomsMin: undefined,
    squareFootageMin: undefined,
    squareFootageMax: undefined,
    amenities: [],
};

const searchExamples = [
    "Find modern homes in Melbourne with a pool.",
    "Apartments in Sydney with a city view for rent under $5,000 a month.",
    "A house in Brisbane with a garden and a garage.",
    "Pet-friendly townhouses in Perth near the waterfront.",
    "Three bedroom house for sale in Adelaide.",
    "Luxury penthouse with a gym and doorman in Gold Coast.",
    "A quiet two-bedroom apartment with a balcony in Canberra.",
    "Find me a property with AC, parking and a home office.",
    "A furnished apartment with an elevator and security system."
];

interface DemoParam {
    keyword: string;
    paramKey: keyof SearchParams | 'amenities';
    value: any;
}
interface DemoSearch {
  phrase: string;
  params: DemoParam[];
}

const demoSearches: DemoSearch[] = [
    {
        phrase: "Find modern homes in Melbourne with a pool.",
        params: [
            { keyword: 'modern', paramKey: 'amenities', value: 'Modern' },
            { keyword: 'homes', paramKey: 'propertyType', value: 'House' },
            { keyword: 'Melbourne', paramKey: 'location', value: 'Melbourne' },
            { keyword: 'pool', paramKey: 'amenities', value: 'Pool' },
        ]
    },
    {
        phrase: "Apartments in Sydney with a city view for rent under $5,000 a month.",
        params: [
            { keyword: 'Apartments', paramKey: 'propertyType', value: 'Apartment' },
            { keyword: 'Sydney', paramKey: 'location', value: 'Sydney' },
            { keyword: 'city view', paramKey: 'amenities', value: 'City View' },
            { keyword: 'for rent', paramKey: 'listingType', value: 'For Rent' },
            { keyword: '$5,000', paramKey: 'priceMax', value: 5000 },
        ]
    },
    {
        phrase: "A house in Brisbane with a garden and a garage.",
        params: [
            { keyword: 'house', paramKey: 'propertyType', value: 'House' },
            { keyword: 'Brisbane', paramKey: 'location', value: 'Brisbane' },
            { keyword: 'garden', paramKey: 'amenities', value: 'Garden' },
            { keyword: 'garage', paramKey: 'amenities', value: 'Garage' },
        ]
    },
    {
        phrase: "Pet-friendly townhouses in Perth near the waterfront.",
        params: [
            { keyword: 'Pet-friendly', paramKey: 'amenities', value: 'Pets Allowed' },
            { keyword: 'townhouses', paramKey: 'propertyType', value: 'Townhouse' },
            { keyword: 'Perth', paramKey: 'location', value: 'Perth' },
            { keyword: 'waterfront', paramKey: 'amenities', value: 'Waterfront' },
        ]
    },
     {
        phrase: "Three bedroom house for sale in Adelaide.",
        params: [
            { keyword: 'Three bedroom', paramKey: 'bedroomsMin', value: 3 },
            { keyword: 'house', paramKey: 'propertyType', value: 'House' },
            { keyword: 'for sale', paramKey: 'listingType', value: 'For Sale' },
            { keyword: 'Adelaide', paramKey: 'location', value: 'Adelaide' },
        ]
    },
    {
        phrase: "Luxury penthouse with a gym and doorman in Gold Coast.",
        params: [
            { keyword: 'penthouse', paramKey: 'propertyType', value: 'Loft' }, 
            { keyword: 'gym', paramKey: 'amenities', value: 'Gym' },
            { keyword: 'doorman', paramKey: 'amenities', value: 'Doorman' },
            { keyword: 'Gold Coast', paramKey: 'location', value: 'Gold Coast' },
        ]
    },
    {
        phrase: "A quiet two-bedroom apartment with a balcony in Canberra.",
        params: [
            { keyword: 'two-bedroom', paramKey: 'bedroomsMin', value: 2 },
            { keyword: 'apartment', paramKey: 'propertyType', value: 'Apartment' },
            { keyword: 'balcony', paramKey: 'amenities', value: 'Balcony' },
            { keyword: 'Canberra', paramKey: 'location', value: 'Canberra' },
        ]
    },
    {
        phrase: "Find me a property with AC, parking and a home office.",
        params: [
            { keyword: 'AC', paramKey: 'amenities', value: 'AC' },
            { keyword: 'parking', paramKey: 'amenities', value: 'Parking' },
            { keyword: 'home office', paramKey: 'amenities', value: 'Home Office' },
        ]
    },
    {
        phrase: "A furnished apartment with an elevator and security system.",
        params: [
            { keyword: 'furnished', paramKey: 'amenities', value: 'Furnished' },
            { keyword: 'apartment', paramKey: 'propertyType', value: 'Apartment' },
            { keyword: 'elevator', paramKey: 'amenities', value: 'Elevator' },
            { keyword: 'security system', paramKey: 'amenities', value: 'Security System' },
        ]
    }
];

const formatValue = (key: keyof Omit<SearchParams, 'amenities'>, value: any): string => {
    if (value === undefined || value === null) return '';
    switch (key) {
        case 'priceMin': return `$${(Number(value) / 1000).toFixed(0)}k+`;
        case 'priceMax': return `Up to $${(Number(value) / 1000).toFixed(0)}k`;
        case 'bedroomsMin': return `${value}+ beds`;
        case 'bathroomsMin': return `${value}+ baths`;
        case 'squareFootageMin': return `${value.toLocaleString()}+ sqft`;
        case 'squareFootageMax': return `Up to ${value.toLocaleString()} sqft`;
        default: return String(value);
    }
}

const PARAMETER_CONFIG = [
    { key: 'location', label: 'Location', icon: <MapPinIcon className="w-5 h-5" />, colSpan: 'sm:col-span-2' },
    { key: 'listingType', label: 'Type', icon: <KeyIcon className="w-5 h-5" /> },
    { key: 'propertyType', label: 'Property', icon: <Building2Icon className="w-5 h-5" /> },
    { key: 'priceMin', label: 'Min Price', icon: <DollarSignIcon className="w-5 h-5" /> },
    { key: 'priceMax', label: 'Max Price', icon: <DollarSignIcon className="w-5 h-5" /> },
    { key: 'bedroomsMin', label: 'Bedrooms', icon: <BedIcon className="w-5 h-5" /> },
    { key: 'bathroomsMin', label: 'Bathrooms', icon: <BathIcon className="w-5 h-5" /> },
    { key: 'squareFootageMin', label: 'Min Size', icon: <RulerIcon className="w-5 h-5" /> },
    { key: 'squareFootageMax', label: 'Max Size', icon: <RulerIcon className="w-5 h-5" /> },
];

const AMENITY_CONFIG = [
  { key: 'Pool', label: 'Pool', icon: <WavesIcon className="w-4 h-4" /> },
  { key: 'Pets Allowed', label: 'Pet-Friendly', icon: <PawPrintIcon className="w-4 h-4" /> },
  { key: 'Garage', label: 'Garage', icon: <CarIcon className="w-4 h-4" /> },
  { key: 'Garden', label: 'Garden', icon: <TreesIcon className="w-4 h-4" /> },
  { key: 'Gym', label: 'Gym', icon: <GymIcon className="w-4 h-4" /> },
  { key: 'Doorman', label: 'Doorman', icon: <UserIcon className="w-4 h-4" /> },
  { key: 'Balcony', label: 'Balcony', icon: <BalconyIcon className="w-4 h-4" /> },
  { key: 'Waterfront', label: 'Waterfront', icon: <WavesIcon className="w-4 h-4" /> },
  { key: 'AC', label: 'AC', icon: <SnowflakeIcon className="w-4 h-4" /> },
  { key: 'Parking', label: 'Parking', icon: <CarIcon className="w-4 h-4" /> },
  { key: 'Modern', label: 'Modern', icon: <SparklesIcon className="w-4 h-4" /> },
  { key: 'City View', label: 'City View', icon: <Building2Icon className="w-4 h-4" /> },
  { key: 'Fireplace', label: 'Fireplace', icon: <FireplaceIcon className="w-4 h-4" /> },
  { key: 'Laundry', label: 'In-unit Laundry', icon: <LaundryIcon className="w-4 h-4" /> },
  { key: 'Furnished', label: 'Furnished', icon: <SofaIcon className="w-4 h-4" /> },
  { key: 'Dishwasher', label: 'Dishwasher', icon: <UtensilsIcon className="w-4 h-4" /> },
  { key: 'Hardwood Floors', label: 'Hardwood Floors', icon: <LayersIcon className="w-4 h-4" /> },
  { key: 'Storage', label: 'Storage', icon: <WarehouseIcon className="w-4 h-4" /> },
  { key: 'Wheelchair Accessible', label: 'Accessible', icon: <AccessibilityIcon className="w-4 h-4" /> },
  { key: 'EV Charging', label: 'EV Charging', icon: <EvStationIcon className="w-4 h-4" /> },
  { key: 'Gated Community', label: 'Gated', icon: <FenceIcon className="w-4 h-4" /> },
  { key: 'Security System', label: 'Security', icon: <ShieldCheckIcon className="w-4 h-4" /> },
  { key: 'Solar Panels', label: 'Solar Panels', icon: <SunIcon className="w-4 h-4" /> },
  { key: 'Wine Cellar', label: 'Wine Cellar', icon: <WineIcon className="w-4 h-4" /> },
  { key: 'Home Office', label: 'Home Office', icon: <BriefcaseIcon className="w-4 h-4" /> },
  { key: 'High Ceilings', label: 'High Ceilings', icon: <ArrowUpDownIcon className="w-4 h-4" /> },
  { key: 'Central Heating', label: 'Heating', icon: <ThermometerIcon className="w-4 h-4" /> },
  { key: 'Elevator', label: 'Elevator', icon: <ArrowUpDownIcon className="w-4 h-4" /> },
  { key: 'Fenced Yard', label: 'Fenced Yard', icon: <FenceIcon className="w-4 h-4" /> },
];

const LISTING_TYPE_KEYWORDS: { [key: string]: 'For Sale' | 'For Rent' } = {
  buy: 'For Sale', purchase: 'For Sale', sell: 'For Sale', sale: 'For Sale',
  rent: 'For Rent', lease: 'For Rent',
};
const PROPERTY_TYPE_KEYWORDS: { [key: string]: string } = {
  house: 'House', home: 'House', villa: 'House',
  apartment: 'Apartment', studio: 'Apartment', unit: 'Apartment',
  condo: 'Condo', condominium: 'Condo',
  townhouse: 'Townhouse', townhome: 'Townhouse',
  loft: 'Loft', penthouse: 'Loft',
};
const AMENITY_KEYWORDS: { [key: string]: string } = {};
AMENITY_CONFIG.forEach(amenity => {
    AMENITY_KEYWORDS[amenity.key.toLowerCase()] = amenity.key;
    AMENITY_KEYWORDS[amenity.label.toLowerCase()] = amenity.key;
});
AMENITY_KEYWORDS['pet friendly'] = 'Pets Allowed';
AMENITY_KEYWORDS['air conditioning'] = 'AC';
AMENITY_KEYWORDS['ev charger'] = 'EV Charging';
AMENITY_KEYWORDS['in unit laundry'] = 'Laundry';
AMENITY_KEYWORDS['office'] = 'Home Office';


const highlightTranscript = (transcript: string, highlights: string[]) => {
    if (!highlights.length || !transcript) {
        return <>{transcript}</>;
    }
    const escapedHighlights = highlights.map(h => h.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    if (escapedHighlights.length === 0) return <>{transcript}</>;
    const regex = new RegExp(`(${escapedHighlights.join('|')})`, 'gi');
    const parts = transcript.split(regex);
    
    return (
        <>
            {parts.map((part, i) =>
                highlights.some(h => h.toLowerCase() === part.toLowerCase()) ? (
                    <span key={i} className="animate-glow-text text-white">{part}</span>
                ) : (
                    part
                )
            )}
        </>
    );
};

const VoiceCopilot: React.FC<VoiceCopilotProps> = ({ onResults }) => {
  const [status, setStatus] = useState<SearchStatus>('demo');
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Demo animation state
  const [exampleIndex, setExampleIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [animatedText, setAnimatedText] = useState('');
  
  // Real search state
  const [transcript, setTranscript] = useState('');
  const [searchParams, setSearchParams] = useState<SearchParams>(initialSearchParams);
  const [glowingParams, setGlowingParams] = useState<Set<string>>(new Set());
  const [highlightedText, setHighlightedText] = useState<string[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const lastFinalTranscript = useRef('');
  const lastSpottedTranscriptLength = useRef(0);

  const addGlowingParams = (paramKeys: string[]) => {
    setGlowingParams(prev => {
        const newSet = new Set(prev);
        paramKeys.forEach(key => newSet.add(key));
        return newSet;
    });
  };

  // Typing animation effect
  useEffect(() => {
    if (!isDemoMode) return;
    if (isDeleting) {
      if (subIndex > 0) {
        const timer = setTimeout(() => setSubIndex(subIndex - 1), 30);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setExampleIndex((prev) => (prev + 1) % demoSearches.length);
        return;
      }
    }

    if (subIndex < searchExamples[exampleIndex].length) {
      const timer = setTimeout(() => setSubIndex(subIndex + 1), 50);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setIsDeleting(true), 2500);
    return () => clearTimeout(timer);

  }, [subIndex, isDeleting, exampleIndex, isDemoMode]);

  // Demo parameter recognition effect
  useEffect(() => {
    if (!isDemoMode) return;

    if (isDeleting && subIndex === 1) {
      setSearchParams(initialSearchParams);
      setGlowingParams(new Set());
    }

    const newAnimatedText = searchExamples[exampleIndex].substring(0, subIndex);
    setAnimatedText(newAnimatedText);
    
    if (isDeleting || subIndex === 0) return;

    const currentDemo = demoSearches[exampleIndex];
    const updatedParams: Partial<SearchParams> = {};
    const newlyRecognizedKeywords: string[] = [];
    const newAmenities: string[] = [];

    currentDemo.params.forEach(param => {
      if (newAnimatedText.toLowerCase().includes(param.keyword.toLowerCase())) {
          const { paramKey, value } = param;
          if (paramKey === 'amenities') {
              if (!searchParams.amenities?.includes(value)) {
                  newAmenities.push(value);
              }
          } else {
              if ((searchParams as any)[paramKey] !== value) {
                  (updatedParams as any)[paramKey] = value;
              }
          }

          if (newAnimatedText.toLowerCase().endsWith(param.keyword.toLowerCase().trim())) {
            newlyRecognizedKeywords.push(paramKey === 'amenities' ? value : paramKey);
          }
      }
    });
    
    if (newAmenities.length > 0) {
        updatedParams.amenities = [...(searchParams.amenities || []), ...newAmenities];
    }

    if (Object.keys(updatedParams).length > 0) {
      setSearchParams(prev => ({ ...prev, ...updatedParams }));
    }
    if (newlyRecognizedKeywords.length > 0) {
        addGlowingParams(newlyRecognizedKeywords);
    }
  }, [subIndex, isDeleting, exampleIndex, isDemoMode]);

  const switchToRealSearch = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setSearchParams(initialSearchParams);
      setAnimatedText('');
      setGlowingParams(new Set());
    }
  };
  
  const runClientSideKeywordSpotting = (text: string) => {
    if (!text) return;
    const lowerText = text.toLowerCase();
    const updates: Partial<SearchParams> = {};
    const newGlows: string[] = [];

    for (const keyword in LISTING_TYPE_KEYWORDS) {
        if (lowerText.includes(keyword)) {
            updates.listingType = LISTING_TYPE_KEYWORDS[keyword];
            newGlows.push('listingType');
        }
    }
    for (const keyword in PROPERTY_TYPE_KEYWORDS) {
        if (lowerText.includes(keyword)) {
            updates.propertyType = PROPERTY_TYPE_KEYWORDS[keyword];
            newGlows.push('propertyType');
        }
    }
    const currentAmenities = searchParams.amenities || [];
    const foundAmenities = new Set<string>();
    for (const keyword in AMENITY_KEYWORDS) {
        if (lowerText.includes(keyword)) {
            const amenity = AMENITY_KEYWORDS[keyword];
            if (!currentAmenities.includes(amenity)) {
                foundAmenities.add(amenity);
            }
        }
    }
    if (foundAmenities.size > 0) {
        updates.amenities = [...currentAmenities, ...Array.from(foundAmenities)];
        newGlows.push(...Array.from(foundAmenities));
    }
    if (Object.keys(updates).length > 0) {
        setSearchParams(prev => ({ ...prev, ...updates }));
        addGlowingParams(newGlows);
    }
  };

  const handleStartListening = () => {
    if (isDemoMode) {
      switchToRealSearch();
    } else if (status === 'done') {
      setSearchParams(initialSearchParams);
      setGlowingParams(new Set());
    }

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported.");
      return;
    }
    if (recognitionRef.current) return;
    
    setTranscript('');
    lastFinalTranscript.current = '';
    lastSpottedTranscriptLength.current = 0;
    setHighlightedText([]);
    setStatus('listening');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      if(isDemoMode) switchToRealSearch();
      let final_transcript = '';
      let interim_transcript = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final_transcript += event.results[i][0].transcript;
        else interim_transcript += event.results[i][0].transcript;
      }
      const fullTranscript = final_transcript + interim_transcript;
      setTranscript(fullTranscript);

      const newTextForSpotting = fullTranscript.substring(lastSpottedTranscriptLength.current);
      runClientSideKeywordSpotting(newTextForSpotting);
      lastSpottedTranscriptLength.current = fullTranscript.length;

      if (final_transcript && final_transcript !== lastFinalTranscript.current) {
        const newChunk = final_transcript.substring(lastFinalTranscript.current.length);
        lastFinalTranscript.current = final_transcript;
        if (newChunk.trim()) processTranscript(newChunk.trim());
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (status === "listening") setStatus('confirming');
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleStopListening = () => {
      if (recognitionRef.current) recognitionRef.current.stop();
  };

  const processTranscript = async (text: string) => {
    if (text.trim().toLowerCase().match(/^(search|let's go|lets go|find|ok|find my house|find my haus)$/)) {
        handleSearch();
        return;
    }
    if (text.trim().length < 3) return;
    setStatus('processing');
    try {
        const amenitiesList = AMENITY_CONFIG.map(a => a.key).join("', '");
        const paramSchema = (type: Type, description: string) => ({ type: Type.OBJECT, properties: { value: { type, description }, sourceText: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The exact words from the user's query." } } });
        const arrayParamSchema = (description: string) => ({ type: Type.OBJECT, properties: { value: { type: Type.ARRAY, items: { type: Type.STRING }, description }, sourceText: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The exact words from the user's query." } } });
        const responseSchema = { type: Type.OBJECT, properties: { location: paramSchema(Type.STRING, "City, state, or neighborhood."), propertyType: paramSchema(Type.STRING, "Type of property. Standardize variations. E.g., 'home'/'villa' -> 'House'; 'studio' -> 'Apartment'; 'condo' -> 'Condo'; 'townhome' -> 'Townhouse'."), listingType: paramSchema(Type.STRING, "Transaction type. Infer 'For Sale' from words like 'buy', 'purchase', 'sell'. Infer 'For Rent' from 'rent' or 'lease'."), priceMin: paramSchema(Type.NUMBER, "Minimum price."), priceMax: paramSchema(Type.NUMBER, "Maximum price."), bedroomsMin: paramSchema(Type.NUMBER, "Min bedrooms."), bathroomsMin: paramSchema(Type.NUMBER, "Min bathrooms."), squareFootageMin: paramSchema(Type.NUMBER, "Min sqft."), squareFootageMax: paramSchema(Type.NUMBER, "Max sqft."), amenities: arrayParamSchema(`Amenities from: '${amenitiesList}'.`) } };
        
        const systemInstruction = `You are an intelligent assistant for a real estate website called HAUS. Your task is to extract search parameters from the user's spoken query based on the provided JSON schema.
- For 'listingType', accurately infer 'For Sale' or 'For Rent' from colloquial terms.
- For 'propertyType', normalize various terms into the standard categories.
- Extract numerical values for prices, bedrooms, bathrooms, and square footage.
- Identify any amenities mentioned by the user.
- Only return values for parameters that are explicitly mentioned or can be clearly inferred from the user's latest query. Do not guess or fill in missing information.`;
        const userContent = `Current search criteria: ${JSON.stringify(searchParams)}. New user query: "${text}".`;

        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: userContent, config: { systemInstruction, responseMimeType: "application/json", responseSchema: responseSchema } });
        const responseData = JSON.parse(response.text);
        const updatedParamsPartial: Partial<SearchParams> = {};
        const newGlowing: string[] = [];
        const newlyHighlighted: string[] = [];
        
        for (const key in responseData) {
            if (Object.prototype.hasOwnProperty.call(responseData, key) && key in initialSearchParams) {
                const param = responseData[key];
                if (param && param.value !== undefined && param.value !== null) {
                    if (key === 'amenities') {
                      const existingAmenities = new Set(searchParams.amenities || []);
                      const newAmenities = (param.value as string[]).filter(a => AMENITY_CONFIG.some(ac => ac.key === a) && !existingAmenities.has(a));
                      if (newAmenities.length > 0) {
                          updatedParamsPartial.amenities = [...Array.from(existingAmenities), ...newAmenities];
                          newGlowing.push(...newAmenities);
                      }
                    } else {
                      (updatedParamsPartial as any)[key] = param.value;
                      newGlowing.push(key);
                    }
                    if (param.sourceText && Array.isArray(param.sourceText)) newlyHighlighted.push(...param.sourceText.filter(s => s && s.trim().length > 0));
                }
            }
        }
        if (Object.keys(updatedParamsPartial).length > 0) {
            setSearchParams(prevParams => ({...prevParams, ...updatedParamsPartial}));
            addGlowingParams(newGlowing);
            setHighlightedText(prev => [...new Set([...prev, ...newlyHighlighted])]);
            setStatus('confirming');
        } else setStatus(recognitionRef.current ? 'listening' : 'idle');
    } catch(error) {
        console.error("Error processing transcript with AI:", error);
        setStatus(recognitionRef.current ? 'listening' : 'idle');
    }
  };
  
  const handleSearch = () => {
    setStatus('done');
    if (recognitionRef.current) recognitionRef.current.stop();
    const mockResults = generateMockResults(searchParams);
    setTimeout(() => onResults(mockResults, searchParams), 800);
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const statusMessages: Record<SearchStatus, string> = {
    demo: "Watch the demo or click the mic to start.",
    idle: "Click to speak",
    listening: "Listening...",
    processing: "Updating...",
    confirming: "Ready to search. Say 'Find my HAUS' or click the button.",
    done: "Finding properties...",
  };
  
  const displayedTranscript = isDemoMode ? animatedText : transcript;
  const keywordsForHighlight = isDemoMode ? demoSearches[exampleIndex].params.map(p => p.keyword) : highlightedText;
  const isConfirming = status === 'confirming';

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-neutral-950/50 overflow-hidden font-geist p-4 sm:p-8">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
      
      <div className="w-full max-w-6xl text-center flex flex-col h-full">
        <div className="flex-shrink-0">
          <AIVoice
            submitted={!isDemoMode && (status === 'listening' || status === 'processing')}
            onClick={isDemoMode || status === 'done' || status === 'idle' || status === 'confirming' ? handleStartListening : handleStopListening}
            statusText={statusMessages[status]}
          />
          <p className="mt-1 min-h-[56px] text-base text-neutral-400 leading-relaxed transition-opacity duration-300 p-2" aria-live="polite">
            {highlightTranscript(displayedTranscript, keywordsForHighlight)}
            {(isDemoMode || status === 'listening') && <span className="animate-blink text-neutral-600">|</span>}
          </p>
        </div>
        
        <div className="flex-grow my-4 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {PARAMETER_CONFIG.map(param => {
                    const key = param.key as keyof Omit<SearchParams, 'amenities'>;
                    const value = searchParams[key];
                    const hasValue = value !== undefined && value !== null;
                    const isGlowing = glowingParams.has(key);

                    return (
                        <div key={param.key} className={`
                            ${param.colSpan || 'sm:col-span-1'}
                            p-4 rounded-xl border transition-all duration-300
                            ${hasValue ? 'bg-white/5 border-white/10' : 'bg-white/[0.03] border-transparent'}
                            ${isGlowing ? 'animate-glow' : ''}
                        `}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${hasValue ? 'bg-blue-500/10 text-blue-300' : 'bg-white/5 text-neutral-400'}`}>
                                    {param.icon}
                                </div>
                                <div className="flex-grow self-center overflow-hidden">
                                    <h3 className="text-sm font-medium text-neutral-400 text-left">{param.label}</h3>
                                    <p className="text-base font-semibold text-neutral-100 text-left min-h-[24px] cursor-pointer truncate">
                                      {hasValue ? formatValue(key, value) : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {(searchParams.amenities && searchParams.amenities.length > 0) && (
              <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {(searchParams.amenities || []).map(amenityKey => {
                          const amenity = AMENITY_CONFIG.find(a => a.key === amenityKey);
                          if (!amenity) return null;

                          const isGlowing = glowingParams.has(amenity.key);

                          return (
                              <div key={amenity.key} className={`
                                  animate-scale-up p-3 rounded-xl border transition-all duration-300 flex items-center gap-2
                                  bg-white/5 border-white/10
                                  ${isGlowing ? 'animate-glow' : ''}
                              `}>
                                  <div className="flex-shrink-0 p-1.5 rounded-full bg-blue-500/10 text-blue-300">
                                      {amenity.icon}
                                  </div>
                                  <p className="text-xs font-medium truncate text-neutral-100">
                                      {amenity.label}
                                  </p>
                              </div>
                          );
                      })}
                  </div>
              </div>
            )}
        </div>

        <div className="flex-shrink-0 mt-auto pt-4 text-center">
          {!isDemoMode && status === 'confirming' && (
              <p className="text-sm text-neutral-400 mb-3 animate-fade-in" style={{ animationDuration: '500ms' }}>
                  If this looks right, say "Find my HAUS" or click the button.
              </p>
          )}
          <button 
            onClick={handleSearch} 
            disabled={isDemoMode || status === 'done'} 
            className={`
                w-full max-w-xs mx-auto inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-base font-medium tracking-tight text-white border transition-all 
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50
                ${isConfirming 
                    ? 'bg-green-600 hover:bg-green-700 border-green-500/50 focus-visible:outline-green-500 animate-glow-green' 
                    : 'bg-blue-600 hover:bg-blue-700 border-transparent focus-visible:outline-blue-500'
                }
            `}>
              <SearchIcon className="w-5 h-5 stroke-[1.5]" />
              <span className="font-geist">{isConfirming ? "Find My HAUS" : "Find Properties"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCopilot;
