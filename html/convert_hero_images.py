#!/usr/bin/env python3
"""ヒーロー画像をリサイズして WebP 化するスクリプト。

使い方:
    pip install Pillow
    python3 convert_hero_images.py /path/to/html/heroImage

- 元ファイルは上書きしない。同じフォルダに <名前>.webp を作る。
- 幅が MAX_WIDTH を超える画像だけ縮小する（拡大はしない）。
- 既に同じ名前の .webp があり、元より新しい場合はスキップする。
"""
import sys
from pathlib import Path

from PIL import Image

MAX_WIDTH = 1920      # ヒーロー表示の実寸に合わせて調整する
WEBP_QUALITY = 82     # 80〜85 が画質と容量のバランスが良い
TARGET_SUFFIXES = {".jpg", ".jpeg", ".png"}


def convert(src: Path) -> None:
    dst = src.with_suffix(".webp")
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        print(f"skip (up to date): {dst.name}")
        return

    with Image.open(src) as im:
        im = im.convert("RGB")
        if im.width > MAX_WIDTH:
            height = round(im.height * MAX_WIDTH / im.width)
            im = im.resize((MAX_WIDTH, height), Image.LANCZOS)
        im.save(dst, "WEBP", quality=WEBP_QUALITY, method=6)

    before = src.stat().st_size
    after = dst.stat().st_size
    print(f"{src.name}: {before/1e6:.1f} MB -> {dst.name}: {after/1e6:.2f} MB "
          f"({after/before*100:.0f}%)")


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("usage: python3 convert_hero_images.py <image_dir>")
    target_dir = Path(sys.argv[1])
    if not target_dir.is_dir():
        sys.exit(f"not a directory: {target_dir}")
    for src in sorted(target_dir.iterdir()):
        if src.suffix.lower() in TARGET_SUFFIXES:
            convert(src)


if __name__ == "__main__":
    main()
