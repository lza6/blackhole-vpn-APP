#!/usr/bin/env python3
"""evmess 响应密钥猎手 — 输入候选 key 列表, 对已知密文测试 AES-CBC/ECB 解密
用法: python key_hunt.py <key16_or_32_hex_or_ascii> [more...]
"""
import base64, sys, hashlib
from Crypto.Cipher import AES

CT = base64.b64decode(
    "mq4s/zhZQcd3VPf8qNKVJB5hbYBc/NOWdwgbjHfh7wPb5f9rTQz9F8eed+SNvDTQvv3jzhY2HeH25BQ7s"
    "V1RoD8HSZ4Y0ug8n03J2AdulZBnzo6dHVqpdnzEjD0uJZ8FuBhvwOw1iqboIq0moeUdHpfX6Bk1bkoQt6"
    "wSxK+7DPtFZx+v8jMaUOJW7EknPjdhlrSzDUO5J7CxiIr6WH5Zyd9Uzh2QG5f5ERLO12lQjrp6D3pRyql"
    "qJF+/ChU/JklTwcfMrMT9WcF2mJaZ3UVKo5K4CjLNmLlpJUwZHKB+v56iMmtqUXagXqt9B1agy7se/YTi"
    "TLf6sVdAJw2I5K4iwg==")

def to_key(s):
    s = s.strip()
    if len(s) == 32 and all(c in "0123456789abcdefABCDEF" for c in s):
        return bytes.fromhex(s), s[:16].encode(), s[16:].encode(), s.encode()
    return s.encode()[:16], s.encode()[:16], s.encode()[:16], s.encode()[:16]

def score(pt):
    return sum(1 for b in pt[:64] if 32 <= b < 127 or b in (9,10,13))

def try_all(key):
    ivs = [key[:16], b"\x00"*16, key]
    hits = []
    for k in set(k for k in to_key(key) if len(k) in (16,24,32)):
        for iv in ivs:
            if len(iv) != 16: continue
            try:
                pt = AES.new(k, AES.MODE_CBC, iv).decrypt(CT)
                if score(pt) > 50: hits.append(("cbc", k.hex()[:16], iv.hex()[:8], pt[:120]))
            except Exception: pass
        try:
            pt = AES.new(k, AES.MODE_ECB).decrypt(CT)
            if score(pt) > 50: hits.append(("ecb", k.hex()[:16], "-", pt[:120]))
        except Exception: pass
    return hits

if __name__ == "__main__":
    for k in sys.argv[1:]:
        for h in try_all(k):
            print("HIT", h)
    print("done", len(sys.argv)-1, "keys tested")
