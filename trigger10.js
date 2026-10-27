// hook Instrumentation.callActivityOnResume - guaranteed path
Java.perform(function(){
    var Ins = Java.use('android.app.Instrumentation');
    Ins.callActivityOnResume.implementation = function(act){
        this.callActivityOnResume(act);
        try {
            var pkg = act.getPackageName();
            console.log("[R] onResume pkg=" + pkg + " cls=" + act.getClass().getName());
            if (pkg.indexOf("blackhole") >= 0 || pkg.indexOf("gfvpn") >= 0) {
                if (!global.__called) {
                    global.__called = true;
                    var ctx = act.getApplicationContext();
                    var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
                    var inst = Comm.INSTANCE;
                    var p = inst.getCommParams(ctx);
                    console.log("[A] PARAMS=" + String(p).substring(0,800));
                    var nl = inst.getNodeList(ctx, "");
                    console.log("[A] NODELIST_RAW=" + String(nl).substring(0,5000));
                }
            }
        } catch(e){ console.log("[A] ERR: " + e); }
    };
});
console.log("[*] instrumentation hook ready");
