import subprocess
import json
import os
import shutil
from datetime import datetime

OUTPUT_PATH = "/DATA/AppData/architectural-noise/html/serverInfo/info.json"

def get_fastfetch_path():
    path = shutil.which("fastfetch")
    if path:
        return path
    candidates = [
        "/usr/bin/fastfetch",
        "/usr/local/bin/fastfetch",
        "/bin/fastfetch"
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return "fastfetch"

def main():
    try:
        fastfetch_bin = get_fastfetch_path()
        res = subprocess.run([fastfetch_bin, "--json"], capture_output=True, text=True, check=True)
        raw_data = json.loads(res.stdout)

        info = {}
        for item in raw_data:
            key = item.get("type", "").lower()
            # 文字列化せず、辞書/配列オブジェクトのまま格納する
            info[key] = item.get("result")

        info["updatedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(info, f, indent=2, ensure_ascii=False)

        print(f"[OK] Server info successfully written to {OUTPUT_PATH}")

    except Exception as e:
        print(f"[ERR] Failed to generate server info: {e}")
        raise e

if __name__ == "__main__":
    main()