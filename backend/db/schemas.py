

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId




class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)




class UserCreate(BaseModel):
    email:    EmailStr
    password: str                       

class UserInDB(BaseModel):
    id:            Optional[str]   = Field(None, alias="_id")
    email:         EmailStr
    password_hash: str
    is_active:     bool            = True
    created_at:    datetime        = Field(default_factory=datetime.utcnow)
    updated_at:    datetime        = Field(default_factory=datetime.utcnow)




class UserProfile(BaseModel):
    user_id:       str
    name:          Optional[str] = None
    phone:         Optional[str] = None
    avatar_url:    Optional[str] = None
    membership_name: Optional[str] = None
    plan_type:     Optional[str] = None
    redeem_for:    Optional[List[str]] = None
    age:           int                           
    weight_kg:     float                         
    height_cm:     float                         
    gender:        str                            
    goal:          str                            
    level:         str = "débutant"              
    equipment:     str = "salle"                 
    days_per_week: int = 3                       
    language:      str = "fr"                    
    updated_at:    datetime = Field(default_factory=datetime.utcnow)

class UserProfileUpdate(BaseModel):
   
    name:          Optional[str]   = None
    phone:         Optional[str]   = None
    avatar_url:    Optional[str]   = None
    membership_name: Optional[str] = None
    plan_type:     Optional[str]   = None
    redeem_for:    Optional[List[str]] = None
    age:           Optional[int]   = None
    weight_kg:     Optional[float] = None
    height_cm:     Optional[float] = None
    gender:        Optional[str]   = None
    goal:          Optional[str]   = None
    level:         Optional[str]   = None
    equipment:     Optional[str]   = None
    days_per_week: Optional[int]   = None
    language:      Optional[str]   = None




class ChatMessage(BaseModel):
    role:      str
    content:   str
    intent:    Optional[str]   = None
    language:  Optional[str]   = None
    service:   Optional[str]   = None
    image_url: Optional[str]   = None
    timestamp: datetime        = Field(default_factory=datetime.utcnow)

class ChatSession(BaseModel):
    user_id:    str
    messages:   List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message:    str
    session_id: Optional[str] = None
    image_url:  Optional[str] = None

class ChatResponse(BaseModel):
    response:   str
    session_id: str
    intent:     str
    language:   str
    gif_url:    Optional[str] = None
    image_url:  Optional[str] = None

class SupportRequest(BaseModel):
    """Lightweight request for the public guest/support chat endpoint."""
    message: str

class SupportResponse(BaseModel):
    """Lightweight response for the public guest/support chat endpoint."""
    response: str




"""
EXEMPLE DOCUMENT:
{
    "_id":        ObjectId("..."),
    "user_id":    ObjectId("..."),
    "week_start": ISODate("2025-01-06"),  ← دايما الاثنين
    "goal":       "musculation",
    "days": [
        {
            "day":       "Lundi",
            "is_rest":   False,
            "focus":     "Poitrine + Triceps",
            "exercises": [
                {
                    "exerciseId": "3tAXPQ6",
                    "name":       "Bench Press",
                    "sets":       4,
                    "reps":       "8-12",
                    "rest_sec":   90,
                    "gif_url":    "3tAXPQ6.gif"
                }
            ],
            "duration_min": 60,
            "calories_burned": 350
        },
        {
            "day":     "Mardi",
            "is_rest": True,
            "focus":   "Repos actif"
        }
    ],
    "calories_target": 2800,
    "macros": {
        "protein_g":  180,
        "carbs_g":    320,
        "fat_g":       80
    },
    "created_at": ISODate("2025-01-06")
}
"""

class ExerciseInPlan(BaseModel):
    exerciseId:      str
    name:            str
    sets:            int
    reps:            str                         
    rest_sec:        int = 90
    gif_url:         Optional[str] = None

class DayPlan(BaseModel):
    day:             str                         
    is_rest:         bool = False
    focus:           Optional[str]   = None       
    exercises:       List[ExerciseInPlan] = []
    duration_min:    Optional[int]   = None
    calories_burned: Optional[int]   = None

class Macros(BaseModel):
    protein_g: float
    carbs_g:   float
    fat_g:     float

