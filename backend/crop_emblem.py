from PIL import Image

def crop_model_and_v():
    img = Image.open('../frontend/public/logo.png').convert("RGBA")
    w, h = img.size
    print(f"Original size: {w}x{h}")

    # The circular/floral V emblem with the model is in the upper ~68% of the image.
    # Text "VANDANA CREATIONS" starts around y = 690-720.
    # Let's crop the top section containing only the model and the V graphic.
    emblem_crop = img.crop((50, 40, w - 50, 680))
    
    # Save as high-res PNG
    emblem_crop.save('../frontend/public/logo-emblem.png', 'PNG')
    print(f"Saved logo-emblem.png with size: {emblem_crop.size}")

if __name__ == "__main__":
    crop_model_and_v()
