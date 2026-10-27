Java.perform(function(){
    var a = Java.use("com.luoyesiqiu.shell.a");
    a.a.implementation = function(){ return "arm64"; };
    console.log("[*] a.a() -> arm64 patched");
    // also dump dex after shell init
    Java.choose && null;
});
setTimeout(function(){
    Java.perform(function(){
        var seen={};
        function scan(){
            var ranges = Process.enumerateRangesSync('r--');
            ranges.forEach(function(r){
                if (r.size > 0x10000000) return;
                try {
                    Memory.scanSync(r.base, r.size, "64 65 78 0a 03 00", {
                        onMatch: function(addr){
                            var k=addr.toString(); if(seen[k])return; seen[k]=1;
                            var fsize; try{fsize=Memory.readU32(addr.add(0x20));}catch(e){return;}
                            if(fsize<0x2000||fsize>0x8000000)return;
                            var path="/data/local/tmp/dex_"+addr+"_"+fsize+".dex";
                            var f=new File(path,"wb"); f.write(Memory.readByteArray(addr,fsize)); f.close();
                            console.log("[DUMP] "+path);
                        },onComplete:function(){}
                    });
                }catch(e){}
            });
            console.log("[SCAN] done, total="+Object.keys(seen).length);
        }
        var n=0; var iv=setInterval(function(){ scan(); if(++n>=6) clearInterval(iv); }, 5000);
    });
}, 8000);
