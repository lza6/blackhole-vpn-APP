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
