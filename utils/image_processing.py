import cv2
import numpy as np


def preprocess_sketch(sketch_data):
    """
    Preprocess the sketch data for edge detection
    """
    # Convert to grayscale if not already
    if len(sketch_data.shape) == 3:
        sketch_data = cv2.cvtColor(sketch_data, cv2.COLOR_RGB2GRAY)

    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(sketch_data, (5, 5), 0)

    # Apply Canny edge detection
    edges = cv2.Canny(blurred, 50, 150)

    # Dilate the edges to make them more prominent
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=1)

    return dilated


def prepare_for_diffusion(edge_image):
    """
    Prepare the edge image for stable diffusion
    """
    # Ensure the image is in RGB format
    if len(edge_image.shape) == 2:
        edge_image = cv2.cvtColor(edge_image, cv2.COLOR_GRAY2RGB)

    # Resize to 512x512 (common size for stable diffusion)
    edge_image = cv2.resize(edge_image, (512, 512))

    # Normalize the image
    edge_image = edge_image.astype(np.float32) / 255.0

    return edge_image
