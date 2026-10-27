from dnslib import DNSRecord, QTYPE, RR, A
from dnslib.server import DNSServer, BaseResolver
import socket
UP = ("8.8.8.8", 53)
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
            u = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); u.settimeout(5)
            u.sendto(request.pack(), UP)
            r, _ = u.recvfrom(8192)
            print("FWD", qname, flush=True)
            return DNSRecord.parse(r)
        except Exception as e:
            print("fwd err", qname, e, flush=True)
            reply = request.reply()
            reply.header.rcode = 2
            return reply
DNSServer(R(), port=53, address="0.0.0.0").start()
