function doCall() {
    var out = [];
    Java.perform(function(){
        try {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var ctx = ActivityThread.currentApplication().getApplicationContext();
            var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
            var inst = Comm.INSTANCE;
            var p = inst.getCommParams(ctx);
            out.push("PARAMS=" + p);
            var nl = inst.getNodeList(ctx, "");
            out.push("NODELIST=" + String(nl).substring(0,2000));
        } catch(e){ out.push("ERR: " + e); }
    });
    send(out.join("\n---\n"));
}
setTimeout(doCall, 1000);
setInterval(function(){ /* keep alive */ }, 30000);
