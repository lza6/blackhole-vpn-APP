Java.perform(function(){
    var Runtime = Java.use('java.lang.Runtime');
    Runtime.exit.implementation = function(c){ console.log('[!] Runtime.exit('+c+') BLOCKED'); };
    Runtime.halt.implementation = function(c){ console.log('[!] halt BLOCKED'); };
    var Sys = Java.use('java.lang.System');
    Sys.exit.implementation = function(c){ console.log('[!] System.exit BLOCKED'); };
    try {
        var P = Java.use('android.os.Process');
        P.killProcess.implementation = function(pid){ console.log('[!] killProcess('+pid+') BLOCKED'); };
    } catch(e){}
    console.log('[*] guards v2 installed');
});
