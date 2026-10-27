Java.perform(function(){
    var a = Java.use("com.luoyesiqiu.shell.a");
    a.a.implementation = function(){ console.log("[*] a.a() -> arm64"); return "arm64"; };
    var JniBridge = Java.use("com.luoyesiqiu.shell.JniBridge");
    // stub out all native methods in case load still fails
    var stub = function(){};
    ["ia","clinit","cbde","craoc","rde"].forEach(function(m){ try{ JniBridge[m].implementation=stub; }catch(e){} });
    try { JniBridge.gap.implementation = function(){ return ""; }; } catch(e){}
    try { JniBridge.gdp.implementation = function(){ return ""; }; } catch(e){}
    try { JniBridge.rapn.implementation = function(){ return "us.ultrasurf.mobile.ultrasurf"; }; } catch(e){}
    try { JniBridge.rcf.implementation = function(){ return ""; }; } catch(e){}
    try { JniBridge.ra.implementation = function(n){ return Java.cast(Java.use("android.app.Application").$new(), Java.use("android.app.Application")); }; } catch(e){}
    console.log("[*] JniBridge stubbed");
});