class WeeklyPlan(BaseModel):
    user_id:          str
    week_start:       datetime
    goal:             str
    days:             List[DayPlan]
    calories_target:  int
    macros:           Macros
    created_at:       datetime = Field(default_factory=datetime.utcnow)




"""
EXEMPLE DOCUMENT:
{
    "_id":            ObjectId("..."),
    "user_id":        ObjectId("..."),
    "date":           ISODate("2025-01-06"),
    "weight_kg":      75.2,
    "calories_eaten": 2650,
    "calories_target":2800,
    "sessions_done": [
        {
            "plan_day":     "Lundi",
            "completed":    True,
            "duration_min": 55,
            "notes":        "Bien fait, augmenter poids bench"
        }
    ],
    "water_ml":  2500,
    "sleep_hrs": 7.5,
    "mood":      4,                       ← 1-5
    "notes":     "Bonne journée"
}
"""

class SessionLog(BaseModel):
    plan_day:     str
    completed:    bool = True
    duration_min: Optional[int]  = None
    notes:        Optional[str]  = None

class ProgressLog(BaseModel):
    user_id:          str
    date:             datetime
    weight_kg:        Optional[float]       = None
    calories_eaten:   Optional[int]         = None
    calories_target:  Optional[int]         = None
    sessions_done:    List[SessionLog]      = []
    water_ml:         Optional[int]         = None
    sleep_hrs:        Optional[float]       = None
    mood:             Optional[int]         = None    
    notes:            Optional[str]         = None

class ProgressLogCreate(BaseModel):
    date:             Optional[datetime]    = Field(default_factory=datetime.utcnow)
    weight_kg:        Optional[float]       = None
    calories_eaten:   Optional[int]         = None
    sessions_done:    List[SessionLog]      = []
    water_ml:         Optional[int]         = None
    sleep_hrs:        Optional[float]       = None
    mood:             Optional[int]         = None
    notes:            Optional[str]         = None



"""
EXEMPLE DOCUMENT:  (نفس structure ديال exercises.json)
{
    "_id":              ObjectId("..."),
    "exerciseId":       "3tAXPQ6",
    "name":             "Barbell Bench Press",
    "gifUrl":           "3tAXPQ6.gif",
    "targetMuscles":    ["pectorals"],
    "secondaryMuscles": ["triceps", "deltoïdes"],
    "bodyParts":        ["chest"],
    "equipments":       ["barbell"],
    "instructions":     ["Step 1...", "Step 2..."],
    "imported_at":      ISODate("2025-01-01")
}
"""

class Exercise(BaseModel):
    exerciseId:       str
    name:             str
    gifUrl:           Optional[str] = None   
    targetMuscles:    List[str]     = []
    secondaryMuscles: List[str]     = []
    bodyParts:        List[str]     = []
    equipments:       List[str]     = []
    instructions:     List[str]     = []



# COLLECTION: feedback_logs   ← Phase 2 (fine-tuning)


"""
EXEMPLE DOCUMENT:
{
    "_id":        ObjectId("..."),
    "user_id":    ObjectId("..."),
    "session_id": ObjectId("..."),
    "message_id": "msg_index_in_session",
    "question":   "exercice pour biceps",
    "answer":     "Voici 3 exercices...",
    "rating":     1,                      ← 1=positive  -1=negative  0=neutral
    "correction": "Ajoute aussi les curls marteau",
    "intent":     "musculation",
    "created_at": ISODate("2025-01-01")
}
"""

class FeedbackLog(BaseModel):
    user_id:    str
    session_id: str
    message_id: str
    question:   str
    answer:     str
    rating:     int                               # 1 | -1 | 0
    correction: Optional[str] = None
    intent:     Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)



# COLLECTION: training_data   


"""
EXEMPLE DOCUMENT:
{
    "_id":           ObjectId("..."),
    "question":      "exercice pour les biceps débutant",
    "answer":        "Pour les biceps en tant que débutant, voici...",
    "category":      "musculation",
    "language":      "fr",
    "quality_score": 0.95,               ← 0.0 → 1.0
    "source":        "feedback",         ← "feedback" | "manual" | "generated"
    "created_at":    ISODate("2025-01-01")
}
"""

