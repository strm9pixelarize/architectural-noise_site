import xml.etree.ElementTree as ET
from pathlib import Path

SVG_NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', SVG_NS)

def generate_svg_sprite(svgs_dir, output_filepath):
    svgs_path = Path(svgs_dir).resolve()
    output_path = Path(output_filepath).resolve()
    
    print(f"検索ディレクトリ: {svgs_path}")
    print(f"出力先パス:       {output_path}\n")

    if not svgs_path.exists():
        print(f"エラー: ディレクトリ '{svgs_path}' が存在しません。")
        return

    # 大文字・小文字を区別せずに .svg ファイルを取得
    svg_files = sorted([
        f for f in svgs_path.iterdir() 
        if f.is_file() and f.suffix.lower() == '.svg'
    ])

    if not svg_files:
        print(f"警告: '{svgs_path}' 内に .svg ファイルが見つかりませんでした。")
        return

    print(f"対象ファイル数: {len(svg_files)} 件")
    sprite_root = ET.Element(f'{{{SVG_NS}}}svg', {'style': 'display: none;'})

    count = 0
    for file in svg_files:
        symbol_id = file.stem
        try:
            tree = ET.parse(file)
            root = tree.getroot()
            
            viewbox = root.get('viewBox', '0 0 24 24')
            symbol = ET.SubElement(sprite_root, f'{{{SVG_NS}}}symbol', {
                'id': symbol_id,
                'viewBox': viewbox
            })
            
            for child in root:
                symbol.append(child)
                
            print(f"  [+] 追加成功: #{symbol_id} ({file.name})")
            count += 1

        except ET.ParseError as e:
            print(f"  [!] スキップ: {file.name} (XML解析エラー: {e})")
        except Exception as e:
            print(f"  [!] スキップ: {file.name} (エラー: {e})")

    if count == 0:
        print("\n有効なSVG要素が1つも読み込めなかったため、書き込みを中止しました。")
        return

    # 書き込み処理
    output_path.parent.mkdir(parents=True, exist_ok=True)
    tree = ET.ElementTree(sprite_root)
    
    if hasattr(ET, 'indent'):
        ET.indent(tree, space="  ")

    tree.write(output_path, encoding='utf-8', xml_declaration=False)
    print(f"\n生成完了: {output_path} ({count} 件のアイコンを格納)")

if __name__ == '__main__':
    BASE_DIR = Path(__file__).parent
    generate_svg_sprite(
        svgs_dir=BASE_DIR / 'svgs',
        output_filepath=BASE_DIR / 'sprites.svg'
    )