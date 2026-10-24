#!/usr/bin/env python3
"""Rebuild deployed PNG/ICO assets from reviewed 1024px renders. Requires Pillow."""
import os
import shutil
import runpy
from pathlib import Path

from PIL import Image, ImageDraw

os.chdir(Path(__file__).resolve().parents[2])
DIGITAL = Path("docs/branding/digital")
WEBSITE = Path("website")
EXTENSION = Path("src/assets/icons")


def master(name):
    image = Image.open(DIGITAL / f"{name}-1024.png").convert("RGBA")
    if image.size != (1024, 1024):
        raise ValueError(f"{name} must be rendered at exactly 1024 × 1024")
    return image


def export(name, destination, size):
    master(name).resize((size, size), Image.Resampling.LANCZOS).save(destination)


for name in ["symbol-color", "symbol-white"]:
    export(name, DIGITAL / f"{name}-512.png", 512)
black = Image.new("RGBA", (1024, 1024), "black")
black.putalpha(master("symbol-color").getchannel("A"))
black.save(DIGITAL / "symbol-black-1024.png")

# Both deployed identities use Wingman; retain historical Push P masters above.
runpy.run_path("docs/branding/wingman/export-icons.py", run_name="__main__")
(DIGITAL / "head-snippet.html").write_text(
    '<link rel="icon" type="image/svg+xml" href="favicon.svg">\n'
    '<link rel="icon" href="favicon.ico" sizes="any">\n'
    '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
    '<link rel="manifest" href="site.webmanifest">\n'
)
horizontal = Image.open(DIGITAL / "horizontal-color.png").convert("RGBA")
background = Image.new("RGB", horizontal.size, "white")
background.paste(horizontal, mask=horizontal.getchannel("A"))
background.save(DIGITAL / "horizontal-on-white.jpg", quality=95)

# Pixel inspection: magnifications use nearest-neighbour, not new raster masters.
board = Image.new("RGB", (1000, 420), "#F5F4FF")
draw = ImageDraw.Draw(board)
draw.text((24, 18), "Push My Tabs / Wingman / #8167FF", fill="#0B0B10")
for index, color in enumerate(["#FFFFFF", "#0B0B10"]):
    left = 20 + index * 490
    draw.rectangle((left, 55, left + 470, 405), fill=color)
    for column, size in enumerate([16, 32, 48, 128]):
        icon = Image.open(EXTENSION / f"icon-{size}.png").convert("RGBA")
        x = left + 20 + column * 110
        board.paste(icon, (x, 100), icon)
        draw.text((x, 245), f"{size} px", fill="#8167FF")
        if size <= 32:
            zoom = icon.resize((size * 4, size * 4), Image.Resampling.NEAREST)
            board.paste(zoom, (x, 280), zoom)
board.save("docs/branding/size-check.png")
