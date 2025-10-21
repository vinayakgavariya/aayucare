from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import asyncio
import websockets
import json
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AayuCare API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SARVAM_API_KEY or not GEMINI_API_KEY:
    raise ValueError(
        "Missing API keys. Please set SARVAM_API_KEY and GEMINI_API_KEY in .env file"
    )

genai_client = genai.Client(api_key=GEMINI_API_KEY)


# Helper function to parse ratings and reviews from text
def parse_rating_from_text(text: str, place_name: str) -> tuple:
    """
    Parse rating and review count from Gemini's text response
    Returns: (rating, review_count)
    """
    try:
        # Clean the place name for better matching
        clean_name = place_name.strip()

        # Try to find the section for this specific place first
        # Look for the place name followed by rating info
        place_section = None
        if clean_name:
            # Find text after the place name until the next place or end
            place_pattern = re.escape(clean_name) + r"[^:]*:(.*?)(?=\n\w+:|$)"
            place_match = re.search(place_pattern, text, re.DOTALL | re.IGNORECASE)
            if place_match:
                place_section = place_match.group(1)

        # Search in the specific place section if found, otherwise search entire text
        search_text = place_section if place_section else text

        # Patterns to match rating and reviews
        # Format: "They have a rating of 4.9 stars based on 157 reviews"
        patterns = [
            r"rating of ([\d.]+) stars based on ([\d,]+) review",
            r"([\d.]+) stars based on ([\d,]+) review",
            r"rating: ([\d.]+) stars.*?([\d,]+) review",
            r"([\d.]+)\s*stars?\s*\(?([\d,]+)\s*reviews?\)?",
        ]

        for pattern in patterns:
            match = re.search(pattern, search_text, re.IGNORECASE)
            if match:
                try:
                    rating = float(match.group(1))
                    reviews_str = match.group(2).replace(",", "").replace(" ", "")
                    reviews = int(reviews_str)

                    # Validate the values
                    if 0 <= rating <= 5 and reviews >= 0:
                        return (rating, reviews)
                except (ValueError, IndexError):
                    continue

        return (None, None)
    except Exception as e:
        print(f"[Warning] Error parsing rating: {e}")
        return (None, None)


# Helper function to parse reviews from text
def parse_reviews_from_text(text: str, place_name: str) -> list:
    """
    Parse user reviews from Gemini's text response
    Returns: list of review strings
    """
    try:
        reviews = []
        clean_name = place_name.strip()

        # Try to find the section for this specific place
        place_section = None
        if clean_name:
            place_pattern = re.escape(clean_name) + r"[^:]*:(.*?)(?=\n\w+:|$)"
            place_match = re.search(place_pattern, text, re.DOTALL | re.IGNORECASE)
            if place_match:
                place_section = place_match.group(1)

        search_text = place_section if place_section else text

        # Patterns to match reviews
        # Format: Review: 'text' or Review: "text"
        patterns = [
            r"Review:\s*['\"]([^'\"]+)['\"]",
            r"Review:\s*([^\n]+)",
            r"User review:\s*['\"]([^'\"]+)['\"]",
            r"Customer review:\s*['\"]([^'\"]+)['\"]",
        ]

        for pattern in patterns:
            matches = re.finditer(pattern, search_text, re.IGNORECASE)
            for match in matches:
                review_text = match.group(1).strip()
                if review_text and len(review_text) > 10:  # At least 10 characters
                    reviews.append(review_text)
                    if len(reviews) >= 2:  # Limit to 2 reviews per place
                        break
            if reviews:
                break

        return reviews[:2]  # Return max 2 reviews
    except Exception as e:
        print(f"[Warning] Error parsing reviews: {e}")
        return []


# Models
class TranscribeRequest(BaseModel):
    audio_base64: str
    encoding: str = "audio/wav"
    sample_rate: int = 16000
    language: str = "unknown"  # Auto-detect language


class FindDoctorsRequest(BaseModel):
    symptom_text: str
    language: str = "english"


class DoctorResult(BaseModel):
    name: str
    address: Optional[str] = None
    uri: Optional[str] = None
    place_id: Optional[str] = None
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    distance_meters: Optional[int] = None
    reviews: Optional[List[str]] = None


class FindDoctorsResponse(BaseModel):
    recommendation: str
    doctors: List[DoctorResult]
    specialization: Optional[str] = None
    needs_location: bool = False


@app.get("/")
async def root():
    return {"message": "AayuCare API is running", "version": "1.0.0"}


