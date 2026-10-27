var mprotect = new NativeFunction(Module.getExportByName("libc.so","mprotect"), 'int', ['pointer','uint','int']);
function protectArt() {
    var art = Process.findModuleByName("libart.so");
    if (!art) { setTimeout(protectArt, 50); return; }
    var base = art.base;
    var size = art.size;
    var pageDown = ptr(base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
    var sz = Math.ceil(size/4096)*4096 + 4096;
    var r = mprotect(pageDown, sz, 7); // RWX
    console.log("[A] art RWX base=" + base + " sz=" + sz + " ret=" + r);
}
protectArt();
