function doCall() {
    Java.perform(function(){
        try {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var ctx = ActivityThread.currentApplication().getApplicationContext();
            var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
            var inst = Comm.INSTANCE;
            console.log("[A] step1 ctx=" + ctx);
            var p = inst.getCommParams(ctx);
            console.log("[A] PARAMS_LEN=" + String(p).length);
            console.log("[A] PARAMS=" + String(p).substring(0,500));
            var nl = inst.getNodeList(ctx, "");
            console.log("[A] NODELIST=" + String(nl).substring(0,3000));
        } catch(e){ console.log("[A] ERR: " + e); }
    });
}
setTimeout(doCall, 800);