class TrainingData(BaseModel):
    question:      str
    answer:        str
    category:      str                            
    language:      str
    quality_score: float = 0.0                   
    source:        str   = "feedback"            
    created_at:    datetime = Field(default_factory=datetime.utcnow)


# COLLECTION: user_schedules


"""
EXEMPLE DOCUMENT:
{
    "_id":           ObjectId("..."),
    "user_id":       ObjectId("..."),
    "muscle_group":  "Pectoralis Major (Chest)",
    "day":           "Mon",               ← "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
    "start_time":    "09:00",
    "end_time":      "10:30",
    "color":         "#D97E4A",
    "calories":      450,
    "image_url":     "http://...",
    "notes":         "Bench press focus",
    "created_at":    ISODate("2025-01-01")
}
"""

class ScheduleItem(BaseModel):
    id:            str
    user_id:       str
    muscle_group:  str
    day:           str                            
    start_time:    str                            
    end_time:      str                            
    color:         str                            
    calories:      Optional[int] = 0
    image_url:     Optional[str] = None
    notes:         Optional[str] = None
    created_at:    datetime = Field(default_factory=datetime.utcnow)

class ScheduleCreate(BaseModel):
    muscle_group:  str
    day:           str
    start_time:    str
    end_time:      str
    color:         str
    calories:      Optional[int] = 0
    image_url:     Optional[str] = None
    notes:         Optional[str] = None

class ScheduleUpdate(BaseModel):
    muscle_group:  Optional[str] = None
    day:           Optional[str] = None
    start_time:    Optional[str] = None
    end_time:      Optional[str] = None
    color:         Optional[str] = None
    calories:      Optional[int] = None
    image_url:     Optional[str] = None
    notes:         Optional[str] = None


"""
COLLECTION: wearable_connections
EXEMPLE DOCUMENT:
{
    "_id":             ObjectId("..."),
    "user_id":         ObjectId("..."),
    "provider":        "strava",       // "strava" | "fitbit"
    "provider_user_id":"12345678",
    "access_token":    "eyJ...",
    "refresh_token":   "eyJ...",
    "token_expires_at": 1700000000,     // unix timestamp
    "connected":       True,
    "last_sync":       ISODate("2025-01-15T10:30:00Z"),
    "created_at":      ISODate("2025-01-10"),
    "updated_at":      ISODate("2025-01-15T10:30:00Z")
}
"""

class WearableConnection(BaseModel):
    id:               Optional[str] = None
    user_id:          str
    provider:         str                        # "strava" | "fitbit"
    provider_user_id: str = ""
    access_token:     Optional[str] = None
    refresh_token:    Optional[str] = None
    token_expires_at: Optional[int] = None        # unix timestamp
    connected:        bool = True
    last_sync:        Optional[datetime] = None
    created_at:       datetime = Field(default_factory=datetime.utcnow)
    updated_at:       datetime = Field(default_factory=datetime.utcnow)

"""
COLLECTION: wearable_activity_logs
EXEMPLE DOCUMENT:
{
    "_id":               ObjectId("..."),
    "user_id":           ObjectId("..."),
    "provider":          "strava",
    "provider_activity_id": "1234567890",
    "date":              "2025-01-15",
    "type":              "run",              // "run" | "ride" | "walk" | "swim" | "workout" | "other"
    "name":              "Morning Run",
    "steps":             10500,
    "calories":          450,
    "distance_km":       8.2,
    "duration_minutes":  75,
    "heart_rate_avg":    140,
    "heart_rate_peak":   160,
    "elevation_gain":    120.5,
    "raw_data":          {},                  // original provider payload
    "created_at":        ISODate("2025-01-15T12:00:00Z")
}
"""

class WearableActivityLog(BaseModel):
    id:                  Optional[str] = None
    user_id:             str
    provider:            str
    provider_activity_id: str = ""
    date:                str = ""
    type:                str = "other"         # run / ride / walk / swim / workout / other
    name:                str = ""
    steps:               int = 0
    calories:            int = 0
    distance_km:         float = 0.0
    duration_minutes:    int = 0
    heart_rate_avg:      int = 0
    heart_rate_peak:     int = 0
    elevation_gain:      float = 0.0
    raw_data:            Optional[dict] = None
    created_at:          datetime = Field(default_factory=datetime.utcnow)
