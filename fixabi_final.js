// Early hook: patch a.a() to return arm64 BEFORE shell uses it
Java.perform(function(){
    var a = Java.use("com.luoyesiqiu.shell.a");
    a.a.implementation = function(){
        console.log("[*] a.a() -> arm64 (patched)");
        return "arm64";
    };
    console.log("[*] fixabi_final installed");
});
