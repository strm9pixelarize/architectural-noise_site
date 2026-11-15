#!/usr/bin/env python3
"""favicon.ico を標準サイズだけに作り直して軽量化するスクリプト。

使い方:
    python3 make_favicon.py /path/to/html/favicon.ico

- 元ファイルは favicon.ico.bak として残す。
- 16/32/48px の3サイズ入り ICO にする（通常は数KBになる）。
"""
import sys
from pathlib import Path

from PIL import Image


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("usage: python3 make_favicon.py <favicon.ico>")
    path = Path(sys.argv[1])
    backup = path.with_suffix(".ico.bak")
    if not backup.exists():
        backup.write_bytes(path.read_bytes())

    with Image.open(path) as im:
        im = im.convert("RGBA")
        # 正方形でない場合は中央で正方形に切り抜く
        side = min(im.size)
        left = (im.width - side) // 2
        top = (im.height - side) // 2
        im = im.crop((left, top, left + side, top + side))
        im.save(path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    print(f"{path.name}: {backup.stat().st_size/1e3:.0f} KB -> "
          f"{path.stat().st_size/1e3:.1f} KB (backup: {backup.name})")


if __name__ == "__main__":
    main()
