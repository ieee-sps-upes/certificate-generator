from PIL import Image, ImageDraw, ImageFont
import os
from io import BytesIO

def draw_centered_text(draw, text, y, font, image_width, fill=(0, 0, 0)):
    """
    Helper function to draw horizontally centered text
    """
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]

    x = (image_width - text_width) // 2
    y = 770
    draw.text((x, y), text, fill=fill, font=font)


def generate_certificate_image(participant_name):
    """
    Create a certificate PNG in memory and return a BytesIO object.
    """
    # Defensive check
    if participant_name.startswith("HYPE"):
        raise ValueError("participant_name must be a real name, not a Hype ID")

    # Ensure template exists
    if not os.path.exists("template.png"):
        img = Image.new("RGB", (1000, 700), color="white")
        img.save("template.png")

    # Load template
    img = Image.open("template.png")
    draw = ImageDraw.Draw(img)
    img_width, _ = img.size

    # Load fonts
    try:
        # Elegant script font for participant name
        font_large = ImageFont.truetype("GreatVibes-Regular.ttf", 90)
    except:
        try:
            font_large = ImageFont.truetype("newfont.ttf", 60)
        except:
            font_large = ImageFont.load_default()

    # ---- Certificate Content ----

    # Participant Name (CENTERED) — Title Case for script font
    draw_centered_text(
        draw,
        participant_name.title(),
        y=300,
        font=font_large,
        image_width=img_width,
        fill=(10, 36, 99)  # Deep IEEE navy blue — matches certificate style
    )

    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    return img_io
