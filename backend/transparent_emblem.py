from PIL import Image

def make_emblem_transparent():
    img = Image.open('../frontend/public/logo-emblem.png').convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # If the pixel is pure/near white (background of logo)
        if item[0] > 245 and item[1] > 245 and item[2] > 245:
            new_data.append((255, 255, 255, 0))  # Fully transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save('../frontend/public/logo-emblem.png', "PNG")
    print("[SUCCESS] logo-emblem.png saved with transparent background (only Model & V graphic)!")

if __name__ == "__main__":
    make_emblem_transparent()
