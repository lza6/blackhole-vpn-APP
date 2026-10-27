['tgkill','kill','raise','abort','pthread_kill'].forEach(function(fn){
    var addr = Module.findExportByName ? Module.findExportByName("libc.so", fn) : null;
    if (!addr) { console.log("[T] no " + fn); return; }
    try {
        Interceptor.replace(addr, new NativeCallback(function(){
            console.log("[T] " + fn + " swallowed");
            return 0;
        }, 'int', fn==='abort'?[]:['int','int','int']));
    } catch(e){ console.log("[T] replace fail " + fn + ": " + e); }
});
console.log("[*] antitamp3 installed");
