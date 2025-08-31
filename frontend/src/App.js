import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Voice Search Component
const VoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');
  const [availableVoices, setAvailableVoices] = useState([]);
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        handleVoiceSearch(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Load available voices and search history
    loadAvailableVoices();
    loadSearchHistory();
  }, []);

  const loadAvailableVoices = async () => {
    try {
      const response = await axios.get(`${API}/voices`);
      if (response.data.success) {
        setAvailableVoices(response.data.voices);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const response = await axios.get(`${API}/search-history`);
      if (response.data.success) {
        setSearchHistory(response.data.history);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.post(`${API}/voice-search`, {
        query: query,
        language: 'en',
        voice_id: selectedVoice
      });

      setSearchResults(response.data.results);
      setAudioUrl(response.data.audio_response);
      
      // Play the audio response
      if (response.data.audio_response && audioRef.current) {
        audioRef.current.src = response.data.audio_response;
        audioRef.current.play().catch(e => console.error('Audio play failed:', e));
      }

      // Refresh search history
      loadSearchHistory();
      
    } catch (error) {
      console.error('Voice search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTextSearch = () => {
    if (transcript.trim()) {
      handleVoiceSearch(transcript);
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.error('Audio play failed:', e));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              HAUS
            </span>{' '}
            Voice Search
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Multilingual voice-powered search with intelligent web scraping and AI-generated responses
          </p>
        </div>

        {/* Voice Interface */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8">
            {/* Microphone Button */}
            <div className="text-center mb-8">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSearching}
                className={`relative w-32 h-32 rounded-full border-4 transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50 animate-pulse scale-110' 
                    : 'bg-gradient-to-br from-purple-500 to-blue-600 border-purple-400 hover:scale-105 shadow-lg hover:shadow-purple-500/50'
                } ${isSearching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-center h-full">
                  {isListening ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-8 bg-white rounded animate-pulse"></div>
                      <div className="w-2 h-12 bg-white rounded animate-pulse animation-delay-150"></div>
                      <div className="w-2 h-6 bg-white rounded animate-pulse animation-delay-300"></div>
                      <div className="w-2 h-10 bg-white rounded animate-pulse animation-delay-450"></div>
                    </div>
                  ) : (
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                    </svg>
                  )}
                </div>
                
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"></div>
                )}
              </button>
            </div>

            {/* Status Text */}
            <div className="text-center mb-6">
              <p className="text-lg font-medium text-white">
                {isListening ? (
                  <span className="text-red-400">🎤 Listening... Speak now!</span>
                ) : isSearching ? (
                  <span className="text-yellow-400">🔍 Searching and processing...</span>
                ) : (
                  <span className="text-gray-300">Click the microphone to start voice search</span>
                )}
              </p>
            </div>

            {/* Transcript Input */}
            <div className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your voice search query will appear here, or type manually..."
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 backdrop-blur-sm"
                />
                <button
                  onClick={handleTextSearch}
                  disabled={isSearching || !transcript.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Voice Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Voice Selection</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.voice_id} value={voice.voice_id} className="bg-gray-800">
                    {voice.name} - {voice.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="text-center">
                <button
                  onClick={playAudio}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-300"
                >
                  🔊 Play Response
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-w-6xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Search Results</h2>
            <div className="grid gap-6">
              {searchResults.map((result, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-3">{result.title}</h3>
                  <p className="text-blue-300 text-sm mb-3 break-all">{result.url}</p>
                  <p className="text-gray-300 leading-relaxed">{result.summary}</p>
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors duration-300"
                  >
                    View Source →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Recent Searches</h2>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <div className="space-y-4">
                {searchHistory.slice(0, 5).map((search, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                    <span className="text-gray-300">{search.query}</span>
                    <div className="text-sm text-gray-400">
                      <span className="mr-4">{search.results_count} results</span>
                      <span>{new Date(search.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <VoiceSearch />
    </div>
  );
}

export default App;