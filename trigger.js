// trigger API calls directly from hooked context
Java.perform(function(){
    Java.scheduleOnMainThread(function(){
        try {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var ctx = ActivityThread.currentApplication().getApplicationContext();
            var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
            var inst = Comm.INSTANCE;
            console.log("[T] calling getCommParams...");
            var p = inst.getCommParams(ctx);
            console.log("[T] PARAMS=" + p);
            console.log("[T] calling getNodeList...");
            var nl = inst.getNodeList(ctx, "");
            console.log("[T] NODELIST=" + nl);
        } catch(e){ console.log("[T] err: " + e); }
    });
});
