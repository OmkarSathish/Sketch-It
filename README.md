# Sketch to Image Converter

## Abstract
This project is a web-based application that converts hand-drawn sketches into realistic images using computer vision and artificial intelligence. It combines OpenCV for edge detection and Stable Diffusion for image generation, providing a seamless experience from sketch to final image. The application features an interactive canvas where users can draw their sketches, and with a single click, transform them into detailed, AI-generated images.

## Project Structure
```
sketch-to-image/
├── utils/
│   └── image_processing.py
├── app.py
└── requirements.txt
```

## Detailed Working

### 1. User Interface (app.py)
The application uses Streamlit for the web interface, featuring:
- An interactive canvas using `st_canvas` for drawing
- A "Generate Image" button to trigger the conversion process
- A three-column display showing the original sketch, edge detection, and final generated image

### 2. Image Processing (utils/image_processing.py)
The image processing pipeline consists of two main functions:

#### preprocess_sketch(sketch_data)
- Converts the sketch to grayscale if needed
- Applies Gaussian blur to reduce noise
- Performs Canny edge detection
- Dilates the edges to make them more prominent

#### prepare_for_diffusion(edge_image)
- Converts the edge image to RGB format
- Resizes the image to 512x512 (standard size for Stable Diffusion)
- Normalizes the image values

### 3. Image Generation (app.py)
The image generation process involves:
- Loading the Stable Diffusion model using `load_model()`
- Converting the processed sketch to a PIL Image
- Generating the final image using Stable Diffusion with:
  - A default prompt: "A detailed, realistic image based on this sketch"
  - Strength parameter: 0.75
  - Guidance scale: 7.5

## How to Run Locally

### Prerequisites
- Python 3.8 or higher
- Virtual environment (virtualenv)
- Git

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd sketch-to-image
```

2. Create and activate a virtual environment:
```bash
python -m virtualenv venv
source venv/bin/activate  # On macOS/Linux
# or
.\venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
streamlit run app.py
```

### Additional Info
- The first run will download the Stable Diffusion model (several GB in size)
- A GPU is recommended for better performance, though the application will work on CPU
- The application will automatically open in your default web browser
- You can adjust the `strength` and `guidance_scale` parameters in `app.py` to modify the generation results

