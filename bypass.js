// 1) 阻止云验证自杀
Java.perform(function(){
    try {
        var Runtime = Java.use('java.lang.Runtime');
        Runtime.exit.implementation = function(code){
            console.log('[!] Runtime.exit(' + code + ') BLOCKED');
        };
        Runtime.halt.implementation = function(code){
            console.log('[!] Runtime.halt BLOCKED');
        };
    } catch(e){ console.log('err runtime: '+e); }
    // 2) System.exit
    try {
        var Sys = Java.use('java.lang.System');
        Sys.exit.implementation = function(code){
            console.log('[!] System.exit(' + code + ') BLOCKED');
        };
    } catch(e){}
    console.log('[*] exit guards installed');
});
