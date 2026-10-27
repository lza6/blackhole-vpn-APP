var mprotect = new NativeFunction(Module.getExportByName("libc.so","mprotect"), 'int', ['pointer','uint','int']);
// unlock libart AND any r-x p mapping that contains 0x...1c6a0-adjacent region? 实际: fail 页来自 boot.oat/boot.art。
// 更通用: 找到所有 r-x 匿名/文件映射 >1MB 全解锁
var ranges = Process.enumerateRangesSync('r-x');
var ok=0, fail=0;
ranges.forEach(function(r){
    if (r.size < 0x100000) return; // 只处理大段
    var page = ptr(r.base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
    var sz = Math.ceil((r.size + (r.base.toUInt32 ? 0:0))/4096)*4096;
    try {
        var ret = mprotect(page, Math.ceil(r.size/4096)*4096, 7);
        if (ret===0) ok++; else fail++;
    } catch(e){ fail++; }
});
console.log("[M] big r-x ranges: ok="+ok+" fail="+fail);
var art = Process.findModuleByName("libart.so");
if (art) {
    var page = ptr(art.base.toString()).and(ptr("0xFFFFFFFFFFFFF000"));
    var ok2=0, fail2=[];
    for (var off=0; off < art.size; off += 4096) {
        var r = mprotect(page.add(off), 4096, 7);
        if (r === 0) ok2++; else fail2.push(page.add(off).toString());
    }
    console.log("[M] art ok="+ok2+" fail="+fail2.length+" " + (fail2[0]||""));
    // report fail page's range
    if (fail2.length) {
        var fr = Process.findRangeByAddress(ptr(fail2[0]));
        console.log("[M] fail range: " + JSON.stringify(fr && {base: fr.base.toString(), size: fr.size, protection: fr.protection, file: fr.file && fr.file.path}));
    }
}
