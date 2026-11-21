# telemetry_collector.py
# ホストの /proc を直接読んで、3秒ごとに telemetry.json を書き出す収集係。
# 旧 telemetry_stream.py (SSE + Homepage API ポーリング) の置き換え。
#
# 前提 (Portainer Stack 側):
#   - ホストの /proc を /host/proc に読み取り専用でマウントする
#   - nginx が配信する html フォルダを /out にマウントする (ここへ JSON を書く)
# CPU使用率とネットワーク速度は前回サンプルとの差分から自前で計算するので、
# 測定窓が常に一定 (3秒) になり、値が荒れない。
import json
import os
import shutil
import time

PROC = os.environ.get("TELEMETRY_PROC", "/host/proc")
OUT_PATH = os.environ.get("TELEMETRY_OUT", "/out/telemetry.json")
DISK_PATH = os.environ.get("TELEMETRY_DISK_PATH", "/out")
INTERVAL = 3


def read_cpu_times():
    with open(os.path.join(PROC, "stat")) as f:
        for line in f:
            if line.startswith("cpu "):
                parts = [int(x) for x in line.split()[1:]]
                idle = parts[3] + parts[4]  # idle + iowait
                total = sum(parts)
                return idle, total
    raise RuntimeError("cpu line not found in stat")


def read_mem():
    info = {}
    with open(os.path.join(PROC, "meminfo")) as f:
        for line in f:
            key, _, rest = line.partition(":")
            if key in ("MemTotal", "MemAvailable"):
                info[key] = int(rest.split()[0]) * 1024  # kB -> bytes
    total = info["MemTotal"]
    used = total - info["MemAvailable"]
    return used, total


def default_interface():
    # デフォルトルートを持つインターフェース名を返す (Homepage の default 相当)
    try:
        with open(os.path.join(PROC, "net", "route")) as f:
            lines = f.read().splitlines()[1:]
        for line in lines:
            fields = line.split()
            if fields[1] == "00000000":
                return fields[0]
    except Exception:
        pass
    return None


def read_net(iface):
    with open(os.path.join(PROC, "net", "dev")) as f:
        for line in f:
            if ":" not in line:
                continue
            name, _, rest = line.partition(":")
            if name.strip() == iface:
                vals = [int(x) for x in rest.split()]
                return vals[0], vals[8]  # rx bytes, tx bytes
    raise RuntimeError(f"interface {iface} not found")


def write_json(payload):
    tmp = OUT_PATH + ".tmp"
    with open(tmp, "w") as f:
        json.dump(payload, f)
    os.replace(tmp, OUT_PATH)  # 原子的に差し替える (読み側が中途半端な状態を見ない)


def main():
    iface = default_interface()
    print(f"[collector] proc={PROC} out={OUT_PATH} iface={iface}", flush=True)

    prev_idle, prev_total = read_cpu_times()
    prev_rx, prev_tx = read_net(iface) if iface else (0, 0)
    prev_t = time.monotonic()

    while True:
        try:
            time.sleep(INTERVAL)
            now = time.monotonic()
            dt = now - prev_t

            idle, total = read_cpu_times()
            d_total = total - prev_total
            d_idle = idle - prev_idle
            cpu_usage = 0.0 if d_total <= 0 else (1.0 - d_idle / d_total) * 100.0
            prev_idle, prev_total = idle, total

            if iface:
                rx, tx = read_net(iface)
                rx_sec = max(0.0, (rx - prev_rx) / dt)
                tx_sec = max(0.0, (tx - prev_tx) / dt)
                prev_rx, prev_tx = rx, tx
            else:
                rx_sec = tx_sec = 0.0
            prev_t = now

            mem_used, mem_total = read_mem()
            disk = shutil.disk_usage(DISK_PATH)

            write_json({
                "cpu": {"cpu": {"usage": round(cpu_usage, 1)}},
                "memory": {"memory": {"used": mem_used, "total": mem_total}},
                "network": {"network": {"rx_sec": rx_sec, "tx_sec": tx_sec}},
                "disk": {"drive": {"used": disk.used, "size": disk.total}},
            })
        except Exception as e:
            print(f"[collector] error: {e}", flush=True)
            time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
