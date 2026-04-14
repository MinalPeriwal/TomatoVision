import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Load best model
model = tf.keras.models.load_model("models/best_model.keras")

# Path to test dataset
test_dir = "dataset/test"

# Preprocessing
test_gen = ImageDataGenerator(rescale=1./255)

test_data = test_gen.flow_from_directory(
    test_dir,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    shuffle=False
)

# Evaluate model
loss, accuracy = model.evaluate(test_data)

print("✅ Test Accuracy:", accuracy)