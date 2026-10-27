import frida, sys, time
dev = frida.get_usb_device()
def on_child(child):
    print("child pid", child.pid)
    try:
        s = dev.attach(child.pid)
        sc = s.create_script(open('antitamp2.js').read() + "\n" + open('hookdec2.js').read() + "\n" + open('bypass2.js').read())
        out = open('jg.log','a')
        sc.on('message', lambda m,d: out.write(str(m)+"\n") or out.flush())
        sc.load()
        print("attached+loaded", child.pid)
    except Exception as e:
        print("attach fail", e)
    dev.resume(child.pid)
dev.on('child-added', on_child)
dev.enable_spawn_gating()
pid = dev.spawn(["com.blackhole.hd1763494114"])
print("spawned", pid)
on_child(type('C',(),{'pid':pid})())
time.sleep(300)
