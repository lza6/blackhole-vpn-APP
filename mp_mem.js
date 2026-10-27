// 用 /proc/self/mem 直接写, 绕过 mprotect 限制（需要页可写才行——不行，写只读页同样触发 fault）。
// 真正可行的：ptrace POKE_TEXT? 自身进程不行。
// 尝试2: remount apex (需要 root + magisksu). adb root 已是 root: 用 setcon? SELinux context u:r:su:s0 → 直接 mprotect 失败原因可能是文件回写保护，试 open("/proc/self/mem") 写:
var art = Process.findModuleByName("libart.so");
var failPage = ptr("0x7d6f55342000"); // 上次失败的页
// 实际每次地址不同，动态找:
var page = ptr(art.base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
var mprotect = new NativeFunction(Module.getExportByName("libc.so","mprotect"), 'int', ['pointer','uint','int']);
var fails = [];
for (var off=0; off < art.size; off += 4096) {
    var r = mprotect(page.add(off), 4096, 7);
    if (r !== 0) fails.push(page.add(off));
}
console.log("[P] fails=" + fails.length);
if (fails.length) {
    // try MAP_FIXED remap the failing pages as RWX anonymous
    var mmap = new NativeFunction(Module.getExportByName("libc.so","mmap"), 'pointer', ['pointer','uint','int','int','int','long']);
    var memcpy = new NativeFunction(Module.getExportByName("libc.so","memcpy"), 'pointer', ['pointer','pointer','uint']);
    fails.slice(0,25).forEach(function(fp){
        var buf = Memory.alloc(4096);
        memcpy(buf, fp, 4096); // 读出内容
        var np = mmap(fp, 4096, 7, 0x32 /*MAP_FIXED|MAP_PRIVATE|MAP_ANONYMOUS*/, -1, 0);
        if (!np.equals(fp)) { console.log("[P] mmap fail @"+fp); return; }
        memcpy(fp, buf, 4096); // 写回内容
        console.log("[P] remapped RWX " + fp);
    });
}
