import frida, time, sys
dev = frida.get_usb_device()
scripts_src = ''
for f in ['antitamp3.js','hookdec2.js','bypass2.js']:
    scripts_src += open(f).read() + '\n'
out = open('kw.log','a')
def on_spawn(spawn):
    print("spawn", spawn.identifier, spawn.pid, flush=True)
    if 'blackhole' in (spawn.identifier or ''):
        try:
            s = dev.attach(spawn.pid)
            sc = s.create_script(scripts_src)
            sc.on('message', lambda m,d: (out.write(str(m)+chr(10)), out.flush()))
            sc.load()
            print("hooked", spawn.pid, flush=True)
        except Exception as e:
            print("hookfail", e, flush=True)
    dev.resume(spawn.pid)
dev.on('spawn-added', on_spawn)
dev.enable_spawn_gating()
print("gating on", flush=True)
time.sleep(1800)
