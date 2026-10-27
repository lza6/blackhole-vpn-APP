import http.server, json, sys
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        print("REQ:", self.path, flush=True)
        print("HEADERS:", dict(self.headers), flush=True)
        body = b""
        ln = int(self.headers.get('Content-Length', 0) or 0)
        if ln: body = self.rfile.read(ln); print("BODY:", body[:2000], flush=True)
        self.send_response(200)
        self.send_header('Content-Type','text/html')
        self.end_headers()
        self.wfile.write(b"")  # empty response; just want to see requests
    do_POST = do_GET
    def log_message(self, *a): pass
http.server.HTTPServer(('0.0.0.0', 20000), H).serve_forever()
