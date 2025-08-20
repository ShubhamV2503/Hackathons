import os
import cv2
import numpy as np
import tensorflow as tf
import base64
from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
from pydicom import dcmread
from io import BytesIO
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static', template_folder='templates')

# Load pre-trained autoencoder model
MODEL_PATH = "models/autoencoder_noise.h5"

if os.path.exists(MODEL_PATH):
    autoencoder = load_model(MODEL_PATH)
else:
    raise FileNotFoundError(f"Model file '{MODEL_PATH}' not found. Please check the path.")

# Function to calculate SNR for original image
def calculate_original_snr(image):
    # Estimate signal as the mean of the image
    signal = np.mean(image)
    # Estimate noise as the standard deviation of the image
    noise = np.std(image)
    if noise == 0:
        return float('inf')
    # Return SNR in dB, scaled to avoid overly high values
    return 10 * np.log10(signal / noise)

# Function to calculate SNR for denoised image
def calculate_denoised_snr(original, denoised):
    # Signal power from the original image
    signal_power = np.mean(original ** 2)
    # Noise power as the mean squared difference between original and denoised
    noise_power = np.mean((original - denoised) ** 2)
    if noise_power == 0:
        return float('inf')
    return 10 * np.log10(signal_power / noise_power)

# Function to load and preprocess image
def load_image(file):
    ext = os.path.splitext(file.filename)[-1].lower()
    if ext == ".dcm":
        dicom = dcmread(file)
        img = dicom.pixel_array.astype(np.float32)
    else:
        file_bytes = np.asarray(bytearray(file.read()), dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE).astype(np.float32)

    img = cv2.resize(img, (200, 200))  # Resize image for model
    img = np.repeat(img[..., np.newaxis], 3, -1)  # Convert grayscale to 3-channel
    img = img / 255.0  # Normalize to [0,1]
    return img

# Function to denoise image
def denoise_image(model, image):
    image_expanded = np.expand_dims(image, axis=0)  # Add batch dimension
    denoised_image = model.predict(image_expanded)
    return np.squeeze(denoised_image)  # Remove batch dimension

# Function to convert image to Base64
def image_to_base64(image):
    _, buffer = cv2.imencode('.png', (image * 255).astype(np.uint8))
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_image():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    original_image = load_image(file)
    # Calculate SNR for original image
    original_snr = calculate_original_snr(original_image[..., 0])  # Use first channel
    original_base64 = image_to_base64(original_image)
    
    # Store original image in memory for denoising comparison
    app.config['original_image'] = original_image
    
    return jsonify({
        "original_image": original_base64,
        "original_snr": round(original_snr, 2) if original_snr != float('inf') else "∞"
    })

@app.route("/denoise", methods=["POST"])
def denoise():
    if "image" not in request.json:
        return jsonify({"error": "No image data provided"}), 400
    
    # Extract base64 image and convert back to numpy array
    image_data = request.json["image"].split(",")[1]
    img_bytes = base64.b64decode(image_data)
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255.0
    img = cv2.resize(img, (200, 200))
    img = np.repeat(img[..., np.newaxis], 3, -1)

    # Denoise the image
    denoised_image = denoise_image(autoencoder, img)
    
    # Get the original image from app config
    original_image = app.config.get('original_image')
    if original_image is None:
        return jsonify({"error": "Original image not found"}), 400
    
    # Calculate SNR for denoised image
    denoised_snr = calculate_denoised_snr(original_image[..., 0], denoised_image[..., 0])  # Use first channel
    denoised_base64 = image_to_base64(denoised_image)
    
    return jsonify({
        "denoised_image": denoised_base64,
        "denoised_snr": round(denoised_snr, 2) if denoised_snr != float('inf') else "∞"
    })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
