import frida, time
dev = frida.get_usb_device()
pid = dev.spawn(['com.blackhole.hd1763494114'])
print('spawned', pid, flush=True)
scripts = ''
for f in ['antitamp3.js','hookdec2.js','bypass2.js']:
    scripts += open(f).read() + '\n'
s = dev.attach(pid)
sc = s.create_script(scripts)
out = open('jg5.log','a')
sc.on('message', lambda m,d: (out.write(str(m)+chr(10)), out.flush()))
sc.load()
dev.resume(pid)
print('loaded+resumed', flush=True)
time.sleep(300)
