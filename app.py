import streamlit as st
import numpy as np
from PIL import Image
import torch
from diffusers import StableDiffusionImg2ImgPipeline
from streamlit_drawable_canvas import st_canvas
from utils.image_processing import preprocess_sketch, prepare_for_diffusion


def load_model():
    # Load the stable diffusion model
    model_id = "runwayml/stable-diffusion-v1-5"
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float32
    ).to(device)
    return pipe


def main():
    st.title("Sketch to Image Converter")

    # Initialize the canvas with st_canvas instead of st.canvas
    canvas_result = st_canvas(
        fill_color="white",
        stroke_width=3,
        stroke_color="black",
        background_color="white",
        height=400,
        width=400,
        drawing_mode="freedraw",
        key="canvas"
    )

    if canvas_result.image_data is not None:
        if st.button("Generate Image"):
            with st.spinner("Processing sketch..."):
                # Process the sketch
                sketch_array = np.array(canvas_result.image_data)
                edges = preprocess_sketch(sketch_array)
                prepared_image = prepare_for_diffusion(edges)

                # Convert to PIL Image
                input_image = Image.fromarray(
                    (prepared_image * 255).astype(np.uint8))

                # Load model
                pipe = load_model()

                # Generate image
                prompt = "A detailed, realistic image based on this sketch"
                result = pipe(
                    prompt=prompt,
                    image=input_image,
                    strength=0.75,
                    guidance_scale=7.5
                ).images[0]

                # Display results
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.image(sketch_array, caption="Original Sketch")
                with col2:
                    st.image(edges, caption="Edge Detection")
                with col3:
                    st.image(result, caption="Generated Image")


if __name__ == "__main__":
    main()
