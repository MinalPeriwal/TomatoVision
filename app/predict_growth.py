import pickle
import os
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "growth_model.pkl")

with open(MODEL_PATH, "rb") as f:
    bundle = pickle.load(f)

model     = bundle["model"]
scaler    = bundle["scaler"]
soil_enc  = bundle["soil_enc"]
fert_enc  = bundle["fert_enc"]
label_enc = bundle["label_enc"]


def get_growth_prediction(temperature, humidity, sunlight, soil, fertilizer, watering):
    # Encode inputs
    try:
        soil_val = soil_enc.transform([str(soil).lower().strip()])[0]
    except ValueError:
        soil_val = 0

    try:
        fert_val = fert_enc.transform([str(fertilizer).lower().strip()])[0]
    except ValueError:
        fert_val = 0

    features = np.array([[
        float(temperature),
        float(humidity),
        float(sunlight),
        float(watering),
        float(soil_val),
        float(fert_val)
    ]])

    features_scaled = scaler.transform(features)

    pred_index   = model.predict(features_scaled)[0]
    probabilities = model.predict_proba(features_scaled)[0]
    confidence   = float(np.max(probabilities))
    stage        = label_enc.inverse_transform([pred_index])[0]

    # Stage-specific recommendations
    recs = []
    temp, hum, sun, water = float(temperature), float(humidity), float(sunlight), int(watering)

    if stage == "Seedling":
        if temp < 18 or temp > 24:  recs.append("Keep temperature between 18-24°C for seedling stage.")
        if hum < 65:                recs.append("Increase humidity to 65-85% for healthy seedling growth.")
        if sun > 7:                 recs.append("Reduce sunlight to 4-7 hours, seedlings are sensitive.")
        if water < 5:               recs.append("Water more frequently (5-7 times/week) for seedlings.")

    elif stage == "Vegetative":
        if temp < 22 or temp > 28:  recs.append("Maintain temperature at 22-28°C for vegetative growth.")
        if sun < 6:                 recs.append("Increase sunlight to at least 6 hours/day.")
        if fertilizer == "none":    recs.append("Add organic or chemical fertilizer to support leaf growth.")

    elif stage == "Flowering":
        if sun < 8:                 recs.append("Ensure 8-12 hours of sunlight to support flowering.")
        if hum > 60:                recs.append("Reduce humidity below 60% to prevent fungal issues during flowering.")
        if water > 5:               recs.append("Reduce watering slightly during flowering stage.")

    elif stage == "Fruiting":
        if sun < 9:                 recs.append("Fruiting needs 9-14 hours of sunlight for best yield.")
        if temp < 24 or temp > 30:  recs.append("Keep temperature at 24-30°C during fruiting.")
        if fertilizer == "none":    recs.append("Apply chemical or organic fertilizer to support fruit development.")

    recommendation = " ".join(recs) if recs else f"Conditions are optimal for {stage} stage. Maintain current levels."

    return {
        "growth_stage":   stage,
        "confidence":     confidence,
        "recommendation": recommendation
    }
