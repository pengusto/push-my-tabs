#!/usr/bin/env python3
"""Export only the extension icons from reviewed Wingman renders (Pillow)."""
from pathlib import Path
import shutil
from PIL import Image

HERE = Path(__file__).resolve().parent
ICONS = HERE.parents[2] / "src/assets/icons"


def export():
    with Image.open(HERE / "app-dark-1024.png") as master:
        if master.size != (1024, 1024) or master.mode != "RGBA":
            raise ValueError("Wingman master must be a 1024 px RGBA render")
        for size in (32, 48, 128, 1024):
            master.resize((size, size), Image.Resampling.LANCZOS).save(ICONS / f"icon-{size}.png")
    # Preserve the separately drawn, pixel-aligned cut; do not shrink the full face.
    with Image.open(HERE / "app-dark-small-16.png") as small:
        if small.size != (16, 16) or small.mode != "RGBA":
            raise ValueError("Small Wingman master must be a 16 px RGBA render")
    shutil.copyfile(HERE / "app-dark-small-16.png", ICONS / "icon-16.png")
    shutil.copyfile(HERE / "wingman-app-dark.svg", ICONS / "logo.svg")


if __name__ == "__main__":
    export()
