import os
import json

icons_dir = '.'
svg_dict = {}

for f in sorted(os.listdir(icons_dir)):
    if f.endswith('.svg'):
        name = os.path.splitext(f)[0].lower()
        path = os.path.join(icons_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            # 改行や不要な空白を詰めて辞書に格納
            clean_svg = " ".join(content.split())
            svg_dict[name] = clean_svg

print('const SVG_DICTIONARY = ' + json.dumps(svg_dict, indent=4, ensure_ascii=False) + ';')