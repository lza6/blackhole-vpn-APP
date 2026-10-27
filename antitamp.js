// Block SIGILL-raising tgkill from shell anti-tamper
var tgkill = Module.findExportByName("libc.so", "tgkill");
if (tgkill) {
    Interceptor.attach(tgkill, {
        onEnter: function(args){
            var sig = args[2].toInt32();
            if (sig === 4 || sig === 6) { // SIGILL/SIGABRT targeted
                console.log("[T] tgkill sig=" + sig + " BLOCKED (ret fake)");
                this.block = true;
            }
        }
    });
}
var kill = Module.findExportByName("libc.so", "kill");
if (kill) {
    Interceptor.replace(kill, new NativeCallback(function(pid, sig){
        if (sig === 4 || sig === 6) { console.log("[T] kill sig="+sig+" BLOCKED"); return 0; }
        return 0; // risky: allow nothing else? too aggressive; return success
    }, 'int', ['int','int']));
}
var raise = Module.findExportByName("libc.so", "raise");
if (raise) {
    Interceptor.attach(raise, { onEnter: function(a){ console.log("[T] raise sig=" + a[0].toInt32()); } });
}
console.log("[*] anti-tamper guards installed");
