// Dump all in-memory dex/art after shell decryption
Java.perform(function() {
    var seen = {};
    function dumpRegion(begin, size, tag) {
        if (size < 0x10000 || size > 0x8000000) return;
        var magic;
        try { magic = Memory.readByteArray(begin, 8); } catch(e) { return; }
        var m = new Uint8Array(magic);
        // dex: 64 65 78 0a ; cdex: 63 64 65 78
        var isDex = m[0]==0x64&&m[1]==0x65&&m[2]==0x78&&m[3]==0x0a;
        var isCdex = m[0]==0x63&&m[1]==0x64&&m[2]==0x65&&m[3]==0x78;
        if (!isDex && !isCdex) return;
        var key = begin.toString();
        if (seen[key]) return; seen[key]=1;
        var fsize;
        try { fsize = Memory.readU32(begin.add(0x20)); } catch(e){ fsize = size; }
        if (fsize < 0x1000 || fsize > 0x10000000) fsize = size;
        var path = "/data/local/tmp/dump_" + tag + "_" + begin + "_" + fsize + ".dex";
        var fout = new File(path, "wb");
        fout.write(Memory.readByteArray(begin, fsize));
        fout.close();
        console.log("[DUMPED] " + path + " magic=" + (isCdex?"cdex":"dex"));
    }
    var modules = Process.enumerateModules();
    var ranges = Process.enumerateRangesSync('r--');
    var count = 0;
    ranges.forEach(function(r) {
        if (count > 400) return;
        try {
            Memory.scanSync(r.base, Math.min(r.size, 0x4000000), "64 65 78 0a 03 00", {
                onMatch: function(addr, sz) { dumpRegion(addr, r.size, "a"); count++; },
                onComplete: function() {}
            });
        } catch(e) {}
    });
    console.log("[DONE] scanned, dumped=" + Object.keys(seen).length);
});
