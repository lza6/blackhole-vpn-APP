function tryCall(attempt) {
    Java.perform(function(){
        try {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var app = ActivityThread.currentApplication();
            if (!app) {
                // Enumerate any activity of the app
                Java.enumerateLoadedActivities({
                    onMatch: function(a){
                        try {
                            var ctx = a.getApplicationContext();
                            if (ctx) { callApi(ctx); return; }
                        } catch(e){}
                    },
                    onComplete: function(){
                        if (attempt < 15) setTimeout(function(){ tryCall(attempt+1); }, 4000);
                    }
                });
                return;
            }
            callApi(app.getApplicationContext());
        } catch(e){ console.log("[A] ERR: " + e); }
    });
}
function callApi(ctx) {
    try {
        console.log("[A] ctx ok: " + ctx.getPackageName());
        var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
        var inst = Comm.INSTANCE;
        var p = inst.getCommParams(ctx);
        console.log("[A] PARAMS=" + String(p).substring(0,800));
        var nl = inst.getNodeList(ctx, "");
        console.log("[A] NODELIST_RAW=" + String(nl).substring(0,5000));
    } catch(e){ console.log("[A] callApi ERR: " + e); }
}
setTimeout(function(){ tryCall(0); }, 3000);
