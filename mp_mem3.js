var mprotect = new NativeFunction(Module.getExportByName("libc.so","mprotect"), 'int', ['pointer','uint','int']);
var art = Process.findModuleByName("libart.so");
var page = ptr(art.base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
// open the real file for MAP_PRIVATE re-map
var openfn = new NativeFunction(Module.getExportByName("libc.so","open"), 'int', ['pointer','int','int']);
var path = Memory.allocUtf8String(art.path);
var fd = openfn(path, 0 /*O_RDONLY*/, 0);
console.log("[P] fd=" + fd + " path=" + art.path);
if (fd >= 0) {
    var fails = [];
    for (var off=0; off < art.size; off += 4096) {
        if (mprotect(page.add(off), 4096, 7) !== 0) fails.push({v: page.add(off).toString(), o: off});
    }
    console.log("[P] fails=" + fails.length);
    var mmap = new NativeFunction(Module.getExportByName("libc.so","mmap"), 'pointer', ['pointer','uint','int','int','int','long']);
    var ok=0;
    fails.forEach(function(f){
        // offset = file_offset_of_page; libart mapped at base => file offset = off (base-aligned loads)
        var np = mmap(ptr(f.v), 4096, 7, 0x32 /*MAP_FIXED|PRIVATE|ANON*/, -1, 0);
        if (np.toString() === f.v) {
            // copy content from original mapping read-only alias? lost. Instead mmap file at offset:
        }
        ok++;
    });
    console.log("[P] attempt done");
}