@app.post("/translate")
async def translate_text(
    text: str = Form(...),
    target_language: str = Form("hindi"),
):
    """
    Translate text to target Indian language using Sarvam AI
    """
    try:
        import httpx

        # Map language names to Sarvam language codes
        language_map = {
            "hindi": "hi-IN",
            "bengali": "bn-IN",
            "gujarati": "gu-IN",
            "kannada": "kn-IN",
            "malayalam": "ml-IN",
            "marathi": "mr-IN",
            "odia": "od-IN",
            "punjabi": "pa-IN",
            "tamil": "ta-IN",
            "telugu": "te-IN",
            "english": "en-IN",
        }

        target_code = language_map.get(target_language.lower(), "hi-IN")

        # If target is English, return as is
        if target_code == "en-IN":
            return {"translated_text": text}

        # Call Sarvam AI translation API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.sarvam.ai/translate",
                headers={
                    "api-subscription-key": SARVAM_API_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "input": text,
                    "source_language_code": "en-IN",
                    "target_language_code": target_code,
                    "speaker_gender": "Male",
                    "mode": "formal",
                    "model": "mayura:v1",
                    "enable_preprocessing": True,
                },
            )

            if response.status_code == 200:
                data = response.json()
                translated_text = data.get("translated_text", text)
                return {"translated_text": translated_text}
            else:
                print(
                    f"[Translation Error] Status: {response.status_code}, Response: {response.text}"
                )
                return {"translated_text": text}

    except Exception as e:
        print(f"[Translation Error] {str(e)}")
        return {"translated_text": text}


