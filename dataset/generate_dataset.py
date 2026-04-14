import pandas as pd
import numpy as np
import os

np.random.seed(42)

# Each stage has CLEAR, NON-OVERLAPPING ranges for strong feature-label relationship
# Tomato growth stages based on real agronomic data
stages = {
    "Seedling": {
        "temp":    (18, 24),
        "humidity":(65, 85),
        "sunlight":(4,  7),
        "watering":(5,  7),   # frequent watering, young plant
        "soil":    ["loamy", "sandy"],
        "fert":    ["none", "organic"],
        "samples": 300
    },
    "Vegetative": {
        "temp":    (22, 28),
        "humidity":(55, 70),
        "sunlight":(6,  9),
        "watering":(4,  6),
        "soil":    ["loamy", "clay"],
        "fert":    ["organic", "chemical"],
        "samples": 300
    },
    "Flowering": {
        "temp":    (20, 26),
        "humidity":(45, 60),
        "sunlight":(8,  12),
        "watering":(3,  5),   # less water during flowering
        "soil":    ["loamy"],
        "fert":    ["chemical", "organic"],
        "samples": 300
    },
    "Fruiting": {
        "temp":    (24, 30),
        "humidity":(50, 65),
        "sunlight":(9,  14),
        "watering":(4,  6),
        "soil":    ["loamy", "clay"],
        "fert":    ["chemical", "organic"],
        "samples": 300
    }
}

rows = []
for stage, cfg in stages.items():
    n = cfg["samples"]
    temps     = np.random.uniform(cfg["temp"][0],     cfg["temp"][1],     n)
    humids    = np.random.uniform(cfg["humidity"][0],  cfg["humidity"][1],  n)
    sunlights = np.random.uniform(cfg["sunlight"][0],  cfg["sunlight"][1],  n)
    waterings = np.random.randint(cfg["watering"][0],  cfg["watering"][1]+1, n)
    soils     = np.random.choice(cfg["soil"], n)
    ferts     = np.random.choice(cfg["fert"], n)

    for i in range(n):
        rows.append({
            "Temperature":    round(float(temps[i]), 1),
            "Humidity":       round(float(humids[i]), 1),
            "Sunlight_Hours": round(float(sunlights[i]), 1),
            "Water_Frequency":int(waterings[i]),
            "Soil_Type":      soils[i],
            "Fertilizer_Type":ferts[i],
            "Growth_Stage":   stage
        })

df = pd.DataFrame(rows).sample(frac=1, random_state=42).reset_index(drop=True)

out = os.path.join(os.path.dirname(__file__), "tomato_growth_dataset.csv")
df.to_csv(out, index=False)
print(f"Dataset created: {out}")
print(f"Total rows: {len(df)}")
print(df["Growth_Stage"].value_counts())
