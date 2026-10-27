import socket, struct, threading
UP = ("223.5.5.5", 53)
MAP = {b"www.hmj1ed.cc": "10.0.2.2", b"hmj1ed.cc": "10.0.2.2"}
def handle(data, addr, s):
    tid = data[:2]
    try:
        i = 12; labels = []
        while data[i] != 0:
            l = data[i]; labels.append(data[i+1:i+1+l]); i += 1 + l
        qend = i + 5
        name = b".".join(labels).lower()
        if name in MAP:
            # full response, no compression
            resp = tid + b"\x85\x80" + data[4:6] + b"\x00\x01\x00\x00\x00\x00\x00\x00"
            resp += data[12:qend]          # question echo
            resp += b"\xc0\x0c" + b"\x00\x01\x00\x01\x00\x00\x00\x3c\x00\x04" + socket.inet_aton(MAP[name])
            s.sendto(resp, addr); print("REDIR", name.decode(), flush=True); return
    except Exception as e:
        print("err", e, flush=True)
    u = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); u.settimeout(3)
    u.sendto(data, UP)
    try:
        r,_ = u.recvfrom(4096); s.sendto(r, addr)
    except Exception: pass
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.bind(("0.0.0.0", 53))
print("dns2 up", flush=True)
while True:
    d, a = s.recvfrom(4096)
    threading.Thread(target=handle, args=(d,a,s)).start()
