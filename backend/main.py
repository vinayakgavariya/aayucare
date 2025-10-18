from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import base64
import asyncio
import websockets
import json
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


# Models
class TranscribeRequest(BaseModel):
    audio_base64: str
    encoding: str = "audio/wav"
    sample_rate: int = 16000


class FindDoctorsRequest(BaseModel):
    symptom_text: str
    language: str = "english"


class DoctorResult(BaseModel):
    name: str
    address: Optional[str] = None
    uri: Optional[str] = None
    place_id: Optional[str] = None


class FindDoctorsResponse(BaseModel):
    recommendation: str
    doctors: List[DoctorResult]
    specialization: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "AayuCare API is running", "version": "1.0.0"}


@app.post("/transcribe")
async def transcribe_audio(request: TranscribeRequest):
    """
    Convert voice to text using Sarvam AI STT WebSocket API
    Supports 10+ Indian languages
    """
    try:
        print(
            f"[Debug]: Starting transcription, audio length: {len(request.audio_base64)} chars"
        )
        print(
            f"[Debug]: Encoding: {request.encoding}, Sample rate: {request.sample_rate}"
        )

        # Sarvam AI WebSocket URL for STT
        ws_url = "wss://api.sarvam.ai/speech-to-text/ws?language-code=en-IN&model=saarika:v2.5"

        # WebSocket subprotocol with API key
        subprotocol = f"api-subscription-key.{SARVAM_API_KEY}"

        print(f"[Debug]: Connecting to Sarvam STT WebSocket...")

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

                    # Break after getting response to flush
                    if transcribed_text:
                        break

            except asyncio.TimeoutError:
                print("[Warning]: Timeout waiting for transcription")

            transcribed_text = transcribed_text.strip()
            print(f"[Debug]: Final transcription: {transcribed_text}")

            return {
                "success": True,
                "transcription": transcribed_text,
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
        # Prepare language-specific prompt
        language_instruction = ""
        if request.language.lower() != "english":
            language_instruction = f"Respond in {request.language}."

        prompt = f"""
You are a medical assistant helping users find the right doctor.

User query: "{request.symptom_text}"

Tasks:
1. Extract the location from the user's query (city, area, or place name)
2. Identify the appropriate doctor specialization needed for these symptoms
3. Provide a brief explanation of why this specialist is needed
4. Find verified clinics, hospitals, or doctors near the mentioned location
5. Provide contact information if available

{language_instruction}

Important: The user will mention their location in their query. Use that location to find nearby doctors.
If no location is mentioned, ask them to specify their location.

Format your response clearly with:
- Specialization needed
- Brief explanation
- List of recommended doctors/clinics near the mentioned location
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
                        doctors.append(
                            DoctorResult(
                                name=(
                                    chunk.maps.title
                                    if hasattr(chunk.maps, "title")
                                    else "Unknown"
                                ),
                                address=(
                                    chunk.maps.address
                                    if hasattr(chunk.maps, "address")
                                    else None
                                ),
                                uri=(
                                    chunk.maps.uri
                                    if hasattr(chunk.maps, "uri")
                                    else None
                                ),
                                place_id=(
                                    chunk.maps.place_id
                                    if hasattr(chunk.maps, "place_id")
                                    else None
                                ),
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
        prompt = f"""
Find verified {facility_type}s near {location}.
List their names, addresses, and contact information if available.
Respond in {language}.
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
                        facilities.append(
                            {
                                "name": (
                                    chunk.maps.title
                                    if hasattr(chunk.maps, "title")
                                    else "Unknown"
                                ),
                                "address": (
                                    chunk.maps.address
                                    if hasattr(chunk.maps, "address")
                                    else None
                                ),
                                "uri": (
                                    chunk.maps.uri
                                    if hasattr(chunk.maps, "uri")
                                    else None
                                ),
                                "place_id": (
                                    chunk.maps.place_id
                                    if hasattr(chunk.maps, "place_id")
                                    else None
                                ),
                            }
                        )

        return {
            "success": True,
            "facility_type": facility_type,
            "recommendation": recommendation_text,
            "facilities": facilities,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Facility search failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
