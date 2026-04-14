import pandas as pd
import pickle
import os
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "dataset", "tomato_growth_dataset.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "growth_model.pkl")

# ── Load & encode ───────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)

soil_enc = LabelEncoder()
fert_enc = LabelEncoder()
label_enc = LabelEncoder()

df["Soil_Type"]       = soil_enc.fit_transform(df["Soil_Type"].str.lower().str.strip())
df["Fertilizer_Type"] = fert_enc.fit_transform(df["Fertilizer_Type"].str.lower().str.strip())
df["Growth_Stage"]    = label_enc.fit_transform(df["Growth_Stage"])

X = df[["Temperature", "Humidity", "Sunlight_Hours", "Water_Frequency", "Soil_Type", "Fertilizer_Type"]]
y = df["Growth_Stage"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

# ── Find best K ─────────────────────────────────────────────────
print("Finding best K...")
best_k, best_acc = 1, 0
for k in range(1, 21):
    scores = cross_val_score(KNeighborsClassifier(n_neighbors=k), X_scaled, y, cv=5)
    avg = scores.mean()
    print(f"  K={k:2d}  CV Accuracy: {avg*100:.1f}%")
    if avg > best_acc:
        best_acc = avg
        best_k = k

# ── Train final KNN ─────────────────────────────────────────────
knn = KNeighborsClassifier(n_neighbors=best_k)
knn.fit(X_train, y_train)

test_acc = accuracy_score(y_test, knn.predict(X_test))
print(f"\n✅ Best K={best_k}")
print(f"   CV Accuracy:   {best_acc*100:.1f}%")
print(f"   Test Accuracy: {test_acc*100:.1f}%")
print("\nClassification Report:")
print(classification_report(y_test, knn.predict(X_test), target_names=label_enc.classes_))

# ── Save bundle ─────────────────────────────────────────────────
bundle = {
    "model":     knn,
    "scaler":    scaler,
    "soil_enc":  soil_enc,
    "fert_enc":  fert_enc,
    "label_enc": label_enc,
}

with open(MODEL_PATH, "wb") as f:
    pickle.dump(bundle, f)

print(f"\nModel saved → {MODEL_PATH}")
