#!/usr/bin/env python3
import json
import re
import subprocess
from pathlib import Path

# configフォルダ配下の出力先パス
CONFIG_PATH = Path(__file__).parent / "../config/config_infrastructure.json"

# Docker以外に監視したいホスト側の systemd サービス一覧
SYSTEMD_TARGETS = [
    {"unit": "mirakurun.service", "id": "mirakurun", "name": "Mirakurun + coaxd", "category": "media-game", "ports": ["40772/TCP"], "role": "DTV Tuner Backend"},
    {"unit": "tailscaled.service", "id": "tailscale-node", "name": "Tailscale VPN Mesh", "category": "network", "ports": ["41641/UDP"], "role": "Overlay Mesh Daemon"},
    {"unit": "nginx.service", "id": "nginx-proxy", "name": "Nginx Reverse Proxy", "category": "network", "ports": ["80/TCP", "443/TCP"], "role": "Edge Web / SSI Server"},
]

CATEGORY_RULES = {
    "network": ["adguard", "pihole", "nginx", "traefik", "caddy", "cloudflared", "tailscale", "wireguard", "vpn", "proxy", "dns"],
    "media-game": ["minecraft", "forge", "paper", "mirakurun", "epgstation", "azuracast", "plex", "jellyfin", "navidrome", "audio", "radio", "game"],
}


def guess_category(text: str) -> str:
    target = text.lower()
    for category, keywords in CATEGORY_RULES.items():
        if any(kw in target for kw in keywords):
            return category
    return "docker"


def parse_docker_ports(ports_str: str) -> list[str]:
    if not ports_str:
        return []
    matches = re.findall(r"(?:[\d\.]+|\[::\]):(\d+)->\d+/(tcp|udp)", ports_str, re.IGNORECASE)
    return sorted({f"{port}/{proto.upper()}" for port, proto in matches}, key=lambda x: int(x.split("/")[0]))


def get_container_status_style(state: str) -> tuple[str, str]:
    s = state.lower()
    if s in ("running", "active"):
        return "RUNNING", "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
    elif s in ("restarting", "activating"):
        return "RESTARTING", "bg-[#fca73f]/15 border-[#fca73f]/40 text-[#fca73f]"
    else:
        return "STOPPED", "bg-rose-500/15 border-rose-500/40 text-rose-400"


def get_stack_status_style(running: int, total: int) -> tuple[str, str]:
    if running == total and total > 0:
        return f"HEALTHY ({running}/{total})", "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
    elif running > 0:
        return f"DEGRADED ({running}/{total})", "bg-[#fca73f]/10 border-[#fca73f]/30 text-[#fca73f]"
    else:
        return f"STOPPED (0/{total})", "bg-rose-500/10 border-rose-500/30 text-rose-400"


def fetch_docker_stacks() -> list[dict]:
    try:
        res = subprocess.run(
            ["docker", "ps", "-a", "--format", "{{json .}}"],
            capture_output=True,
            text=True,
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"[WARN] Docker取得スキップ: {e}")
        return []

    stacks_map = {}

    for line in res.stdout.strip().splitlines():
        if not line:
            continue
        data = json.loads(line)
        c_name = data.get("Names", "").lstrip("/")
        image = data.get("Image", "")
        state = data.get("State", "unknown")
        labels = data.get("Labels", "")

        stack_match = re.search(r"com\.docker\.compose\.project=([^,]+)", labels)
        stack_name = stack_match.group(1) if stack_match else c_name
        is_compose = bool(stack_match)

        stack_id = re.sub(r"[^a-zA-Z0-9_-]", "-", stack_name).lower()
        c_status, c_color = get_container_status_style(state)
        c_ports = parse_docker_ports(data.get("Ports", ""))

        if stack_id not in stacks_map:
            stacks_map[stack_id] = {
                "id": stack_id,
                "name": stack_name,
                "is_compose": is_compose,
                "containers": [],
                "all_ports": set(),
                "search_blob": "",
            }

        stacks_map[stack_id]["containers"].append({
            "name": c_name,
            "image": image,
            "status": c_status,
            "statusColor": c_color,
            "ports": c_ports,
            "role": "",  # 手動で "Main App" / "Database" 等を追記可能
        })
        stacks_map[stack_id]["all_ports"].update(c_ports)
        stacks_map[stack_id]["search_blob"] += f" {c_name} {image}"

    results = []
    for stack_id, info in stacks_map.items():
        containers = sorted(info["containers"], key=lambda x: x["name"])
        total = len(containers)
        running = sum(1 for c in containers if c["status"] == "RUNNING")
        status_text, status_color = get_stack_status_style(running, total)
        sorted_ports = sorted(info["all_ports"], key=lambda x: int(x.split("/")[0]))

        results.append({
            "id": stack_id,
            "name": info["name"],
            "category": guess_category(f"{info['name']} {info['search_blob']}"),
            "type": f"Docker Stack ({total} containers)" if info["is_compose"] else "Standalone Container",
            "status": status_text,
            "statusColor": status_color,
            "summary": "",
            "ports": sorted_ports,
            "containers": containers,
            "article": f"/articles/infra/{stack_id}.md",
            "tags": ["Docker", "Portainer"] if info["is_compose"] else ["Docker"],
        })

    return results


