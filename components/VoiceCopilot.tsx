import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { type Property, type SearchParams, generateMockResults } from '../types';
import { 
    MapPinIcon, Building2Icon, BedIcon, DollarSignIcon, XIcon,
    SparklesIcon, SearchIcon, BathIcon, RulerIcon, KeyIcon,
    WavesIcon, PawPrintIcon, CarIcon, TreesIcon, GymIcon, MicIcon,
    UserIcon, BalconyIcon, SnowflakeIcon, FireplaceIcon, LaundryIcon,
    BriefcaseIcon, EvStationIcon, FenceIcon, ShieldCheckIcon, SofaIcon,
    SunIcon, ThermometerIcon, UtensilsIcon, WarehouseIcon, WineIcon,
    ArrowUpDownIcon, AccessibilityIcon, LayersIcon, UsersIcon, BookOpenIcon,
    MountainIcon, HotTubIcon, StarIcon, TagIcon, GavelIcon
} from './IconComponents';

interface VoiceCopilotProps {
  onResults: (results: Property[], params: SearchParams) => void;
}

type SearchStatus = "demo" | "idle" | "listening" | "processing" | "confirming" | "done";
type PermanentTag = 'new' | 'premium' | 'open-house' | 'auction';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const initialSearchParams: SearchParams = {
    location: undefined,
    locationRadiusKm: undefined,
    propertyType: undefined,
    listingType: undefined,
    priceMin: undefined,
    priceMax: undefined,
    bedroomsMin: undefined,
    bathroomsMin: undefined,
    sizeMetersMin: undefined,
    sizeMetersMax: undefined,
    style: undefined,
    styleImage: undefined,
    amenities: [],
    tags: [],
};

interface DemoParam {
    keyword: string;
    paramKey: keyof SearchParams | 'amenities' | 'tags';
    value: any;
}
interface DemoSearch {
  phrase: string;
  params: DemoParam[];
}

const demoSearches: DemoSearch[] = [
    {
        phrase: "Show me a luxury chalet in Queenstown with a mountain view, hot tub and at least 4 bedrooms under $4M that's a new listing.",
        params: [
            { keyword: 'luxury', paramKey: 'tags', value: 'premium' },
            { keyword: 'chalet', paramKey: 'style', value: 'Chalet' },
            { keyword: 'Queenstown', paramKey: 'location', value: 'Queenstown' },
            { keyword: 'mountain view', paramKey: 'amenities', value: 'Mountain View' },
            { keyword: 'hot tub', paramKey: 'amenities', value: 'Hot Tub' },
            { keyword: '4 bedrooms', paramKey: 'bedroomsMin', value: 4 },
            { keyword: '$4M', paramKey: 'priceMax', value: 4000000 },
            { keyword: 'new listing', paramKey: 'tags', value: 'new' },
        ]
    },
    {
        phrase: "I'm looking for a pet-friendly Victorian townhouse for rent in Melbourne, that's earthquake strengthened and has an open house.",
        params: [
            { keyword: 'pet-friendly', paramKey: 'amenities', value: 'Pets Allowed' },
            { keyword: 'Victorian', paramKey: 'style', value: 'Victorian' },
            { keyword: 'townhouse', paramKey: 'propertyType', value: 'Townhouse' },
            { keyword: 'for rent', paramKey: 'listingType', value: 'For Rent' },
            { keyword: 'Melbourne', paramKey: 'location', value: 'Melbourne' },
            { keyword: 'earthquake strengthened', paramKey: 'amenities', value: 'Earthquake Strengthened' },
            { keyword: 'open house', paramKey: 'tags', value: 'open-house' },
        ]
    },
    {
        phrase: "Find a premium new build apartment in Sydney with a sea view, a gym, and good school district, between $2M and $3.5M.",
        params: [
            { keyword: 'premium', paramKey: 'tags', value: 'premium' },
            { keyword: 'new build', paramKey: 'amenities', value: 'New Build' },
            { keyword: 'apartment', paramKey: 'propertyType', value: 'Apartment' },
            { keyword: 'Sydney', paramKey: 'location', value: 'Sydney' },
            { keyword: 'sea view', paramKey: 'amenities', value: 'Sea View' },
            { keyword: 'gym', paramKey: 'amenities', value: 'Gym' },
            { keyword: 'good school district', paramKey: 'amenities', value: 'Good School District' },
            { keyword: '$2M', paramKey: 'priceMin', value: 2000000 },
            { keyword: '$3.5M', paramKey: 'priceMax', value: 3500000 },
        ]
    },
    {
        phrase: "Find me modern commercial real estate in Christchurch for lease, over 300 sqm, with outdoor entertaining.",
        params: [
            { keyword: 'modern', paramKey: 'style', value: 'Modern' },
            { keyword: 'commercial real estate', paramKey: 'propertyType', value: 'Commercial' },
            { keyword: 'Christchurch', paramKey: 'location', value: 'Christchurch' },
            { keyword: 'for lease', paramKey: 'listingType', value: 'For Lease' },
            { keyword: '300 sqm', paramKey: 'sizeMetersMin', value: 300 },
            { keyword: 'outdoor entertaining', paramKey: 'amenities', value: 'Outdoor Entertaining' },
        ]
    }
];

