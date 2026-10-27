console.log("[*] script loaded, pid=" + Process.id);
Java.perform(function(){
    console.log("[*] java.perform entered");
    var a = Java.use("com.luoyesiqiu.shell.a");
    a.a.implementation = function(){ console.log("[*] a.a() called -> arm64"); return "arm64"; };
    console.log("[*] a.a patched");
});
