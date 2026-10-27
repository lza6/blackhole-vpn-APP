Java.perform(function(){
    var Comm = Java.use("com.blackhole.hd1763494114.ui.CommUrlApi");
    var methods = Comm.class.getDeclaredMethods();
    methods.forEach(function(m){
        console.log("[M] " + m.getName() + " " + m.toGenericString().substring(0,150));
    });
    // hook decrypt
    try {
        Comm.decrypt.overloads.forEach(function(ov){
            ov.implementation = function(){
                var r = ov.apply(this, arguments);
                console.log("[DEC] in=" + arguments[0] + "\n[DEC] out=" + r);
                return r;
            };
        });
    } catch(e){ console.log("decrypt hook err: "+e); }
    // hook getCommParams
    try {
        Comm.getCommParams.overloads.forEach(function(ov){
            ov.implementation = function(){
                var r = ov.apply(this, arguments);
                console.log("[PARAMS] " + r);
                return r;
            };
        });
    } catch(e){}
    // hook getNodeList
    try {
        Comm.getNodeList.overloads.forEach(function(ov){
            ov.implementation = function(){
                console.log("[*] getNodeList called");
                return ov.apply(this, arguments);
            };
        });
    } catch(e){}
});