def fetch_systemd_stacks() -> list[dict]:
    results = []
    for item in SYSTEMD_TARGETS:
        unit = item["unit"]
        load_check = subprocess.run(["systemctl", "show", "-p", "LoadState", "--value", unit], capture_output=True, text=True)
        if load_check.stdout.strip() != "loaded":
            continue

        active_check = subprocess.run(["systemctl", "is-active", unit], capture_output=True, text=True)
        state = active_check.stdout.strip()
        c_status, c_color = get_container_status_style(state)
        is_running = 1 if c_status == "RUNNING" else 0
        s_status, s_color = get_stack_status_style(is_running, 1)

        results.append({
            "id": item["id"],
            "name": item["name"],
            "category": item["category"],
            "type": "Systemd Service",
            "status": s_status,
            "statusColor": s_color,
            "summary": "",
            "ports": item["ports"],
            "containers": [
                {
                    "name": unit,
                    "image": "host-systemd",
                    "status": c_status,
                    "statusColor": c_color,
                    "ports": item["ports"],
                    "role": item.get("role", "System Daemon"),
                }
            ],
            "article": f"/articles/infra/{item['id']}.md",
            "tags": ["Ubuntu", "Systemd"],
        })
    return results


def main():
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)

    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
    else:
        config = {
            "sectionTitle": "INFRASTRUCTURE & LAB // NETWORK ARCHITECTURE",
            "description": "自作ホームサーバー、ネットワーク構成、Dockerスタック、セルフホストサービスの運用・検証ログ",
            "topology": {
                "router": {"name": "Yamaha RTX1300", "type": "Core Router / L2TP VPN", "ip": "192.168.1.1"},
                "server": {"name": "Dell OptiPlex 3060 Micro", "type": "Core Host / Portainer Stacks", "os": "Ubuntu Server 26.04 LTS"},
                "vpn": {"name": "Tailscale Mesh + AdGuard DNS", "type": "Zero-Trust Overlay Network", "domain": ".local / .ts.net"},
            },
            "categories": [
                {"id": "all", "label": "ALL STACKS", "icon": "server"},
                {"id": "network", "label": "NETWORK & SECURITY", "icon": "shield"},
                {"id": "docker", "label": "DOCKER STACKS", "icon": "container"},
                {"id": "media-game", "label": "MEDIA & SERVERS", "icon": "cpu"},
            ],
            "services": [],
        }

    existing_map = {s["id"]: s for s in config.get("services", []) if "id" in s}
    detected = fetch_systemd_stacks() + fetch_docker_stacks()
    merged = []

    for stack in detected:
        sid = stack["id"]
        if sid in existing_map:
            old = existing_map[sid]
            # 既存コンテナの role メモをコンテナ名単位で退避
            old_roles = {c["name"]: c.get("role", "") for c in old.get("containers", []) if "name" in c}
            for c in stack["containers"]:
                if c["name"] in old_roles and old_roles[c["name"]]:
                    c["role"] = old_roles[c["name"]]

            # 手動編集フィールド（name, category, summary, article, tags）を保持しつつ最新状態を反映
            old["type"] = stack["type"]
            old["status"] = stack["status"]
            old["statusColor"] = stack["statusColor"]
            old["ports"] = stack["ports"]
            old["containers"] = stack["containers"]
            merged.append(old)
        else:
            merged.append(stack)

    config["services"] = merged

    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    print(f"[OK] {len(merged)} 件のスタックを {CONFIG_PATH} に同期しました。")


if __name__ == "__main__":
    main()