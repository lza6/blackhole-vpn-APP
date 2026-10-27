var mprotect = new NativeFunction(Module.getExportByName("libc.so","mprotect"), 'int', ['pointer','uint','int']);

var art = Process.findModuleByName("libart.so");
if (art) {
    var page = ptr(art.base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
    var ok=0, fail=0;
    for (var off=0; off < art.size; off += 4096) {
        var r = mprotect(page.add(off), 4096, 7);
        if (r === 0) ok++; else { fail++; if (fail<3) console.log("[A] fail@"+page.add(off)+" errno="+0); }
    }
    console.log("[A] pages ok="+ok+" fail="+fail);
} else console.log("[A] no art");
