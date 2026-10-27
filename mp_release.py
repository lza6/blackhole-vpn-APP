import frida, time
dev = frida.get_usb_device()
pid = dev.spawn(['com.blackhole.hd1763494114'])
print("spawned", pid, flush=True)
s = dev.attach(pid)
sc = s.create_script(open('mp_mem2.js', encoding='utf-8').read())
out = open('mp.log','a')
sc.on('message', lambda m,d: (out.write(str(m)+chr(10)), out.flush()))
sc.load()
dev.resume(pid)
print("resumed, releasing in 1s", flush=True)
time.sleep(1)
s.detach()  # frida 完全脱离，让壳自然 hook
print("detached", flush=True)
# 之后由外部脚本 pid 轮询 attach 抓 crypto
time.sleep(60)
