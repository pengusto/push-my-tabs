"""Draw the README's schematic animation from shapes and text (requires Pillow)."""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--font', required=True, help='Path to a bold TrueType font')
args = parser.parse_args()
OUT = Path(__file__).parent
BG, PANEL, TAB, INK, MUTED, ACCENT = '#11131e', '#1b1e2b', '#303648', '#f6f4ff', '#d8d3e8', '#aa8cff'
fonts = {n: ImageFont.truetype(args.font, n) for n in [40, 44, 48]}


def center(draw, text, y, size=44, color=INK):
    box = draw.textbbox((0, 0), text, font=fonts[size])
    assert box[2] - box[0] <= 552, text
    draw.text(((600 - (box[2] - box[0])) / 2, y), text, font=fonts[size], fill=color)


def frame(scene, after):
    im = Image.new('RGB', (600, 620), BG)
    d = ImageDraw.Draw(im)
    title, command = [('Horizontal tabs', 'RIGHT → Switch'), ('Vertical tabs', 'DOWN → Switch'), ('Horizontal tabs', 'DOWN → Move')][scene]
    center(d, title, 28)
    center(d, command, 98, 44, ACCENT)
    d.rounded_rectangle((24, 186, 576, 488), radius=24, fill=PANEL, outline='#555b70', width=2)
    order = [1, 2, 3]
    if scene == 2 and after:
        order = [1, 3, 2]
    active = 3 if after and scene != 2 else 2
    for idx, number in enumerate(order):
        if scene == 1:
            x, y, w, h = 46, 204 + idx * 88, 184, 74
        else:
            x, y, w, h = 42 + idx * 176, 212, 164, 84
        d.rounded_rectangle((x, y, x+w, y+h), radius=12, fill=ACCENT if number == active else TAB)
        label = str(number)
        d.text((x+w/2-14, y+10), label, font=fonts[48], fill=BG if number == active else INK)
    if scene == 1:
        d.text((268, 306), str(active), font=fonts[48], fill=ACCENT)
    else:
        center(d, 'Active tab: '+str(active), 362, 40, MUTED)
    center(d, ['1 / 3', '2 / 3', '3 / 3'][scene] + ' · Illustration', 532, 40, MUTED)
    return im


frames = [frame(scene, after) for scene in range(3) for after in [False, True]]
frames[1].save(OUT/'tabs-demo-poster.png')
frames[0].save(OUT/'tabs-demo.gif', save_all=True, append_images=frames[1:], duration=[1200, 2000]*3, loop=0, optimize=False, disposal=2)
print('Rendered six frames, 600 × 620; minimum label size: 40 px.')
