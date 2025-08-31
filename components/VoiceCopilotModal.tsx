import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { type Property, type SearchParams, generateMockResults } from '../types';
import AIVoice from './AIVoice';
import { 
    XIcon, MapPinIcon, Building2Icon, BedIcon, DollarSignIcon, 
    SparklesIcon, SearchIcon, BathIcon,
    RulerIcon, KeyIcon
} from './IconComponents';

interface VoiceCopilotProps {
  onResults: (results: Property[], params: SearchParams) => void;
  onClose: () => void;
}

type SearchStatus = "idle" | "listening" | "processing" | "done";

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
    amenities: [],
};

const formatValue = (key: keyof SearchParams, value: any): string => {
    if (value === undefined || value === null) return '';
    switch (key) {
        case 'priceMin': return `$${(Number(value) / 1000).toFixed(0)}k+`;
        case 'priceMax': return `Up to $${(Number(value) / 1000).toFixed(0)}k`;
        case 'bedroomsMin': return `${value}+ beds`;
        case 'bathroomsMin': return `${value}+ baths`;
        case 'squareFootageMin': return `${value.toLocaleString()}+ sqft`;
        case 'amenities': return (value as string[]).map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
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
    { key: 'squareFootageMin', label: 'Size', icon: <RulerIcon className="w-5 h-5" /> },
    { key: 'amenities', label: 'Amenities', icon: <SparklesIcon className="w-5 h-5" />, colSpan: 'sm:col-span-2' },
];

const propertyTypeOptions = [
    { value: 'House', label: 'House' }, { value: 'Apartment', label: 'Apartment' }, { value: 'Condo', label: 'Condo' },
    { value: 'Townhouse', label: 'Townhouse' }, { value: 'Loft', label: 'Loft' },
];

const bedroomOptions = [
    { value: '1', label: '1+' }, { value: '2', label: '2+' }, { value: '3', label: '3+' },
    { value: '4', label: '4+' }, { value: '5', label: '5+' },
];

const bathroomOptions = [
    { value: '1', label: '1+' }, { value: '2', label: '2+' }, { value: '3', label: '3+' },
    { value: '4', label: '4+' },
];

const listingTypeOptions = [
    { value: 'For Sale', label: 'For Sale' }, { value: 'For Rent', label: 'For Rent' },
];

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


const VoiceCopilot: React.FC<VoiceCopilotProps> = ({ onResults, onClose }) => {
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [searchParams, setSearchParams] = useState<SearchParams>(initialSearchParams);
  const [glowingParams, setGlowingParams] = useState<string[]>([]);
  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  // FIX: Use ReturnType<typeof setTimeout> for browser compatibility instead of NodeJS.Timeout.
  const glowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFinalTranscript = useRef('');

  const handleParamChange = (key: keyof SearchParams, value: any) => {
      let finalValue: any = value;
      if (value === '' || value === 'any') {
          finalValue = undefined;
      } else if (['priceMin', 'priceMax', 'bedroomsMin', 'bathroomsMin', 'squareFootageMin'].includes(key)) {
          const num = parseInt(String(value).replace(/[^0-9]/g, ''), 10);
          finalValue = isNaN(num) ? undefined : num;
      }
      setSearchParams(prev => ({ ...prev, [key]: finalValue }));
  };

  const handleStartListening = () => {
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported.");
      return;
    }
     if (recognitionRef.current) {
        return;
    }
    setTranscript('');
    lastFinalTranscript.current = '';
    setHighlightedText([]);
    setStatus('listening');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let final_transcript = '';
      let interim_transcript = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(final_transcript + interim_transcript);

      if (final_transcript && final_transcript !== lastFinalTranscript.current) {
        const newChunk = final_transcript.substring(lastFinalTranscript.current.length);
        lastFinalTranscript.current = final_transcript;
        if (newChunk.trim()) {
          processTranscript(newChunk.trim());
        }
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (status === "listening") {
        setStatus('idle');
      }
    };
    
    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleStopListening = () => {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
      }
  };

  const handleToggleListening = () => {
      if (status === 'listening' || status === 'processing') {
          handleStopListening();
      } else if (status === 'idle') {
          handleStartListening();
      }
  };

  const processTranscript = async (text: string) => {
    if (text.trim().toLowerCase().match(/^(search|let's go|lets go|find)$/)) {
        handleSearch();
        return;
    }

    if (text.trim().length < 3) return;
    setStatus('processing');
    
    try {
        const amenitiesList = "'Pool', 'Garden', 'Balcony', 'Patio/Deck', 'Waterfront', 'City View', 'Fenced Yard', 'Garage', 'Parking', 'Storage', 'Gym', 'Fireplace', 'Hardwood Floors', 'Laundry', 'Home Office', 'Media Room', 'Wine Cellar', 'Furnished', 'Dishwasher', 'AC', 'Heating', 'Security', 'Doorman', 'Elevator', 'EV Charging', 'Smart Home', 'Pets Allowed', 'Wheelchair Accessible'";
        const paramSchema = (type: Type, description: string) => ({
            type: Type.OBJECT,
            properties: {
                value: { type, description },
                sourceText: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The exact words from the user's query that correspond to this parameter." }
            }
        });
        const arrayParamSchema = (description: string) => ({
            type: Type.OBJECT,
            properties: {
                value: { type: Type.ARRAY, items: { type: Type.STRING }, description },
                sourceText: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The exact words from the user's query that correspond to this parameter." }
            }
        });

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                location: paramSchema(Type.STRING, "City, state, or neighborhood. e.g., 'Austin, TX'"),
                propertyType: paramSchema(Type.STRING, "e.g., 'house', 'apartment', 'penthouse'"),
                listingType: paramSchema(Type.STRING, "Whether the property is for sale or for rent. Must be 'For Sale' or 'For Rent'."),
                priceMin: paramSchema(Type.NUMBER, "Minimum price in USD."),
                priceMax: paramSchema(Type.NUMBER, "Maximum price in USD."),
                bedroomsMin: paramSchema(Type.NUMBER, "Minimum number of bedrooms."),
                bathroomsMin: paramSchema(Type.NUMBER, "Minimum number of bathrooms."),
                squareFootageMin: paramSchema(Type.NUMBER, "Minimum square footage."),
                amenities: arrayParamSchema(`List of amenities. Possible values: ${amenitiesList}.`)
            },
        };

        const currentParamsPrompt = `The user's current search parameters are: ${JSON.stringify(searchParams)}. Analyze the new user query: "${text}". Extract any new or updated search parameters. For each extracted parameter, provide its value and the exact text fragment(s) from the user query that it was extracted from. Only return parameters that are new or have been changed.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: currentParamsPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const responseData = JSON.parse(response.text);
        
        const updatedParamsPartial: Partial<SearchParams> = {};
        const newGlowing: string[] = [];
        const newlyHighlighted: string[] = [];

        for (const key in responseData) {
            // FIX: Added a type guard to ensure the key from the AI response is a valid property of SearchParams.
            if (Object.prototype.hasOwnProperty.call(responseData, key) && key in initialSearchParams) {
                const param = responseData[key];
                if (param && param.value !== undefined && param.value !== null) {
                    // FIX: Use a type assertion for dynamic property assignment. TypeScript cannot infer the correct type for `updatedParamsPartial[key]` when `key` is a union type, leading to a `never` type error.
                    (updatedParamsPartial as any)[key] = param.value;
                    newGlowing.push(key);
                    if (param.sourceText && Array.isArray(param.sourceText)) {
                        newlyHighlighted.push(...param.sourceText.filter(s => s && s.trim().length > 0));
                    }
                }
            }
        }
        
        setSearchParams(prevParams => ({...prevParams, ...updatedParamsPartial}));
        setGlowingParams(newGlowing);
        setHighlightedText(prev => [...new Set([...prev, ...newlyHighlighted])]);
        if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
        glowTimeoutRef.current = setTimeout(() => setGlowingParams([]), 2000);

    } catch(error) {
        console.error("Error processing transcript with AI:", error);
    } finally {
        if(recognitionRef.current) {
            setStatus('listening');
        } else {
            setStatus('idle');
        }
    }
  };
  
  const handleSearch = () => {
    setStatus('done');
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    const mockResults = generateMockResults(searchParams);
    setTimeout(() => onResults(mockResults, searchParams), 800);
  }

  useEffect(() => {
    handleStartListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusMessages: Record<SearchStatus, string> = {
    idle: "Click to speak",
    listening: "Listening...",
    processing: "Updating...",
    done: "Finding properties...",
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-neutral-950 overflow-hidden font-geist p-4 sm:p-8">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-neutral-400 hover:text-white z-20" aria-label="Close voice search">
        <XIcon className="w-6 h-6" />
      </button>

      <div className="w-full max-w-4xl text-center flex flex-col h-full">
        <div className="flex-shrink-0">
          <AIVoice
            submitted={status === 'listening' || status === 'processing'}
            onClick={handleToggleListening}
            statusText={statusMessages[status]}
          />
          <p className="mt-1 min-h-[56px] text-base text-neutral-400 leading-relaxed transition-opacity duration-300 p-2" aria-live="polite">
            {transcript ? highlightTranscript(transcript, highlightedText) : (status === 'idle' && `Try "Find modern apartments in San Francisco with a pool."`)}
          </p>
        </div>
        
        <div className="flex-grow my-6 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {PARAMETER_CONFIG.map(param => {
                    const key = param.key as keyof SearchParams;
                    const value = searchParams[key];
                    const hasValue = value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : true);
                    const isGlowing = glowingParams.includes(key);

                    return (
                        <div key={param.key} className={`
                            ${param.colSpan || 'sm:col-span-1'}
                            p-4 rounded-xl border transition-all duration-300
                            ${hasValue ? 'bg-white/5 border-white/10' : 'bg-white/5 border-transparent'}
                            ${isGlowing ? 'animate-glow' : ''}
                        `}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${hasValue ? 'bg-blue-500/10 text-blue-300' : 'bg-white/5 text-neutral-400'}`}>
                                    {param.icon}
                                </div>
                                <div className="flex-grow self-center">
                                    <h3 className="text-sm font-medium text-neutral-400 text-left">{param.label}</h3>
                                    { editingParam === param.key ? (
                                        (() => {
                                            const commonInputProps = {
                                                onBlur: () => setEditingParam(null),
                                                onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') (e.target as HTMLElement).blur(); },
                                                autoFocus: true,
                                                className: "w-full bg-transparent text-base font-semibold text-neutral-100 focus:outline-none p-0 border-0"
                                            };
                                            const textInputProps = {
                                                ...commonInputProps,
                                                type: "text",
                                                placeholder: "-",
                                                value: searchParams[param.key as keyof SearchParams] as string || '',
                                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleParamChange(param.key as keyof SearchParams, e.target.value)
                                            };

                                            switch(param.key) {
                                                case 'location':
                                                case 'squareFootageMin':
                                                case 'priceMin':
                                                case 'priceMax':
                                                    return <input {...textInputProps} />;
                                                case 'amenities':
                                                    return <input {...commonInputProps} type="text" placeholder="e.g. Pool, Gym" value={(searchParams.amenities || []).join(', ')} onChange={(e) => handleParamChange('amenities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />;
                                                case 'listingType':
                                                case 'propertyType':
                                                case 'bedroomsMin':
                                                case 'bathroomsMin':
                                                    const options = { listingType: listingTypeOptions, propertyType: propertyTypeOptions, bedroomsMin: bedroomOptions, bathroomsMin: bathroomOptions }[param.key];
                                                    return (
                                                        <select 
                                                            value={searchParams[param.key as keyof SearchParams] as string || ''}
                                                            onChange={(e) => {
                                                                handleParamChange(param.key as keyof SearchParams, e.target.value);
                                                                setEditingParam(null);
                                                            }}
                                                            {...commonInputProps}
                                                            className={`${commonInputProps.className} bg-neutral-900 cursor-pointer appearance-none`}
                                                        >
                                                            <option value="">-</option>
                                                            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                        </select>
                                                    );
                                                default: return null;
                                            }
                                        })()
                                    ) : (
                                        <p onClick={() => setEditingParam(param.key)} className="text-base font-semibold text-neutral-100 text-left min-h-[24px] cursor-pointer truncate">
                                            {hasValue ? formatValue(key, value) : '-'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="flex-shrink-0 mt-auto pt-4">
          <button onClick={handleSearch} disabled={status === 'done'} className="w-full max-w-xs mx-auto inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-base font-medium tracking-tight text-white bg-blue-600 hover:bg-blue-700 border border-transparent transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50">
              <SearchIcon className="w-5 h-5 stroke-[1.5]" />
              <span className="font-geist">Find Properties</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCopilot;