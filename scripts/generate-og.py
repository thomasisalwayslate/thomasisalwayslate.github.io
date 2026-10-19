#!/usr/bin/env python3
"""Generate Open Graph share cards.

Produces one card per published note, plus the two standing cards for the
blog index and the id card page. Run via `npm run og` after adding or
retitling a post, then commit the results: the deploy action installs only
Node, so these are built here rather than in CI.
"""

import re
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
NOTES = ROOT / "src/data/notes"
ASSETS = ROOT / "public/assets"
OUT = ASSETS / "og"

W, H = 1200, 630
BG = (250, 250, 250, 255)
BORDER = (172, 172, 172, 255)
INK = (18, 18, 18, 255)
MUTED = (102, 102, 102, 255)
SOFT = (212, 216, 224, 255)
DOT = (54, 54, 54, 26)

BOLD = "/System/Library/Fonts/HelveticaNeue.ttc"
MONO = "/System/Library/Fonts/Menlo.ttc"

CX0, CY0, CX1, CY1 = 100, 78, W - 100, H - 78
PAD = 54
INNER = (CX1 - PAD) - (CX0 + PAD)


def frame():
    img = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(img)
    for y in range(0, H, 7):
        for x in range(0, W, 7):
            d.point((x, y), fill=DOT)
    d.rectangle([CX0, CY0, CX1, CY1], fill=BG, outline=BORDER, width=1)
    return img, d


def avatar(size):
    # dithered source is already dark-on-light, which suits the light card
    av = Image.open(ASSETS / "avatar-dither.png").convert("RGB")
    return av.resize((size, size), Image.LANCZOS).convert("RGBA")


def wrap(d, text, font, width, max_lines):
    """Greedy wrap measured against the real font, ellipsing any overflow."""
    words, lines, cur = text.split(), [], ""
    for word in words:
        trial = f"{cur} {word}".strip()
        if d.textlength(trial, font=font) <= width or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
            if len(lines) == max_lines:
                break
    if cur and len(lines) < max_lines:
        lines.append(cur)
    if len(lines) == max_lines and len(" ".join(lines).split()) < len(words):
        while lines[-1] and d.textlength(lines[-1] + "...", font=font) > width:
            lines[-1] = lines[-1].rsplit(" ", 1)[0]
        lines[-1] += "..."
    return lines


def compose(out, ident, desc, meta, title_img=None, title_text=None):
    img, d = frame()
    tx = CX0 + PAD

    AV = 52
    ay = CY0 + PAD
    img.alpha_composite(avatar(AV), (tx, ay))
    d.rectangle([tx, ay, tx + AV - 1, ay + AV - 1], outline=BORDER, width=1)
    f_ident = ImageFont.truetype(MONO, 23)
    ib = d.textbbox((0, 0), ident, font=f_ident)
    d.text((tx + AV + 18 - ib[0], ay + (AV - (ib[3] - ib[1])) // 2 - ib[1]),
           ident, font=f_ident, fill=MUTED)

    # footer pinned to the bottom, the title block fills what remains
    div_y = CY1 - PAD - 44
    d.line([tx, div_y, CX1 - PAD, div_y], fill=SOFT, width=1)
    f_meta = ImageFont.truetype(MONO, 22)
    mb = d.textbbox((0, 0), meta, font=f_meta)
    d.text((tx - mb[0], div_y + 22 - mb[1]), meta, font=f_meta, fill=MUTED)

    f_desc = ImageFont.truetype(MONO, 23)
    desc_lines = wrap(d, desc, f_desc, INNER, 2)
    desc_lh = 31
    desc_block = desc_lh * len(desc_lines)
    desc_y = div_y - 26 - desc_block

    title_top = ay + AV + 34
    budget = desc_y - 24 - title_top

    if title_img:
        src = Image.open(title_img).convert("RGBA")
        white = Image.new("RGBA", src.size, INK)
        src = Image.composite(white, Image.new("RGBA", src.size, (0, 0, 0, 0)), src.split()[3])
        tw = 430
        src = src.resize((tw, round(src.height * tw / src.width)), Image.NEAREST)
        img.alpha_composite(src, (tx, title_top + (budget - src.height) // 2))
    else:
        # step the size down until the wrapped title fits its budget, rather
        # than letting a long title ride up into the identity row
        for size in (76, 70, 64, 58, 52, 46, 42):
            f_title = ImageFont.truetype(BOLD, size, index=1)
            lines = wrap(d, title_text, f_title, INNER, 3)
            lh = round(size * 1.16)
            if lh * len(lines) <= budget:
                break
        y = title_top + (budget - lh * len(lines)) // 2
        for line in lines:
            tb = d.textbbox((0, 0), line, font=f_title)
            d.text((tx - tb[0], y - tb[1]), line, font=f_title, fill=INK)
            y += lh

    y = desc_y
    for line in desc_lines:
        db = d.textbbox((0, 0), line, font=f_desc)
        d.text((tx - db[0], y - db[1]), line, font=f_desc, fill=MUTED)
        y += desc_lh

    out.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out)
    print(f"  {out.relative_to(ROOT)}")


def parse_note(path):
    raw = path.read_text()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
    if not m:
        return None
    fm, body = m.group(1), m.group(2)

    def field(name):
        hit = re.search(rf"^{name}:\s*(.+?)\s*$", fm, re.M)
        return hit.group(1).strip().strip('"').strip("'") if hit else ""

    if field("draft").lower() == "true":
        return None
    words = len([w for w in body.split() if w.strip()])
    return {
        "id": path.stem,
        "title": field("title"),
        "summary": field("summary"),
        "date": field("date"),
        "read": max(1, round(words / 200)),
    }


def main():
    print("standing cards:")
    compose(ASSETS / "og-card.png",
            ident="thomasisalwayslate / dithered",
            title_img=ASSETS / "dithered-wordmark-transparent.png",
            desc="research notes, build logs, experiments",
            meta="RSS  ·  github.com/thomasisalwayslate  ·  2026")
    compose(ASSETS / "og-card-id.png",
            ident="thomasisalwayslate",
            title_text="thomas",
            desc="27 · ai engineer",
            meta="github  ·  linkedin  ·  twitter  ·  dithered")

    print("article cards:")
    notes = sorted(p for p in NOTES.glob("*.md"))
    built = 0
    for path in notes:
        note = parse_note(path)
        if not note:
            print(f"  skipped {path.stem} (draft)")
            continue
        try:
            d = date.fromisoformat(note["date"])
            stamp = d.strftime("%d/%m/%Y")
        except ValueError:
            stamp = note["date"]
        compose(OUT / f"{note['id']}.png",
                ident="thomasisalwayslate / dithered",
                title_text=note["title"],
                desc=note["summary"],
                meta=f"{stamp}  ·  {note['read']} MIN READ  ·  thomasisalwayslate")
        built += 1
    print(f"\n{built} article card(s), 2 standing card(s)")


if __name__ == "__main__":
    main()