@app.post("/transcribe")
async def transcribe_audio(request: TranscribeRequest):
    """
    Convert voice to text using Sarvam AI STT WebSocket API
    Supports automatic language detection for 11 Indian languages
    """
    try:
        print(
            f"[Debug]: Starting transcription with auto language detection, audio length: {len(request.audio_base64)} chars"
        )
        print(
            f"[Debug]: Encoding: {request.encoding}, Sample rate: {request.sample_rate}"
        )

        # Sarvam AI WebSocket URL for STT with automatic language detection
        # Using "unknown" enables automatic language detection
        ws_url = f"wss://api.sarvam.ai/speech-to-text/ws?language-code={request.language}&model=saarika:v2.5"

        # WebSocket subprotocol with API key
        subprotocol = f"api-subscription-key.{SARVAM_API_KEY}"

        print(
            f"[Debug]: Connecting to Sarvam STT WebSocket with auto language detection..."
        )

        # Connect to WebSocket
        async with websockets.connect(ws_url, subprotocols=[subprotocol]) as websocket:
            print("[Debug]: WebSocket connected")

            # Send audio data in the correct format
            audio_message = {
                "audio": {
                    "data": request.audio_base64,
                    "encoding": "audio/wav",  # Sarvam expects audio/wav
                    "sample_rate": 16000,  # Sarvam expects 16000
                }
            }

            await websocket.send(json.dumps(audio_message))
            print("[Debug]: Sent audio message")

            # Send flush message to get final results
            flush_message = {"type": "flush"}
            await websocket.send(json.dumps(flush_message))
            print("[Debug]: Sent flush message")

            # Collect transcription responses
            transcribed_text = ""
            detected_language = None
            detected_language_code = None

            # Wait for responses with timeout
            try:
                async for message in websocket:
                    response = json.loads(message)
                    print(f"[Debug]: Received response: {response}")

                    if response.get("type") == "data":
                        data = response.get("data", {})
                        transcript = data.get("transcript", "")
                        if transcript:
                            transcribed_text += transcript + " "
                            print(f"[Debug]: Got transcript: {transcript}")

                        # Capture detected language if available
                        if "language" in data:
                            detected_language = data.get("language")
                            print(f"[Debug]: Detected language: {detected_language}")

                        if "language_code" in data:
                            detected_language_code = data.get("language_code")
                            print(
                                f"[Debug]: Detected language code: {detected_language_code}"
                            )

                    # Break after getting response to flush
                    if transcribed_text:
                        break

            except asyncio.TimeoutError:
                print("[Warning]: Timeout waiting for transcription")

            transcribed_text = transcribed_text.strip()
            print(f"[Debug]: Final transcription: {transcribed_text}")
            print(
                f"[Debug]: Detected language: {detected_language or detected_language_code or 'Not detected'}"
            )

            # Map language code to language name for Gemini
            language_map = {
                "en-IN": "english",
                "hi-IN": "hindi",
                "ta-IN": "tamil",
                "te-IN": "telugu",
                "mr-IN": "marathi",
                "bn-IN": "bengali",
                "gu-IN": "gujarati",
                "kn-IN": "kannada",
                "ml-IN": "malayalam",
                "pa-IN": "punjabi",
                "or-IN": "odia",
            }

            # Determine the detected language name
            detected_lang_name = "english"  # Default
            if detected_language_code and detected_language_code in language_map:
                detected_lang_name = language_map[detected_language_code]
            elif detected_language:
                detected_lang_name = detected_language.lower()

            return {
                "success": True,
                "transcription": transcribed_text,
                "detected_language": detected_lang_name,
                "detected_language_code": detected_language_code or detected_language,
            }

    except Exception as e:
        import traceback

        error_details = traceback.format_exc()
        print(f"[Error]: Transcription failed: {str(e)}")
        print(f"[Error]: Full traceback:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@app.post("/find-doctors", response_model=FindDoctorsResponse)
async def find_doctors(request: FindDoctorsRequest):
    """
    Use Gemini with Google Maps grounding to:
    1. Identify the correct doctor specialization from symptoms
    2. Find nearby verified doctors, clinics
    3. Return results in the user's language
    """
    try:
        # Check if location is present in the query
        location_keywords = [
            "in ",
            "at ",
            "near ",
            "around ",
            " area",
            "city",
            "town",
            "village",
            "mumbai",
            "delhi",
            "bangalore",
            "pune",
            "hyderabad",
            "chennai",
            "kolkata",
            "ahmedabad",
            "surat",
            "jaipur",
            "lucknow",
            "kanpur",
            "nagpur",
            "indore",
        ]

        query_lower = request.symptom_text.lower()
        has_location = any(keyword in query_lower for keyword in location_keywords)

        # If no location detected, ask for it
        if not has_location:
            print(f"[Location Check] No location detected in: '{request.symptom_text}'")
            return FindDoctorsResponse(
                recommendation="To find the best doctors near you, please include your city and state in your message.",
                doctors=[],
                needs_location=True,
            )

        print(f"[Location Check] Location detected in query")

        # Prepare language-specific prompt
        language_instruction = ""
        if request.language.lower() != "english":
            language_instruction = f"Respond in {request.language}."

        prompt = f"""You are a helpful healthcare assistant. Be simple and direct.

User query: "{request.symptom_text}"

Instructions:
1. For common ailments (headache, fever, cold, stomach pain, body pain), recommend a General Physician or nearby clinic
2. ONLY suggest specialists (like Cardiologist, Neurologist) if the symptoms clearly indicate a specific serious condition
3. Extract location from the query and find doctors/clinics nearby using Google Maps
4. For EACH doctor/clinic found, include:
   - Name
   - Rating (X stars based on Y reviews) - IMPORTANT: Include this if available
   - Address/Location
   - 1-2 recent user reviews (if available) - Include actual review text
5. Format each result as: 
   "**[Doctor Name]:** Located at [Location]. They have a rating of [X] stars based on [Y] reviews.
   Review: '[Short review text]'"

{language_instruction}

Response format:
- Start with ONE simple sentence recommendation
- Then list the doctors with their ratings, review counts, and sample reviews
- If no location: "Please mention your city and state"

Do NOT:
- Suggest treatments or medications
- Give health advice or home remedies
- Ask follow-up questions
- Use complex medical terms
"""

        # Call Gemini with Google Maps grounding (it will extract location from the query)
        response = genai_client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_maps=types.GoogleMaps())],
            ),
        )

        # Extract recommendation text
        recommendation_text = (
            response.text if hasattr(response, "text") else str(response)
        )

        print("\n" + "=" * 100)
        print("🔍 FULL GEMINI RESPONSE (DOCTORS SEARCH)")
        print("=" * 100)
        print(f"\n📝 TEXT RESPONSE:\n{recommendation_text}\n")
        print("-" * 100)

        # Debug: Print full response structure
        if hasattr(response, "candidates") and response.candidates:
            print(f"\n✅ Found {len(response.candidates)} candidate(s)")
            for i, candidate in enumerate(response.candidates):
                print(f"\n--- Candidate {i} ---")
                if (
                    hasattr(candidate, "grounding_metadata")
                    and candidate.grounding_metadata
                ):
                    gm = candidate.grounding_metadata
                    print(f"  ✓ Grounding Metadata exists")
                    if hasattr(gm, "grounding_chunks") and gm.grounding_chunks:
                        print(f"  ✓ Found {len(gm.grounding_chunks)} grounding chunks")
                        for j, chunk in enumerate(
                            gm.grounding_chunks[:5]
                        ):  # Show first 5
                            print(f"\n    📍 Chunk {j}:")
                            if hasattr(chunk, "maps") and chunk.maps:
                                maps = chunk.maps
                                print(f"      Type: MAPS DATA")
                                print(f"      Title: {getattr(maps, 'title', 'N/A')}")
                                print(f"      Rating: {getattr(maps, 'rating', 'N/A')}")
                                print(
                                    f"      User Ratings Total: {getattr(maps, 'user_ratings_total', 'N/A')}"
                                )
                                print(
                                    f"      Address: {getattr(maps, 'address', 'N/A')}"
                                )

                                # CHECK FOR REVIEWS
                                if hasattr(maps, "reviews"):
                                    print(
                                        f"      ⭐ REVIEWS FIELD EXISTS: {maps.reviews}"
                                    )
                                else:
                                    print(f"      ❌ NO 'reviews' FIELD in maps object")

                                # Print all available attributes
                                print(f"      Available attributes: {dir(maps)}")
        print("=" * 100 + "\n")

        # Extract grounding information (actual doctors/clinics from Google Maps)
        doctors = []
        if response.candidates and len(response.candidates) > 0:
            grounding = response.candidates[0].grounding_metadata
            if (
                grounding
                and hasattr(grounding, "grounding_chunks")
                and grounding.grounding_chunks
            ):
                for chunk in grounding.grounding_chunks:
                    if hasattr(chunk, "maps") and chunk.maps:
                        maps_data = chunk.maps

                        # Extract all data from Pydantic model
                        try:
                            maps_dict = (
                                maps_data.model_dump()
                                if hasattr(maps_data, "model_dump")
                                else {}
                            )
                            print(f"\n[Debug] Doctor data: {maps_dict}")
                        except:
                            maps_dict = {}

                        # Extract rating, reviews, and distance from the model
                        rating = None
                        user_ratings_total = None
                        distance_meters = None

                        # Extract from maps_dict or directly from object
                        rating = maps_dict.get("rating") or getattr(
                            maps_data, "rating", None
                        )
                        user_ratings_total = maps_dict.get(
                            "user_ratings_total"
                        ) or getattr(maps_data, "user_ratings_total", None)
                        distance_meters = maps_dict.get("distance_meters") or getattr(
                            maps_data, "distance_meters", None
                        )

                        # If not in structured data, parse from text response
                        reviews_list = []
                        if rating is None or user_ratings_total is None:
                            place_name = (
                                maps_data.title if hasattr(maps_data, "title") else ""
                            )
                            print(f"  Parsing ratings for: {place_name[:80]}...")
                            parsed_rating, parsed_reviews = parse_rating_from_text(
                                recommendation_text, place_name
                            )
                            if parsed_rating:
                                rating = parsed_rating
                                print(f"  ✓ Parsed rating: {rating}")
                            if parsed_reviews:
                                user_ratings_total = parsed_reviews
                                print(f"  ✓ Parsed reviews count: {user_ratings_total}")

                        # Parse review text
                        place_name = (
                            maps_data.title if hasattr(maps_data, "title") else ""
                        )
                        reviews_list = parse_reviews_from_text(
                            recommendation_text, place_name
                        )
                        if reviews_list:
                            print(f"  ✓ Parsed {len(reviews_list)} review(s)")

                        print(
                            f"  Final: Rating={rating}, Reviews={user_ratings_total}, ReviewTexts={len(reviews_list)}"
                        )

                        doctors.append(
                            DoctorResult(
                                name=(
                                    maps_data.title
                                    if hasattr(maps_data, "title")
                                    else "Unknown"
                                ),
                                address=(
                                    maps_data.address
                                    if hasattr(maps_data, "address")
                                    else None
                                ),
                                uri=(
                                    maps_data.uri if hasattr(maps_data, "uri") else None
                                ),
                                place_id=(
                                    maps_data.place_id
                                    if hasattr(maps_data, "place_id")
                                    else None
                                ),
                                rating=rating,
                                user_ratings_total=user_ratings_total,
                                distance_meters=distance_meters,
                                reviews=reviews_list if reviews_list else None,
                            )
                        )

        # Sort doctors by rating (descending) and distance (ascending)
        doctors.sort(
            key=lambda d: (
                -(d.rating or 0),  # Higher rating first
                d.distance_meters or 999999,  # Closer distance first
            )
        )

        return FindDoctorsResponse(
            recommendation=recommendation_text,
            doctors=doctors,
            specialization=None,  # Can be extracted from response text if needed
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Doctor search failed: {str(e)}")


@app.post("/find-facilities")
async def find_facilities(
    facility_type: str = Form(...),  # "pharmacy", "lab", "hospital"
    location: str = Form(...),  # User's location as text
    language: str = Form("english"),
):
    """
    Find nearby labs, pharmacies, or hospitals
    """
    try:
        # Simplify facility type for better search results
        if facility_type == "pharmacy":
            facility_name = "pharmacies"
        elif facility_type == "lab":
            facility_name = "diagnostic labs"
        else:
            facility_name = "hospitals"

        prompt = f"""Find {facility_name} near {location}.

Instructions:
- Search for verified and well-known {facility_name} in the area
- Include both chain stores and local establishments
- For EACH facility, include: Name, Rating (X stars based on Y reviews), and Address
- Format each result as: "**[Facility Name]:** Located at [Address]. They have a rating of [X] stars based on [Y] reviews."
- Find at least 5-10 results if available

Keep response simple. Respond in {language if language.lower() != 'english' else 'English'}.
"""

        response = genai_client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_maps=types.GoogleMaps())],
            ),
        )

        recommendation_text = (
            response.text if hasattr(response, "text") else str(response)
        )

        print(f"\n[Debug] Facility response text:\n{recommendation_text[:500]}...")

        facilities = []
        if response.candidates and len(response.candidates) > 0:
            grounding = response.candidates[0].grounding_metadata
            if (
                grounding
                and hasattr(grounding, "grounding_chunks")
                and grounding.grounding_chunks
            ):
                for chunk in grounding.grounding_chunks:
                    if hasattr(chunk, "maps") and chunk.maps:
                        maps_data = chunk.maps

                        # Extract all data from Pydantic model
                        try:
                            maps_dict = (
                                maps_data.model_dump()
                                if hasattr(maps_data, "model_dump")
                                else {}
                            )
                            print(f"\n[Debug] Facility data: {maps_dict}")
                        except:
                            maps_dict = {}

                        # Extract rating, reviews, and distance
                        rating = maps_dict.get("rating") or getattr(
                            maps_data, "rating", None
                        )
                        user_ratings_total = maps_dict.get(
                            "user_ratings_total"
                        ) or getattr(maps_data, "user_ratings_total", None)
                        distance_meters = maps_dict.get("distance_meters") or getattr(
                            maps_data, "distance_meters", None
                        )

                        # If not in structured data, parse from text response
                        if rating is None or user_ratings_total is None:
                            place_name = (
                                maps_data.title if hasattr(maps_data, "title") else ""
                            )
                            print(
                                f"  Parsing ratings for facility: {place_name[:80]}..."
                            )
                            parsed_rating, parsed_reviews = parse_rating_from_text(
                                recommendation_text, place_name
                            )
                            if parsed_rating:
                                rating = parsed_rating
                                print(f"  ✓ Parsed rating: {rating}")
                            if parsed_reviews:
                                user_ratings_total = parsed_reviews
                                print(f"  ✓ Parsed reviews count: {user_ratings_total}")

                        print(f"  Final: Rating={rating}, Reviews={user_ratings_total}")

                        facilities.append(
                            {
                                "name": (
                                    maps_data.title
                                    if hasattr(maps_data, "title")
                                    else "Unknown"
                                ),
                                "address": (
                                    maps_data.address
                                    if hasattr(maps_data, "address")
                                    else None
                                ),
                                "uri": (
                                    maps_data.uri if hasattr(maps_data, "uri") else None
                                ),
                                "place_id": (
                                    maps_data.place_id
                                    if hasattr(maps_data, "place_id")
                                    else None
                                ),
                                "rating": rating,
                                "user_ratings_total": user_ratings_total,
                                "distance_meters": distance_meters,
                            }
                        )

        # Sort facilities by rating (descending) and distance (ascending)
        facilities.sort(
            key=lambda f: (
                -(f.get("rating") or 0),  # Higher rating first
                f.get("distance_meters") or 999999,  # Closer distance first
            )
        )

        print(f"[Debug] Found {len(facilities)} {facility_type}s")
        print(f"[Debug] Recommendation: {recommendation_text[:100]}...")

        return {
            "success": True,
            "facility_type": facility_type,
            "recommendation": recommendation_text,
            "facilities": facilities,
        }

    except Exception as e:
        print(f"[Error] Facility search failed: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Facility search failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
