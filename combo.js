var mprotect = new NativeFunction(Module.getExportByName("libc.so","mprotect"), 'int', ['pointer','uint','int']);

var art = Process.findModuleByName("libart.so");
if (art) {
    var page = ptr(art.base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
    var ok=0, fail=0;
    for (var off=0; off < art.size; off += 4096) {
        var r = mprotect(page.add(off), 4096, 7);
        if (r === 0) ok++; else { fail++; if (fail<3) console.log("[A] fail@"+page.add(off)+" errno="+0); }
    }
    console.log("[A] pages ok="+ok+" fail="+fail);
} else console.log("[A] no art");

// Force verifier to skip: patch art::ClassLinker::VerifyClass to return true
var art = Process.findModuleByName("libart.so");
if (art) {
    var syms = art.enumerateSymbols();
    var target = null;
    for (var i=0;i<syms.length;i++){
        if (syms[i].name.indexOf("VerifyClass") >= 0 && syms[i].name.indexOf("ClassLinker") >= 0) {
            console.log("[V] " + syms[i].name + " @ " + syms[i].address);
            if (target === null) target = syms[i].address;
        }
    }
    if (target) {
        Interceptor.replace(target, new NativeCallback(function(){
            return 1; // true = verified
        }, 'bool', ['pointer','pointer','pointer','pointer','pointer']));
        console.log("[V] VerifyClass patched");
    }
}

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

// Broad crypto hook: dump ALL Cipher.doFinal inputs/outputs process-wide
Java.perform(function(){
    var Cipher = Java.use('javax.crypto.Cipher');
    Cipher.doFinal.overload('[B').implementation = function(input){
        var r = this.doFinal(input);
        try {
            var alg = this.getAlgorithm();
            var b64in = Java.use('android.util.Base64').encodeToString(input, 2);
            var b64out = Java.use('android.util.Base64').encodeToString(r, 2);
            console.log("[CIPHER] alg=" + alg + " in=" + b64in.substring(0,200) + " out=" + b64out.substring(0,400));
        } catch(e){}
        return r;
    };
    // SecretKeySpec keys
    var SK = Java.use('javax.crypto.spec.SecretKeySpec');
    SK.$init.overload('[B','java.lang.String').implementation = function(key, alg){
        var hex = Array.prototype.map.call(key, function(b){return ('0'+(b&0xff).toString(16)).slice(-2);}).join('');
        console.log("[KEY] alg=" + alg + " key=" + hex);
        return this.$init(key, alg);
    };
    var IV = Java.use('javax.crypto.spec.IvParameterSpec');
    IV.$init.overload('[B').implementation = function(iv){
        var hex = Array.prototype.map.call(iv, function(b){return ('0'+(b&0xff).toString(16)).slice(-2);}).join('');
        console.log("[IV] " + hex);
        return this.$init(iv);
    };
    console.log("[*] crypto hooks ready");
});

Java.perform(function(){
    var Runtime = Java.use('java.lang.Runtime');
    Runtime.exit.implementation = function(c){ console.log('[!] Runtime.exit('+c+') BLOCKED'); };
    Runtime.halt.implementation = function(c){ console.log('[!] halt BLOCKED'); };
    var Sys = Java.use('java.lang.System');
    Sys.exit.implementation = function(c){ console.log('[!] System.exit BLOCKED'); };
    try {
        var P = Java.use('android.os.Process');
        P.killProcess.implementation = function(pid){ console.log('[!] killProcess('+pid+') BLOCKED'); };
    } catch(e){}
    console.log('[*] guards v2 installed');
});
