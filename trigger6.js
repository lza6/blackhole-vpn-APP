// wait until app context available, then trigger on background thread
function tryCall(attempt) {
    Java.perform(function(){
        try {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var app = ActivityThread.currentApplication();
            if (!app) { 
                console.log("[A] no app yet, attempt " + attempt);
                if (attempt < 30) setTimeout(function(){ tryCall(attempt+1); }, 3000);
                return;
            }
            var ctx = app.getApplicationContext();
            console.log("[A] ctx ok: " + ctx.getPackageName());
            var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
            var inst = Comm.INSTANCE;
            var p = inst.getCommParams(ctx);
            console.log("[A] PARAMS=" + String(p).substring(0,600));
            var nl = inst.getNodeList(ctx, "");
            console.log("[A] NODELIST_RAW=" + String(nl).substring(0,4000));
        } catch(e){ console.log("[A] ERR: " + e); }
    });
}
setTimeout(function(){ tryCall(0); }, 3000);
