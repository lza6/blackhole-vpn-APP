"""
mitmdump script: 记录 /api/evmess 等 API 请求/响应明文, 并保存到 D:/blackhole-vpn/captured.jsonl
"""
import json, time
def request(flow):
    if b"api" in flow.request.path.encode() or True:
        rec = {"t": time.time(), "type": "req", "url": flow.request.pretty_url,
               "method": flow.request.method,
               "headers": dict(flow.request.headers),
               "body": flow.request.get_text()[:4000]}
        with open(r"D:\blackhole-vpn\captured.jsonl", "a") as f:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        print("REQ", flow.request.method, flow.request.pretty_url, flush=True)

def response(flow):
    rec = {"t": time.time(), "type": "resp", "url": flow.request.pretty_url,
           "status": flow.response.status_code,
           "body": flow.response.get_text()[:8000]}
    with open(r"D:\blackhole-vpn\captured.jsonl", "a") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print("RESP", flow.response.status_code, flow.request.pretty_url[:80], "body_len=", len(flow.response.get_text()), flush=True)
