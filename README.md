# 🍅 TomatoVision

An AI-powered tomato plant analyzer that detects diseases from leaf images and predicts growth stages based on environmental conditions.

---

## Features

- **Disease Diagnosis** — Upload a tomato leaf image and get instant disease detection with confidence score and treatment suggestions
- **Growth Stage Predictor** — Input environmental conditions and predict which growth stage your tomato plant is in
- **Light / Dark Theme** — Persistent theme toggle
- **Recent Diagnoses History** — Last 3 disease scans stored in session

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, lucide-react |
| Backend | FastAPI, Python |
| Disease Model | MobileNetV2 (Transfer Learning, TensorFlow/Keras) |
| Growth Model | KNN Classifier (scikit-learn, 93% accuracy) |
| Dataset | PlantVillage (disease) + Custom synthetic dataset (growth) |

---

## Project Structure

```
TomatoVision/
├── app/
│   ├── main.py              # FastAPI server & API endpoints
│   ├── predict.py           # Disease prediction using Keras model
│   ├── predict_growth.py    # Growth prediction using KNN model
│   ├── train.py             # Train disease model (MobileNetV2)
│   ├── train_growth.py      # Train KNN growth model
│   └── test.py              # Evaluate disease model on test set
├── dataset/
│   ├── train/               # Disease training images
│   ├── validation/          # Disease validation images
│   ├── test/                # Disease test images
│   ├── generate_dataset.py  # Generate synthetic growth dataset
│   └── tomato_growth_dataset.csv  # 1200-row growth dataset
├── models/
│   ├── best_model.keras     # Trained disease classification model
│   ├── class_indices.json   # Class index → disease name mapping
│   └── growth_model.pkl     # Trained KNN growth model
└── frontend/
    └── src/
        ├── App.jsx          # Main React component
        ├── App.css          # Styles
        └── main.jsx         # Entry point
```

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Install Backend Dependencies
```bash
pip install fastapi uvicorn tensorflow scikit-learn pandas numpy
```

### 2. Start Backend
```bash
cd app
uvicorn main:app --reload
```
Backend runs at → `http://localhost:8000`

### 3. Install & Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at → `http://localhost:5173`

---

## API Endpoints

### `GET /`
Health check
```json
{ "message": "TomatoVision Backend Running" }
```

### `POST /predict`
Upload a tomato leaf image for disease detection.

- Input: `multipart/form-data` with `file` field (JPG/PNG)
- Output:
```json
{
  "label": "Tomato___Early_blight",
  "confidence": 0.94
}
```

### `POST /growth-predict`
Predict tomato growth stage from environmental inputs.

- Input:
```json
{
  "temperature": 22,
  "humidity": 72,
  "sunlight": 5.5,
  "soil": "loamy",
  "fertilizer": "organic",
  "watering": 6
}
```
- Output:
```json
{
  "growth_stage": "Seedling",
  "confidence": 0.91,
  "recommendation": "Conditions are optimal for Seedling stage. Maintain current levels."
}
```

---

## Disease Classes (10)

| Class | Description |
|---|---|
| Tomato___Bacterial_spot | Bacterial infection causing dark spots |
| Tomato___Early_blight | Fungal disease with target-like lesions |
| Tomato___Late_blight | Aggressive fungal disease |
| Tomato___Leaf_Mold | Fungal mold on leaf surface |
| Tomato___Septoria_leaf_spot | Small circular spots with dark borders |
| Tomato___Spider_mites | Mite infestation causing stippling |
| Tomato___Target_Spot | Fungal spots with concentric rings |
| Tomato___Tomato_Yellow_Leaf_Curl_Virus | Viral disease spread by whiteflies |
| Tomato___Tomato_mosaic_virus | Viral mosaic pattern on leaves |
| Tomato___healthy | No disease detected |

---

## Growth Stages & Conditions

| Stage | Temp (°C) | Humidity (%) | Sunlight (hrs) | Watering (×/week) |
|---|---|---|---|---|
| Seedling | 18–24 | 65–85 | 4–7 | 5–7 |
| Vegetative | 22–28 | 55–70 | 6–9 | 4–6 |
| Flowering | 20–26 | 45–60 | 8–12 | 3–5 |
| Fruiting | 24–30 | 50–65 | 9–14 | 4–6 |

---

## Model Details

### Disease Model (MobileNetV2)
- Base: MobileNetV2 pretrained on ImageNet
- Custom head: GlobalAveragePooling → Dense(256) → Dense(128) → Dense(10)
- Training: 2-phase transfer learning
  - Phase 1: Train custom head only (lr=0.001, 15 epochs)
  - Phase 2: Fine-tune last 30 layers (lr=0.0001, 20 epochs)
- Input size: 224×224 RGB

### Growth Model (KNN)
- Algorithm: K-Nearest Neighbors (K=11)
- Dataset: 1200 synthetic rows, 4 balanced classes
- Accuracy: 93% test, 94.7% cross-validation
- Features: Temperature, Humidity, Sunlight, Watering, Soil Type, Fertilizer Type

---

## Retraining Models

```bash
# Retrain disease model
cd app
python train.py

# Regenerate growth dataset
cd dataset
python generate_dataset.py

# Retrain KNN growth model
cd app
python train_growth.py
```

---

## Test API via Swagger UI

Open `http://localhost:8000/docs` in your browser for interactive API testing.
