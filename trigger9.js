function callApi(ctx) {
    Java.perform(function(){
        try {
            console.log("[A] ctx ok: " + ctx.getPackageName());
            var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
            var inst = Comm.INSTANCE;
            var p = inst.getCommParams(ctx);
            console.log("[A] PARAMS=" + String(p).substring(0,800));
            var nl = inst.getNodeList(ctx, "");
            console.log("[A] NODELIST_RAW=" + String(nl).substring(0,5000));
        } catch(e){ console.log("[A] callApi ERR: " + e); }
    });
}
// hook Activity.onResume as context source
Java.perform(function(){
    var Activity = Java.use('android.app.Activity');
    Activity.onResume.implementation = function(){
        this.onResume();
        try {
            var pkg = this.getPackageName();
            if (pkg === "com.blackhole.hd1763494114" && !global.__called) {
                global.__called = true;
                console.log("[A] onResume: " + this.getClass().getName());
                callApi(this.getApplicationContext());
            }
        } catch(e){}
    };
});
console.log("[*] onResume hook ready");
