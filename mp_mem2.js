var mprotect = new NativeFunction(Module.getExportByName("libc.so","mprotect"), 'int', ['pointer','uint','int']);
var art = Process.findModuleByName("libart.so");
var page = ptr(art.base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
var mmap = new NativeFunction(Module.getExportByName("libc.so","mmap"), 'pointer', ['pointer','uint','int','int','int','long']);
var fails = [];
for (var off=0; off < art.size; off += 4096) {
    if (mprotect(page.add(off), 4096, 7) !== 0) fails.push(page.add(off).toString());
}
console.log("[P] fails=" + fails.length);
var ok=0;
fails.forEach(function(fstr){
    var fp = ptr(fstr);
    var buf = Memory.alloc(4096);
    // read via readByteArray (safe API)
    var data = fp.readByteArray(4096);
    if (!data) { console.log("[P] read fail " + fstr); return; }
    buf.writeByteArray(data);
    var np = mmap(fp, 4096, 7, 0x32, -1, 0);
    if (np.toString() !== fp.toString()) { console.log("[P] mmap fail " + fstr + " got " + np); return; }
    // write back via writeByteArray (through writable anon mapping)
    fp.writeByteArray(buf.readByteArray(4096));
    ok++;
});
console.log("[P] remapped ok=" + ok + "/" + fails.length);
