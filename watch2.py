import frida, time, subprocess
dev = frida.get_usb_device()
scripts_src = ''
for f in ['antitamp3.js','hookdec2.js','bypass2.js']:
    scripts_src += open(f).read() + '\n'
out = open('kw2.log','a')
seen = set()
ADB = r"D:\android-sdk\platform-tools\adb.exe"
def get_pid():
    r = subprocess.run([ADB, "shell", "pidof org.greatfire.gfvpn"], capture_output=True, text=True)
    return r.stdout.strip()
print("watch2 polling", flush=True)
for i in range(1200):
    pid = get_pid()
    if pid and pid not in seen:
        seen.add(pid)
        try:
            s = dev.attach(int(pid))
            sc = s.create_script(scripts_src)
            sc.on('message', lambda m,d: (out.write(str(m)+chr(10)), out.flush()))
            sc.load()
            out.write("HOOKED "+pid+chr(10)); out.flush()
            print("hooked", pid, flush=True)
        except Exception as e:
            out.write("FAIL "+pid+" "+str(e)+chr(10)); out.flush()
    time.sleep(0.2)
