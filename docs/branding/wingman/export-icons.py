#!/usr/bin/env python3
"""Export extension and web icons from reviewed Wingman renders (Pillow)."""
from pathlib import Path
import shutil
from PIL import Image

HERE = Path(__file__).resolve().parent
ICONS = HERE.parents[2] / "src/assets/icons"
WEBSITE = HERE.parents[2] / "website"
DIGITAL = HERE.parent / "digital"


def export():
    with Image.open(HERE / "extension-1024.png") as master:
        if master.size != (1024, 1024) or master.mode != "RGBA":
            raise ValueError("Extension master must be a 1024 px RGBA render")
        for size in (32, 48, 128, 1024):
            master.resize((size, size), Image.Resampling.LANCZOS).save(ICONS / f"icon-{size}.png")
    with Image.open(HERE / "extension-small-16.png") as small:
        if small.size != (16, 16) or small.mode != "RGBA":
            raise ValueError("Small extension master must be a 16 px RGBA render")
    shutil.copyfile(HERE / "extension-small-16.png", ICONS / "icon-16.png")
    shutil.copyfile(HERE / "wingman-extension.svg", ICONS / "logo.svg")
    shutil.copyfile(HERE / "wingman-app-dark.svg", WEBSITE / "logo.svg")
    shutil.copyfile(HERE / "wingman-app-small.svg", WEBSITE / "favicon.svg")
    with Image.open(HERE / "app-dark-1024.png") as master:
        for name, size in (("logo-128", 128), ("apple-touch-icon", 180),
                           ("icon-192", 192), ("icon-512", 512)):
            master.resize((size, size), Image.Resampling.LANCZOS).save(WEBSITE / f"{name}.png")
        # Fill the entire tile; keep the penguin inside the maskable safe circle.
        maskable = Image.new("RGBA", (512, 512), "#0B0B10")
        inset = master.resize((288, 288), Image.Resampling.LANCZOS)
        maskable.alpha_composite(inset, (112, 112))
        maskable.convert("RGB").save(WEBSITE / "maskable-512.png")
        frames = {size: master.resize((size, size), Image.Resampling.LANCZOS)
                  for size in (32, 48)}
    with Image.open(HERE / "app-dark-small-16.png") as small:
        frames[16] = small.copy()
    for size, image in frames.items():
        image.save(DIGITAL / f"favicon-{size}.png")
    # Supply individual frames so the ICO retains the independent 16 px drawing.
    frames[48].save(WEBSITE / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
                    append_images=[frames[16], frames[32]], bitmap_format="png")
    shutil.copyfile(DIGITAL / "favicon-32.png", WEBSITE / "favicon-32.png")
    for name in ("favicon.svg", "favicon.ico", "favicon-32.png", "apple-touch-icon.png",
                 "icon-192.png", "icon-512.png", "maskable-512.png", "site.webmanifest"):
        shutil.copyfile(WEBSITE / name, DIGITAL / name)


if __name__ == "__main__":
    export()