const formatValue = (key: keyof Omit<SearchParams, 'amenities' | 'styleImage' | 'tags'>, value: any): string => {
    if (value === undefined || value === null) return '';
    const numValue = Number(value);
    switch (key) {
        case 'priceMin':
            if (numValue >= 1000000) return `$${(numValue / 1000000).toFixed(1).replace(/\.0$/, '')}M+`;
            return `$${(numValue / 1000).toFixed(0)}k+`;
        case 'priceMax':
            if (numValue >= 1000000) return `Up to $${(numValue / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
            return `Up to $${(numValue / 1000).toFixed(0)}k`;
        case 'bedroomsMin': return `${value}+ beds`;
        case 'bathroomsMin': return `${value}+ baths`;
        case 'sizeMetersMin': return `${value.toLocaleString()}+ sqm`;
        case 'sizeMetersMax': return `Up to ${value.toLocaleString()} sqm`;
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
    { key: 'sizeMetersMin', label: 'Min Size', icon: <RulerIcon className="w-5 h-5" /> },
    { key: 'sizeMetersMax', label: 'Max Size', icon: <RulerIcon className="w-5 h-5" /> },
    { key: 'style', label: 'Style', icon: <LayersIcon className="w-5 h-5" />, colSpan: 'sm:col-span-2' },
];

const AMENITY_CONFIG = [
  { key: 'Pool', label: 'Pool', icon: <WavesIcon className="w-4 h-4" /> },
  { key: 'Pets Allowed', label: 'Pet-Friendly', icon: <PawPrintIcon className="w-4 h-4" /> },
  { key: 'Garage', label: 'Garage', icon: <CarIcon className="w-4 h-4" /> },
  { key: 'Garden', label: 'Garden', icon: <TreesIcon className="w-4 h-4" /> },
  { key: 'Gym', label: 'Gym', icon: <GymIcon className="w-4 h-4" /> },
  { key: 'Balcony', label: 'Balcony', icon: <BalconyIcon className="w-4 h-4" /> },
  { key: 'Waterfront', label: 'Waterfront', icon: <WavesIcon className="w-4 h-4" /> },
  { key: 'Sea View', label: 'Sea View', icon: <WavesIcon className="w-4 h-4" /> },
  { key: 'Mountain View', label: 'Mountain View', icon: <MountainIcon className="w-4 h-4" /> },
  { key: 'City View', label: 'City View', icon: <Building2Icon className="w-4 h-4" /> },
  { key: 'Hot Tub', label: 'Hot Tub', icon: <HotTubIcon className="w-4 h-4" /> },
  { key: 'Fireplace', label: 'Fireplace', icon: <FireplaceIcon className="w-4 h-4" /> },
  { key: 'Laundry', label: 'In-unit Laundry', icon: <LaundryIcon className="w-4 h-4" /> },
  { key: 'Furnished', label: 'Furnished', icon: <SofaIcon className="w-4 h-4" /> },
  { key: 'Dishwasher', label: 'Dishwasher', icon: <UtensilsIcon className="w-4 h-4" /> },
  { key: 'Hardwood Floors', label: 'Hardwood Floors', icon: <LayersIcon className="w-4 h-4" /> },
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
  { key: 'Good School District', label: 'Good School District', icon: <BookOpenIcon className="w-4 h-4" /> },
  { key: 'Outdoor Entertaining', label: 'Outdoor Entertaining', icon: <UsersIcon className="w-4 h-4" /> },
  { key: 'New Build', label: 'New Build', icon: <SparklesIcon className="w-4 h-4" /> },
  { key: 'Earthquake Strengthened', label: 'Earthquake Strengthened', icon: <ShieldCheckIcon className="w-4 h-4" /> },
];

const PERMANENT_TAG_CONFIG: { key: PermanentTag, label: string, icon: React.ReactNode, activeColor: string }[] = [
    { key: 'new', label: 'New', icon: <TagIcon className="w-4 h-4" />, activeColor: 'cyan' },
    { key: 'premium', label: 'Premium', icon: <StarIcon className="w-4 h-4" />, activeColor: 'indigo' },
    { key: 'open-house', label: 'Open House', icon: <UsersIcon className="w-4 h-4" />, activeColor: 'sky' },
    { key: 'auction', label: 'Auction', icon: <GavelIcon className="w-4 h-4" />, activeColor: 'amber' },
];

const highlightTranscript = (transcript: string, highlights: string[]) => {
    if (!highlights.length || !transcript) return <>{transcript}</>;
    const escapedHighlights = highlights.map(h => h.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    if (escapedHighlights.length === 0) return <>{transcript}</>;
    const regex = new RegExp(`(${escapedHighlights.join('|')})`, 'gi');
    const parts = transcript.split(regex);
    
    return (
      <>
        {parts.map((part, i) =>
          highlights.some(h => h.toLowerCase() === part.toLowerCase()) ? (
            <span key={i} className="animate-glow-text text-white">{part}</span>
          ) : ( part )
        )}
      </>
    );
};

const VoiceCopilot: React.FC<VoiceCopilotProps> = ({ onResults }) => {
  const [status, setStatus] = useState<SearchStatus>('demo');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isClient, setIsClient] = useState(false);

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFinalTranscript = useRef('');
  
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    
    const currentPhrase = demoSearches[exampleIndex].phrase;
    if (subIndex < currentPhrase.length) {
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
    const currentPhrase = demoSearches[exampleIndex].phrase;
    const newAnimatedText = currentPhrase.substring(0, subIndex);
    setAnimatedText(newAnimatedText);
    if (isDeleting || subIndex === 0) return;

    const currentDemo = demoSearches[exampleIndex];
    const updatedParams: Partial<SearchParams> = {};
    const newlyRecognizedKeywords: string[] = [];
    const newAmenities: string[] = [];
    const newTags: PermanentTag[] = [];

    currentDemo.params.forEach(param => {
      if (newAnimatedText.toLowerCase().includes(param.keyword.toLowerCase())) {
          const { paramKey, value } = param;
          if (paramKey === 'amenities') {
            if (!searchParams.amenities?.includes(value)) newAmenities.push(value);
          } else if (paramKey === 'tags') {
            if (!searchParams.tags?.includes(value)) newTags.push(value);
          } else {
            if ((searchParams as any)[paramKey] !== value) (updatedParams as any)[paramKey] = value;
          }
          if (newAnimatedText.toLowerCase().endsWith(param.keyword.toLowerCase().trim())) {
            newlyRecognizedKeywords.push(paramKey === 'amenities' || paramKey === 'tags' ? value : paramKey);
          }
      }
    });
    
    if (newAmenities.length > 0) updatedParams.amenities = [...(searchParams.amenities || []), ...newAmenities];
    if (newTags.length > 0) updatedParams.tags = [...(searchParams.tags || []), ...newTags];
    if (Object.keys(updatedParams).length > 0) setSearchParams(prev => ({ ...prev, ...updatedParams }));
    if (newlyRecognizedKeywords.length > 0) addGlowingParams(newlyRecognizedKeywords);
  }, [subIndex, isDeleting, exampleIndex, isDemoMode]);

  const switchToRealSearch = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setSearchParams(initialSearchParams);
      setAnimatedText('');
      setGlowingParams(new Set());
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('idle');
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent onend handler
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    switchToRealSearch();
    setTranscript('');
    lastFinalTranscript.current = '';
    setHighlightedText([]);
    // Reset params but keep permanent tags that were toggled
    setSearchParams(prev => ({ ...initialSearchParams, tags: prev.tags }));
    setGlowingParams(new Set());
  };
  
  const handleStartListening = () => {
    if (isDemoMode) {
      switchToRealSearch();
    } else if (status === 'done' || status === 'idle' || status === 'confirming') {
      setSearchParams(prev => ({ ...initialSearchParams, tags: prev.tags }));
      setGlowingParams(new Set());
    }
    if (!SpeechRecognition) { console.error("Speech Recognition not supported."); return; }
    if (recognitionRef.current) return;
    
    setTranscript('');
    lastFinalTranscript.current = '';
    setHighlightedText([]);
    setStatus('listening');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-AU';
    
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

  const handleStopListening = () => { if (recognitionRef.current) recognitionRef.current.stop(); };

  const processTranscript = async (text: string) => {
    if (text.trim().toLowerCase().match(/^(search|let's go|lets go|find|ok|find my house|find my haus)$/)) { handleSearch(); return; }
    if (text.trim().length < 3) return;
    setStatus('processing');
    try {
        const amenitiesList = AMENITY_CONFIG.map(a => a.key).join("', '");
        const paramSchema = (type: Type, description: string) => ({ type: Type.OBJECT, properties: { value: { type, description }, sourceText: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The exact words from the user's query." } } });
        const arrayParamSchema = (description: string) => ({ type: Type.OBJECT, properties: { value: { type: Type.ARRAY, items: { type: Type.STRING }, description }, sourceText: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The exact words from the user's query." } } });
        const responseSchema = {
            type: Type.OBJECT, properties: {
                location: paramSchema(Type.STRING, "City, state, or neighborhood."),
                locationRadiusKm: paramSchema(Type.NUMBER, "Search radius in kilometers from the specified location."),
                propertyType: paramSchema(Type.STRING, "Type of property. Standardize variations. E.g., 'home'/'villa' -> 'House'; 'studio' -> 'Apartment'; 'condo' -> 'Condo'; 'townhome' -> 'Townhouse'."),
                listingType: paramSchema(Type.STRING, "Transaction type. Infer 'For Sale' from words like 'buy', 'purchase', 'sell'. Infer 'For Rent' from 'rent'. Infer 'For Lease' from 'lease'."),
                priceMin: paramSchema(Type.NUMBER, "Minimum price."),
                priceMax: paramSchema(Type.NUMBER, "Maximum price."),
                bedroomsMin: paramSchema(Type.NUMBER, "Min bedrooms."),
                bathroomsMin: paramSchema(Type.NUMBER, "Min bathrooms."),
                sizeMetersMin: paramSchema(Type.NUMBER, "Min size in square meters."),
                sizeMetersMax: paramSchema(Type.NUMBER, "Max size in square meters."),
                style: paramSchema(Type.STRING, "Architectural style of the property, e.g., 'Modern', 'Victorian', 'Minimalist'."),
                amenities: arrayParamSchema(`Amenities from: '${amenitiesList}'.`),
                tags: arrayParamSchema(`Property tags from: 'new', 'premium', 'open-house', 'auction'. Infer from phrases like 'newly listed', 'luxury property', 'open for inspection'.`)
            }
        };
        const systemInstruction = `You are an intelligent assistant for a real estate website called HAUS. Your task is to extract search parameters from the user's spoken query based on the provided JSON schema.
- For 'listingType', accurately infer 'For Sale', 'For Rent', or 'For Lease' from colloquial terms.
- For 'propertyType', normalize various terms into the standard categories.
- Extract numerical values for prices, bedrooms, bathrooms, and square meters.
- Identify any amenities or architectural styles mentioned by the user.
- Identify property tags like 'New', 'Premium', or 'Open House' from descriptive phrases.
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
                      if (newAmenities.length > 0) { updatedParamsPartial.amenities = [...Array.from(existingAmenities), ...newAmenities]; newGlowing.push(...newAmenities); }
                    } else if (key === 'tags') {
                      const existingTags = new Set(searchParams.tags || []);
                      const newTags = (param.value as string[]).filter(t => PERMANENT_TAG_CONFIG.some(tc => tc.key === t) && !existingTags.has(t as any));
                      if (newTags.length > 0) { updatedParamsPartial.tags = [...Array.from(existingTags), ...newTags] as any; newGlowing.push(...newTags); }
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
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... function remains the same
  };
  
  const handleSearch = () => {
    setStatus('done');
    if (recognitionRef.current) recognitionRef.current.stop();
    const mockResults = generateMockResults(searchParams);
    setTimeout(() => onResults(mockResults, searchParams), 800);
  }
  
  const handleToggleTag = (tagKey: PermanentTag) => {
    switchToRealSearch();
    setSearchParams(prev => {
        const currentTags = new Set(prev.tags || []);
        if (currentTags.has(tagKey)) {
            currentTags.delete(tagKey);
        } else {
            currentTags.add(tagKey);
        }
        return { ...prev, tags: Array.from(currentTags) };
    });
    setGlowingParams(prev => {
      const newSet = new Set(prev);
      newSet.add(tagKey);
      return newSet;
    })
  };

  useEffect(() => { return () => { if (recognitionRef.current) recognitionRef.current.stop(); }; }, []);

  const displayedTranscript = isDemoMode ? animatedText : transcript;
  const keywordsForHighlight = isDemoMode ? demoSearches[exampleIndex].params.map(p => p.keyword) : highlightedText;

  const getButtonContent = () => {
    switch(status) {
        case 'listening':
        case 'processing':
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5 overflow-hidden opacity-40">
                        {[...Array(48)].map((_, i) => (
                            <div
                                key={i}
                                className="w-0.5 rounded-full bg-white/80 animate-pulse"
                                style={
                                    isClient
                                        ? {
                                            height: `${10 + Math.random() * 60}%`,
                                            animationDelay: `${i * 0.05}s`,
                                        }
                                        : { height: '20%' }
                                }
                            />
                        ))}
                    </div>
                    <span className="relative z-10">{status === 'processing' && "Updating..."}</span>
                    {status === 'listening' && (
                        <button
                            onClick={handleCancel}
                            className="absolute right-4 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                            aria-label="Cancel search"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            );
        case 'confirming':
            return (
                <>
                    <SearchIcon className="w-5 h-5 stroke-[1.5]" />
                    <span>Find My HAUS</span>
                </>
            );
        case 'done':
            return <span>Finding properties...</span>
        default: // demo, idle
            return (
                <>
                    <MicIcon className="w-5 h-5" />
                    <span>Try HAUS Finder</span>
                </>
            );
    }
  };

  const getButtonAction = () => {
      switch(status) {
          case 'listening':
              return handleStopListening;
          case 'confirming':
              return handleSearch;
          default:
              return handleStartListening;
      }
  };

  const getMainButtonClassName = () => {
      let baseClasses = "flex-[4] inline-flex items-center justify-center gap-3 rounded-2xl px-8 h-14 text-lg font-medium tracking-tight text-white border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 font-geist relative overflow-hidden";
      switch(status) {
          case 'confirming':
              return `${baseClasses} bg-green-600 hover:bg-green-700 border-green-500/50 focus-visible:outline-green-500 animate-glow-green`;
          case 'listening':
          case 'processing':
              return `${baseClasses} bg-red-600/80 border-red-500/50 cursor-pointer`;
          case 'done':
              return `${baseClasses} bg-neutral-700 border-transparent`;
          default: // demo, idle
              return `${baseClasses} bg-blue-600 hover:bg-blue-700 border-transparent focus-visible:outline-blue-500`;
      }
  };


  return (
    <div className="relative w-full h-full flex flex-col items-center bg-neutral-950/50 overflow-hidden font-geist p-4 sm:p-8">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
      <div className="w-full max-w-6xl text-center flex flex-col h-full">
        <div className="flex-shrink-0">
          <p className="mt-1 h-24 text-lg text-neutral-300 leading-relaxed transition-opacity duration-300 p-2 flex items-center justify-center" aria-live="polite">
            <span className="block max-w-2xl">
              { status === 'listening' && transcript.length === 0 && !isDemoMode && <span className="text-neutral-500">Listening...</span>}
              {highlightTranscript(displayedTranscript, keywordsForHighlight)}
              {(isDemoMode || (status === 'listening' && transcript.length === 0)) && <span className="animate-blink text-neutral-600">|</span>}
            </span>
          </p>
        </div>
        
        <div className="flex-grow my-4 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {PARAMETER_CONFIG.map(param => {
                    const key = param.key as keyof SearchParams;
                    if (key === 'style') { /* Style card JSX remains the same */ }
                    let displayValue: string | React.ReactNode = '-'; let hasValue = false; let isGlowing = glowingParams.has(key);
                    if (key === 'location') {
                        const locationValue = searchParams.location; const radiusValue = searchParams.locationRadiusKm; hasValue = !!locationValue;
                        if (locationValue) { displayValue = locationValue; if (radiusValue) { displayValue += ` (within ${radiusValue} km)`; } }
                        isGlowing = glowingParams.has('location') || glowingParams.has('locationRadiusKm');
                    } else { const value = searchParams[key]; hasValue = value !== undefined && value !== null && value !== ''; if(hasValue) { displayValue = formatValue(key as any, value); } }
                    return (
                        <div key={param.key} className={` ${param.colSpan || 'sm:col-span-1'} p-4 rounded-xl border transition-all duration-300 ${hasValue ? 'bg-white/5 border-white/10' : 'bg-white/[0.03] border-transparent'} ${glowingParams.has(key) ? 'animate-glow' : ''} `}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${hasValue ? 'bg-blue-500/10 text-blue-300' : 'bg-white/5 text-neutral-400'}`}>{param.icon}</div>
                                <div className="flex-grow self-center overflow-hidden">
                                    <h3 className="text-sm font-medium text-neutral-400 text-left">{param.label}</h3>
                                    <p className="text-base font-semibold text-neutral-100 text-left min-h-[24px] cursor-pointer truncate">{displayValue}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {searchParams.amenities && searchParams.amenities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3 px-1 text-left">Amenities</h4>
                  <div className="flex flex-wrap gap-3">
                      {(searchParams.amenities || []).map(amenityKey => {
                          const amenity = AMENITY_CONFIG.find(a => a.key === amenityKey); if (!amenity) return null;
                          const isGlowing = glowingParams.has(amenity.key);
                          return (
                              <div key={amenity.key} className={` animate-scale-up p-3 rounded-xl border transition-all duration-300 flex items-center gap-2 bg-white/5 border-white/10 ${isGlowing ? 'animate-glow' : ''} `}>
                                  <div className="flex-shrink-0 p-1.5 rounded-full bg-blue-500/10 text-blue-300">{amenity.icon}</div>
                                  <p className="text-xs font-medium truncate text-neutral-100">{amenity.label}</p>
                              </div>
                          );
                      })}
                  </div>
              </div>
            )}
        </div>

        <div className="flex-shrink-0 mt-auto pt-4 pb-2 w-full">
            <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
                {PERMANENT_TAG_CONFIG.slice(0, 2).map(tag => {
                    const isActive = searchParams.tags?.includes(tag.key);
                    const colors = {
                        cyan: 'bg-cyan-600/80 border-cyan-500 text-white',
                        indigo: 'bg-indigo-600/80 border-indigo-500 text-white',
                        sky: 'bg-sky-600/80 border-sky-500 text-white',
                        amber: 'bg-amber-600/80 border-amber-500 text-white',
                    }
                    return (
                        <button key={tag.key} onClick={() => handleToggleTag(tag.key)} className={`flex-1 flex items-center justify-center gap-2 rounded-xl h-14 text-sm font-medium tracking-tight border transition-all ${isActive ? colors[tag.activeColor] : 'bg-transparent border-white/10 text-neutral-300 hover:bg-white/5'} ${glowingParams.has(tag.key) ? 'animate-glow' : ''}`}>
                            {tag.icon} <span>{tag.label}</span>
                        </button>
                    )
                })}
                <button
                    onClick={getButtonAction()}
                    disabled={status === 'done' || status === 'processing'}
                    className={getMainButtonClassName()}
                >
                    {getButtonContent()}
                </button>
                {PERMANENT_TAG_CONFIG.slice(2, 4).map(tag => {
                     const isActive = searchParams.tags?.includes(tag.key);
                     const colors = {
                        cyan: 'bg-cyan-600/80 border-cyan-500 text-white',
                        indigo: 'bg-indigo-600/80 border-indigo-500 text-white',
                        sky: 'bg-sky-600/80 border-sky-500 text-white',
                        amber: 'bg-amber-600/80 border-amber-500 text-white',
                    }
                    return (
                        <button key={tag.key} onClick={() => handleToggleTag(tag.key)} className={`flex-1 flex items-center justify-center gap-2 rounded-xl h-14 text-sm font-medium tracking-tight border transition-all ${isActive ? colors[tag.activeColor] : 'bg-transparent border-white/10 text-neutral-300 hover:bg-white/5'} ${glowingParams.has(tag.key) ? 'animate-glow' : ''}`}>
                            {tag.icon} <span>{tag.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCopilot;