from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import asyncio

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="HAUS Voice Search API",
    description="Multilingual voice search with web scraping capabilities",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic Models
class VoiceSearchRequest(BaseModel):
    query: str = Field(description="Search query from voice input")
    language: str = Field(default="en", description="Language code for TTS")
    voice_id: Optional[str] = Field(default="21m00Tcm4TlvDq8ikWAM", description="ElevenLabs voice ID")

class SearchResult(BaseModel):
    title: str
    url: str
    content: str
    summary: str

class VoiceSearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    audio_response: str  # Base64 encoded audio
    processing_time: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    voice_id: str = "21m00Tcm4TlvDq8ikWAM"

class ScrapeRequest(BaseModel):
    query: str
    max_results: int = 5

# Initialize APIs
async def initialize_apis():
    """Initialize ElevenLabs and Firecrawl clients"""
    try:
        # ElevenLabs client
        from elevenlabs import ElevenLabs
        elevenlabs_client = ElevenLabs(
            api_key=os.getenv("ELEVENLABS_API_KEY")
        )
        
        # Firecrawl client (updated import)
        from firecrawl import FirecrawlApp
        firecrawl_client = FirecrawlApp(
            api_key=os.getenv("FIRECRAWL_API_KEY"),
            api_url=os.getenv("FIRECRAWL_API_URL", "https://api.firecrawl.dev")
        )
        
        return elevenlabs_client, firecrawl_client
        
    except Exception as e:
        logger.error(f"Failed to initialize APIs: {e}")
        raise HTTPException(status_code=500, detail=f"API initialization failed: {str(e)}")

# Global API clients (will be initialized on startup)
elevenlabs_client = None
firecrawl_client = None

@app.on_event("startup")
async def startup_event():
    global elevenlabs_client, firecrawl_client
    try:
        elevenlabs_client, firecrawl_client = await initialize_apis()
        logger.info("APIs initialized successfully")
    except Exception as e:
        logger.error(f"Startup failed: {e}")

async def search_and_scrape(query: str, max_results: int = 5) -> List[SearchResult]:
    """Search the web and scrape content using Firecrawl"""
    try:
        # For demo purposes, we'll search some popular sites
        # In production, you'd integrate with a search API or use Firecrawl's search capabilities
        search_urls = [
            f"https://www.wikipedia.org/wiki/{query.replace(' ', '_')}",
            f"https://en.wikipedia.org/wiki/{query.replace(' ', '_')}",
        ]
        
        results = []
        
        for url in search_urls[:max_results]:
            try:
                # Use Firecrawl to scrape the content (updated method name)
                scrape_result = firecrawl_client.scrape(
                    url,
                    formats=["markdown", "html"]
                )
                
                if scrape_result and hasattr(scrape_result, 'markdown') and scrape_result.markdown:
                    content = scrape_result.markdown
                    title = scrape_result.metadata.title if hasattr(scrape_result, 'metadata') and hasattr(scrape_result.metadata, 'title') else "Search Result"
                    
                    # Create a summary (first 200 characters)
                    summary = content[:200] + "..." if len(content) > 200 else content
                    
                    results.append(SearchResult(
                        title=title,
                        url=url,
                        content=content,
                        summary=summary
                    ))
                    
            except Exception as e:
                logger.warning(f"Failed to scrape {url}: {e}")
                continue
                
        return results
        
    except Exception as e:
        logger.error(f"Search and scrape failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

async def generate_speech(text: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> str:
    """Generate speech using ElevenLabs and return base64 encoded audio"""
    try:
        # Generate audio using ElevenLabs (updated method usage)
        audio = elevenlabs_client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128"
        )
        
        # Convert audio generator to bytes
        audio_bytes = b""
        for chunk in audio:
            audio_bytes += chunk
        
        # Convert to base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return f"data:audio/mpeg;base64,{audio_base64}"
        
    except Exception as e:
        logger.error(f"Speech generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Speech generation failed: {str(e)}")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "HAUS Voice Search API is running"}

@api_router.post("/voice-search", response_model=VoiceSearchResponse)
async def voice_search(request: VoiceSearchRequest):
    """Process voice search query and return results with audio response"""
    start_time = datetime.now()
    
    try:
        # Search and scrape content
        search_results = await search_and_scrape(request.query, max_results=3)
        
        if not search_results:
            response_text = f"I couldn't find any results for '{request.query}'. Please try a different search term."
        else:
            # Create response text from search results
            response_text = f"I found {len(search_results)} results for '{request.query}'. "
            for i, result in enumerate(search_results, 1):
                response_text += f"Result {i}: {result.title}. {result.summary[:100]}... "
        
        # Generate audio response
        audio_response = await generate_speech(response_text, request.voice_id)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Save search to database
        search_record = {
            "id": str(uuid.uuid4()),
            "query": request.query,
            "results_count": len(search_results),
            "processing_time": processing_time,
            "timestamp": datetime.utcnow(),
            "language": request.language
        }
        await db.voice_searches.insert_one(search_record)
        
        return VoiceSearchResponse(
            query=request.query,
            results=search_results,
            audio_response=audio_response,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Voice search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Voice search failed: {str(e)}")

@api_router.post("/generate-speech")
async def generate_speech_endpoint(request: TTSRequest):
    """Generate speech from text"""
    try:
        audio_response = await generate_speech(request.text, request.voice_id)
        return {
            "success": True,
            "audio": audio_response,
            "text": request.text,
            "voice_id": request.voice_id
        }
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@api_router.post("/scrape")
async def scrape_content(request: ScrapeRequest):
    """Scrape web content based on search query"""
    try:
        results = await search_and_scrape(request.query, request.max_results)
        return {
            "success": True,
            "query": request.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@api_router.get("/search-history")
async def get_search_history():
    """Get recent search history"""
    try:
        history = await db.voice_searches.find().sort("timestamp", -1).limit(10).to_list(10)
        return {
            "success": True,
            "history": history
        }
    except Exception as e:
        logger.error(f"Failed to get search history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get search history: {str(e)}")

@api_router.get("/voices")
async def get_available_voices():
    """Get available ElevenLabs voices"""
    try:
        voices = elevenlabs_client.voices.get_all()
        voice_list = []
        for voice in voices.voices:
            voice_list.append({
                "voice_id": voice.voice_id,
                "name": voice.name,
                "category": voice.category,
                "description": voice.description if hasattr(voice, 'description') else ""
            })
        
        return {
            "success": True,
            "voices": voice_list
        }
    except Exception as e:
        logger.error(f"Failed to get voices: {e}")
        return {
            "success": False,
            "voices": [
                {
                    "voice_id": "21m00Tcm4TlmVhkVyaZB",
                    "name": "Rachel",
                    "category": "premade",
                    "description": "Default English voice"
                }
            ]
        }

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()