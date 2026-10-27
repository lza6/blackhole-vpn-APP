var mprotect = new NativeFunction(Module.getExportByName("libc.so","mprotect"), 'int', ['pointer','uint','int']);
var art = Process.findModuleByName("libart.so");
var page = ptr(art.base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
var openfn = new NativeFunction(Module.getExportByName("libc.so","open"), 'int', ['pointer','int','int']);
var fd = openfn(Memory.allocUtf8String(art.path), 0, 0);
console.log("[P] fd=" + fd);
if (fd >= 0) {
    var mmap = new NativeFunction(Module.getExportByName("libc.so","mmap"), 'pointer', ['pointer','uint','int','int','int','long']);
    var fails = [];
    for (var off=0; off < art.size; off += 4096) {
        if (mprotect(page.add(off), 4096, 7) !== 0) fails.push(off);
    }
    console.log("[P] fails=" + fails.length);
    var ok=0;
    fails.forEach(function(off){
        // MAP_PRIVATE|MAP_FIXED|ANONYMOUS = 0x32; 先读旧内容再重映射写回(用 readByteArray 前)
        var fp = page.add(off);
        var data = fp.readByteArray(4096);
        var np = mmap(fp, 4096, 7, 0x32, -1, 0);
        if (np.toString() === fp.toString()) {
            if (data) fp.writeByteArray(data);
            ok++;
        }
    });
    console.log("[P] ok=" + ok);
}
