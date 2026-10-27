#!/usr/bin/env python3
"""
黑洞加速器 API 协议复刻 demo（骨架）
- 复刻已知端点行为（/api/alive, /api/rules, /api/links, /api/evmess 占位）
- evmess 解密 key 待抓取后填入 EVMESS_KEY
- 端口 8902
"""
import base64
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

EVMESS_KEY = None  # TODO: 运行时抓取后填入 (16/32 bytes)
EVMESS_IV = b"\x00" * 16

FAKE_EVMESS_B64 = (
    "mq4s/zhZQcd3VPf8qNKVJB5hbYBc/NOWdwgbjHfh7wPb5f9rTQz9F8eed+SNvDTQvv3jzhY2HeH25BQ7s"
    "V1RoD8HSZ4Y0ug8n03J2AdulZBnzo6dHVqpdnzEjD0uJZ8FuBhvwOw1iqboIq0moeUdHpfX6Bk1bkoQt6"
    "wSxK+7DPtFZx+v8jMaUOJW7EknPjdhlrSzDUO5J7CxiIr6WH5Zyd9Uzh2QG5f5ERLO12lQjrp6D3pRyql"
    "qJF+/ChU/JklTwcfMrMT9WcF2mJaZ3UVKo5K4CjLNmLlpJUwZHKB+v56iMmtqUXagXqt9B1agy7se/YTi"
    "TLf6sVdAJw2I5K4iwg=="
)

RULES = {"rules": [["推广", "每日时长", "单次时间"], ["0人", "2小时", "1小时"],
                   ["1人", "3小时", "1.5小时"], ["2人", "4小时", "2小时"],
                   ["3人", "5小时", "不限"], ["每+1人", "+1小时", "不限"],
                   ["达22人", "永久无限", "永久不限"]],
         "colors": ["707070", "EE6363", "EE6363", "EE6363", "EE9A49", "EE9A49", "7CCD7C"]}


class Handler(BaseHTTPRequestHandler):
    def _send(self, body: bytes, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=UTF-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api/alive":
            self._send(b"OK")
        elif path == "/api/rules":
            self._send(json.dumps(RULES, ensure_ascii=False).encode())
        elif path == "/api/links":
            # 复刻服务端 debug 泄露（var_dump 格式）
            self._send(b'string(32) "22a436ecbb589469bf587c8c07bea5d7"\nstring(0) ""\nstring(0) ""\n')
        elif path == "/api/evmess":
            if EVMESS_KEY:
                from Crypto.Cipher import AES
                from Crypto.Util.Padding import pad
                nodes = json.dumps({"nodes": []}).encode()
                c = AES.new(EVMESS_KEY, AES.MODE_CBC, EVMESS_IV)
                self._send(base64.b64encode(c.encrypt(pad(nodes, 16))))
            else:
                # 透传真实服务器的加密响应（key 未知，仅供对照）
                self._send(FAKE_EVMESS_B64.encode())
        elif path == "/api/eversion":
            self._send(b"")
        else:
            self._send(b"", 404)

    do_POST = do_GET

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    print("demo server on :8902 — evmess key:", EVMESS_KEY or "NOT CAPTURED YET")
    HTTPServer(("0.0.0.0", 8902), Handler).serve_forever()
