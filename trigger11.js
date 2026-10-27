// skip CommUrlApi wrapper entirely; replicate protocol ourselves via Java HttpsURLConnection
// First: get comm params via any Context hook on performLaunchActivity
Java.perform(function(){
    var AT = Java.use('android.app.ActivityThread');
    AT.performLaunchActivity.implementation = function(r, i){
        var act = this.performLaunchActivity(r, i);
        try {
            if (act && !global.__called) {
                global.__called = true;
                var ctx = act.getApplicationContext();
                console.log("[A] launch: " + act.getClass().getName());
                var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
                var inst = Comm.INSTANCE;
                var p = inst.getCommParams(ctx);
                console.log("[A] PARAMS=" + String(p).substring(0,800));
                var nl = inst.getNodeList(ctx, "");
                console.log("[A] NODELIST_RAW=" + String(nl).substring(0,5000));
            }
        } catch(e){ console.log("[A] ERR: " + e); }
        return act;
    };
});
console.log("[*] launch hook ready");
