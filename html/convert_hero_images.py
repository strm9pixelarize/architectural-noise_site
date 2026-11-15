#!/usr/bin/env python3
"""ヒーロー画像をリサイズして WebP 化し、変換後に元ファイルを削除するスクリプト。

使い方:
    pip install Pillow
    python3 convert_hero_images.py /path/to/html/heroImage

- 変換が成功し、生成した .webp が開けることを確認してから元ファイルを削除する。
- 元を残したい場合は --keep を付ける（その場合は上書きせず .webp だけ作る）。
- 幅が MAX_WIDTH を超える画像だけ縮小する（拡大はしない）。
"""
import sys
from pathlib import Path

from PIL import Image

MAX_WIDTH = 1920      # ヒーロー表示の実寸に合わせて調整する
WEBP_QUALITY = 82     # 80〜85 が画質と容量のバランスが良い
TARGET_SUFFIXES = {".jpg", ".jpeg", ".png"}


def verified_webp(path: Path) -> bool:
    """生成した WebP が実際に開けるか確認する。"""
    try:
        with Image.open(path) as im:
            im.verify()
        return path.stat().st_size > 0
    except Exception:
        return False


def convert(src: Path, keep_original: bool) -> None:
    dst = src.with_suffix(".webp")
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        print(f"skip (up to date): {dst.name}")
    else:
        with Image.open(src) as im:
            im = im.convert("RGB")
            if im.width > MAX_WIDTH:
                height = round(im.height * MAX_WIDTH / im.width)
                im = im.resize((MAX_WIDTH, height), Image.LANCZOS)
            im.save(dst, "WEBP", quality=WEBP_QUALITY, method=6)
        if not verified_webp(dst):
            print(f"ERROR: conversion failed, original kept: {src.name}")
            return
        before = src.stat().st_size
        after = dst.stat().st_size
        print(f"{src.name}: {before/1e6:.1f} MB -> {dst.name}: {after/1e6:.2f} MB "
              f"({after/before*100:.0f}%)")

    if not keep_original:
        src.unlink()
        print(f"  deleted original: {src.name}")


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--keep"]
    keep_original = "--keep" in sys.argv
    if len(args) != 1:
        sys.exit("usage: python3 convert_hero_images.py [--keep] <image_dir>")
    target_dir = Path(args[0])
    if not target_dir.is_dir():
        sys.exit(f"not a directory: {target_dir}")
    for src in sorted(target_dir.rglob("*")):
        if src.is_file() and src.suffix.lower() in TARGET_SUFFIXES:
            convert(src, keep_original)


if __name__ == "__main__":
    main()
