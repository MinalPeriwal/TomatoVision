from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import csv
from predict import predict_image   # adjust if needed
from predict_growth import get_growth_prediction

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "TomatoVision Backend Running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_image(file_path)

    os.remove(file_path)

    return {
        "label": result[0],
        "confidence": float(result[1])
    }

class GrowthRequest(BaseModel):
    temperature: float
    humidity: float
    sunlight: float
    soil: str
    fertilizer: str
    watering: int

@app.post("/growth-predict")
def predict_growth_stage(req: GrowthRequest):
    return get_growth_prediction(
        req.temperature,
        req.humidity,
        req.sunlight,
        req.soil,
        req.fertilizer,
        req.watering
    )

@app.get("/growth-data")
def get_growth_data():
    csv_path = os.path.join(os.path.dirname(__file__), "..", "dataset", "plant_growth_data.csv")
    if not os.path.exists(csv_path):
        # Fallback
        csv_path = os.path.join("dataset", "plant_growth_data.csv")
        
    if not os.path.exists(csv_path):
        return {"error": "Data file not found"}
        
    data = []
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            milestone = int(float(row.get("Growth_Milestone", 0)))
            stage = "Early Stage" if milestone == 0 else "Healthy Growth Stage"
            row_data = dict(row)
            row_data["Stage"] = stage
            data.append(row_data)
            
    return {"data": data}