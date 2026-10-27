import socket, struct, threading
UP = ("8.8.8.8", 53)
MAP = {b"www.hmj1ed.cc": "10.0.2.2"}
def handle(data, addr, s):
    # parse question
    try:
        tid = data[:2]
        i = 12
        name = b""
        while data[i] != 0:
            l = data[i]; name += data[i+1:i+1+l] + b"."; i += 1 + l
        name = name.rstrip(b".")
        qend = i + 5
        if name.lower() in MAP:
            ip = socket.inet_aton(MAP[name.lower()])
            resp = tid + b"\x81\x80" + data[4:6] + b"\x00\x00\x00\x00\x00\x00" + data[12:qend]
            resp += b"\xc0\x0c" + b"\x00\x01" + b"\x00\x00\x00\x3c" + b"\x00\x04" + ip
            s.sendto(resp, addr)
            print("REDIRECT", name.decode(), flush=True)
            return
    except Exception as e:
        pass
    # forward
    u = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); u.settimeout(3)
    u.sendto(data, UP)
    try:
        r,_ = u.recvfrom(4096); s.sendto(r, addr)
    except Exception: pass
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind(("0.0.0.0", 53))
print("dns up", flush=True)
while True:
    d, a = s.recvfrom(4096)
    threading.Thread(target=handle, args=(d,a,s)).start()
