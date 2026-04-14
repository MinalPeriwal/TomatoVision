import numpy as np
import json
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# =========================
# Load model
# =========================
model = load_model("../models/best_model.keras")

# =========================
# Load class mapping
# =========================
with open("../models/class_indices.json", "r") as f:
    class_indices = json.load(f)

# Convert index → class name
class_names = {v: k for k, v in class_indices.items()}

# =========================
# Function to predict image
# =========================
def predict_image(img_path):

    # Load image
    img = image.load_img(img_path, target_size=(224,224))

    # Convert to array
    img_array = image.img_to_array(img)

    # SAME preprocessing as training
    img_array = img_array / 255.0

    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)

    # Prediction
    predictions = model.predict(img_array)

    # Get highest probability class
    predicted_index = np.argmax(predictions)

    # Get class name
    predicted_class = class_names[predicted_index]

    # Confidence
    confidence = np.max(predictions)

    return predicted_class, confidence


# =========================
# Test (manual)
# =========================
if __name__ == "__main__":
    img_path = "test2.jpg"

    pred_class, conf = predict_image(img_path)

    print(f"Prediction: {pred_class}")
    print(f"Confidence: {conf:.2f}")