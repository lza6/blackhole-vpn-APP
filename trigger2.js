// run on a background thread instead of main (avoid blocking)
Java.perform(function(){
    setTimeout(function(){
        Java.perform(function(){
            try {
                var ActivityThread = Java.use('android.app.ActivityThread');
                var ctx = ActivityThread.currentApplication().getApplicationContext();
                var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
                var inst = Comm.INSTANCE;
                console.log("[T] getCommParams start");
                var p = inst.getCommParams(ctx);
                console.log("[T] PARAMS=" + p);
                var nl = inst.getNodeList(ctx, "");
                console.log("[T] NODELIST=" + nl);
            } catch(e){ console.log("[T] err: " + e + "\n" + e.stack); }
        });
    }, 500);
});
