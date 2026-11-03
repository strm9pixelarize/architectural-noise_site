import time
import json
import urllib.request
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# Nginxからの内部転送検証用シークレットキー（Nginx側の設定値と合わせます）
SECRET_KEY = "LAB_SECRET_KEY_2026"

HOMEPAGE_URLS = {
    "cpu": "http://172.17.0.1:1040/api/widgets/resources?type=cpu",
    "memory": "http://172.17.0.1:1040/api/widgets/resources?type=memory",
    "network": "http://172.17.0.1:1040/api/widgets/resources?type=network&interfaceName=default",
    "disk": "http://172.17.0.1:1040/api/widgets/resources?type=disk&target=/"
}

def fetch_all_metrics():
    result = {}
    for key, url in HOMEPAGE_URLS.items():
        try:
            req = urllib.request.Request(url, headers={"Host": "status.neruru.local"})
            with urllib.request.urlopen(req, timeout=2) as response:
                result[key] = json.loads(response.read().decode('utf-8'))
        except Exception:
            result[key] = None
    return result

class SSEHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # シークレットヘッダーの取得
        client_secret = self.headers.get('X-Internal-Secret')

        # ★ このデバッグログを1行追加
        print(f"[DEBUG] Received path: '{self.path}', secret: '{client_secret}'", flush=True)

        # パスが一致しない、またはシークレットキーが正しくない場合は 404 で拒否
        if self.path != '/events' or client_secret != SECRET_KEY:
            self.send_error(404)
            return

        # SSEレスポンスヘッダーの送信
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.end_headers()

        # リアルタイムストリーミングループ
        while True:
            try:
                data = fetch_all_metrics()
                payload = f"data: {json.dumps(data)}\n\n"
                self.wfile.write(payload.encode('utf-8'))
                self.wfile.flush()
                time.sleep(3)  # 3秒間隔で内部取得＆配信
            except (BrokenPipeError, ConnectionResetError, OSError):
                # ブラウザがタブを閉じた・ページを離れた際の切断ハンドリング
                break

if __name__ == '__main__':
    server = ThreadingHTTPServer(('0.0.0.0', 8080), SSEHandler)
    server.serve_forever()