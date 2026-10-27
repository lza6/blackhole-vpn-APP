rpc.exports = {
    callApi: function() {
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
                out.push("NODELIST=" + nl);
            } catch(e){ out.push("ERR: " + e); }
        });
        return out.join("\n---\n");
    }
};
console.log("[*] rpc ready");
