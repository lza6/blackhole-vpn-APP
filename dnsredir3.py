from dnslib import DNSRecord, QTYPE, RR, A
from dnslib.server import DNSServer, BaseResolver
import socket
UP = ("223.5.5.5", 53)
MAP = {"www.hmj1ed.cc.": "10.0.2.2", "hmj1ed.cc.": "10.0.2.2"}
class R(BaseResolver):
    def resolve(self, request, handler):
        qname = str(request.q.qname)
        if qname in MAP:
            reply = request.reply()
            reply.add_answer(RR(request.q.qname, QTYPE.A, rdata=A(MAP[qname]), ttl=60))
            print("REDIR", qname, flush=True)
            return reply
        try:
            data = request.pack()
            u = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); u.settimeout(3)
            u.sendto(data, UP)
            r, _ = u.recvfrom(4096)
            return DNSRecord.parse(r)
        except Exception as e:
            print("fwd err", e, flush=True)
            reply = request.reply()
            return reply
resolver = R()
server = DNSServer(resolver, port=53, address="0.0.0.0")
print("dns3 up", flush=True)
server.start()
