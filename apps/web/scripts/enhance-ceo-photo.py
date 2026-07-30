"""Prepare a higher-resolution CEO asset for sharp hero delivery."""

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(
    r"C:\Users\oweb\Desktop\OWEB software Projects\federation website\apps\web"
)
SRC = ROOT / "src" / "assets" / "ceo.png"
OUT = SRC


def main() -> None:
    img = Image.open(SRC).convert("RGB")
    w, h = img.size
    print(f"source: {w}x{h}")

    # 2x LANCZOS gives Next.js enough pixels for retina hero widths.
    target = (w * 2, h * 2)
    up = img.resize(target, Image.Resampling.LANCZOS)

    # Mild clarity pass — keep natural, avoid crunchy oversharpening.
    up = up.filter(
        ImageFilter.UnsharpMask(radius=1.4, percent=110, threshold=2)
    )
    up = ImageEnhance.Sharpness(up).enhance(1.08)
    up = ImageEnhance.Contrast(up).enhance(1.04)
    up = ImageEnhance.Color(up).enhance(1.03)

    up.save(OUT, format="PNG", optimize=True, compress_level=6)
    print(f"saved: {OUT} ({OUT.stat().st_size} bytes) {up.size[0]}x{up.size[1]}")


if __name__ == "__main__":
    main()
