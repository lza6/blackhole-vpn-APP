// attach to activity context instead
function tryCall(attempt) {
    Java.perform(function(){
        try {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var app = ActivityThread.currentApplication();
            if (!app) {
                // fallback: enumerate live activities
                var act = null;
                Java.choose("org.greatfire.gfvpn.IntroActivity", { onMatch: function(a){ act = a; }, onComplete: function(){} });
                if (!act) {
                    if (attempt < 20) { setTimeout(function(){ tryCall(attempt+1); }, 3000); return; }
                    console.log("[A] giveup: no context");
                    return;
                }
                var ctx = act.getApplicationContext();
            } else {
                var ctx = app.getApplicationContext();
            }
            console.log("[A] ctx ok");
            var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
            var inst = Comm.INSTANCE;
            var p = inst.getCommParams(ctx);
            console.log("[A] PARAMS=" + String(p).substring(0,800));
            var nl = inst.getNodeList(ctx, "");
            console.log("[A] NODELIST_RAW=" + String(nl).substring(0,4000));
        } catch(e){ console.log("[A] ERR: " + e); }
    });
}
setTimeout(function(){ tryCall(0); }, 3000);
