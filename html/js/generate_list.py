#!/usr/bin/env python3
"""articles 配下の Markdown から list.json を自動生成する。

使い方:
    python3 generate_list.py            # このスクリプトの場所を基準に html/articles を走査
    python3 generate_list.py /path/to/html/articles

各 .md の先頭に YAML フロントマターでメタデータを書く:

    ---
    title: 記事タイトル
    date: 2026-11-16
    category: INFRASTRUCTURE
    summary: 一覧に出る要約
    thumbnail: /heroImage/pc.webp
    tags: [Docker, nginx]
    ---

生成される list.json の仕様（全カテゴリ共通）:
    id, date (YYYY-MM-DD), category, title, summary, thumbnail, file, tags
    - id はファイル名（拡張子なし）から自動。フロントマターで id: を書けば上書き可
    - file は /articles/<カテゴリフォルダ>/<ファイル名> を自動生成
    - date はドット区切り (2026.08.20) で書いても ISO 形式に正規化する
    - 日付の新しい順に並ぶ（openInspector の「最新記事」は先頭 = 最新になる）

フロントマターが無い / title が無い .md は警告を出してスキップする。
PyYAML は使わない（標準ライブラリのみ）。
"""
import json
import re
import sys
from pathlib import Path

REQUIRED = ("title",)


def parse_front_matter(text: str):
    """先頭の --- ... --- ブロックを dict にする。無ければ None。"""
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    block = text[3:end]
    data = {}
    current_key = None
    for raw in block.splitlines():
        line = raw.rstrip()
        if not line.strip() or line.strip().startswith("#"):
            continue
        m = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", line)
        if m:
            current_key = m.group(1)
            value = m.group(2).strip()
            if value.startswith("[") and value.endswith("]"):
                inner = value[1:-1].strip()
                data[current_key] = [v.strip().strip("'\"") for v in inner.split(",") if v.strip()] if inner else []
            elif value:
                data[current_key] = value.strip("'\"")
            else:
                data[current_key] = []  # 後続の "- item" 行を集める
            continue
        m = re.match(r"^\s*-\s+(.*)$", line)
        if m and current_key and isinstance(data.get(current_key), list):
            data[current_key].append(m.group(1).strip().strip("'\""))
    return data


def normalize_date(value: str) -> str:
    value = str(value).strip()
    m = re.match(r"^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$", value)
    if m:
        return f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
    return value


def main() -> int:
    if len(sys.argv) > 1:
        articles_dir = Path(sys.argv[1])
    else:
        articles_dir = Path(__file__).resolve().parent / "html" / "articles"
    if not articles_dir.is_dir():
        print(f"articles フォルダが見つかりません: {articles_dir}")
        return 1

    warnings = []
    for category_dir in sorted(p for p in articles_dir.iterdir() if p.is_dir()):
        entries = []
        for md in sorted(category_dir.glob("*.md")):
            meta = parse_front_matter(md.read_text(encoding="utf-8"))
            if meta is None:
                warnings.append(f"スキップ（フロントマターなし）: {category_dir.name}/{md.name}")
                continue
            missing = [k for k in REQUIRED if not meta.get(k)]
            if missing:
                warnings.append(f"スキップ（{', '.join(missing)} が空）: {category_dir.name}/{md.name}")
                continue
            tags = meta.get("tags", [])
            if isinstance(tags, str):
                tags = [tags]
            entries.append({
                "id": str(meta.get("id") or md.stem),
                "date": normalize_date(meta.get("date", "")),
                "category": str(meta.get("category") or category_dir.name.upper()),
                "title": str(meta["title"]),
                "summary": str(meta.get("summary", "")),
                "thumbnail": str(meta.get("thumbnail") or meta.get("image", "")),
                "file": f"/articles/{category_dir.name}/{md.name}",
                "tags": tags,
            })
        entries.sort(key=lambda e: e["date"], reverse=True)
        out = category_dir / "list.json"
        out.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{category_dir.name}: {len(entries)} 件 -> {out}")

    for w in warnings:
        print("警告:", w)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
