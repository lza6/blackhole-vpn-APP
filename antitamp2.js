// Block self-kill via raise/tgkill/abort at libc level
['tgkill','kill','raise','abort','pthread_kill'].forEach(function(fn){
    var addr = Module.findExportByName("libc.so", fn);
    if (!addr) return;
    Interceptor.attach(addr, {
        onEnter: function(args){
            var sig = 0;
            if (fn === 'tgkill') sig = args[2].toInt32();
            else if (fn === 'kill') sig = args[1].toInt32();
            else if (fn === 'raise' || fn === 'pthread_kill') sig = args[1].toInt32();
            if (sig === 4 || sig === 6 || fn === 'abort') {
                console.log("[T] " + fn + " sig=" + sig + " BLOCKED");
                this.skip = true;
                // replace with return without executing: use onLeave trick won't stop signal, so replace original
            }
        }
    });
});
// Stronger: replace them entirely
var tgkillA = Module.findExportByName("libc.so","tgkill");
if (tgkillA) Interceptor.replace(tgkillA, new NativeCallback(function(tgid,tid,sig){ console.log("[T] tgkill("+sig+") swallowed"); return 0; }, 'int',['int','int','int']));
var raiseA = Module.findExportByName("libc.so","raise");
if (raiseA) Interceptor.replace(raiseA, new NativeCallback(function(sig){ console.log("[T] raise("+sig+") swallowed"); return 0; }, 'int',['int']));
var abortA = Module.findExportByName("libc.so","abort");
if (abortA) Interceptor.replace(abortA, new NativeCallback(function(){ console.log("[T] abort swallowed"); }, 'void',[]));
var pthreadKillA = Module.findExportByName("libc.so","pthread_kill");
if (pthreadKillA) Interceptor.replace(pthreadKillA, new NativeCallback(function(t,sig){ if(sig==4||sig==6){console.log("[T] pthread_kill("+sig+") swallowed"); return 0;} return 0; }, 'int',['pointer','int']));
console.log("[*] native self-kill guards v2 installed");
