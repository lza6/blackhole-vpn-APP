var mprotect = new NativeFunction(Module.getExportByName("libc.so","mprotect"), 'int', ['pointer','uint','int']);
var memfd = null;
try { memfd = new File("/proc/self/mem", "r+b"); } catch(e) { console.log("[A] mem open fail " + e); }
var art = Process.findModuleByName("libart.so");
if (art && memfd) {
    var page = ptr(art.base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
    var ok=0, fail=[];
    for (var off=0; off < art.size; off += 4096) {
        var r = mprotect(page.add(off), 4096, 7);
        if (r === 0) ok++;
        else {
            fail.push(page.add(off).toString());
            // force via /proc/self/mem: read a page worth (memcpy won't change perms, but touching via mem bypasses)
        }
    }
    console.log("[A] ok="+ok+" fail="+fail.length+" first="+ (fail[0]||"none"));
    // Second pass: try mprotect PROT_READ|PROT_WRITE|PROT_EXEC via direct syscall
    var syscall = new NativeFunction(Module.getExportByName("libc.so","syscall"), 'long', ['long','long','long','long']);
    for (var j=0; j<fail.length; j++) {
        var r2 = syscall(22, ptr(fail[j]).toString(), 4096, 7);
        console.log("[A] syscall mprotect "+fail[j]+" -> " + r2);
    }
}
