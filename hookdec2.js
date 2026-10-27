// Broad crypto hook: dump ALL Cipher.doFinal inputs/outputs process-wide
Java.perform(function(){
    var Cipher = Java.use('javax.crypto.Cipher');
    Cipher.doFinal.overload('[B').implementation = function(input){
        var r = this.doFinal(input);
        try {
            var alg = this.getAlgorithm();
            var b64in = Java.use('android.util.Base64').encodeToString(input, 2);
            var b64out = Java.use('android.util.Base64').encodeToString(r, 2);
            console.log("[CIPHER] alg=" + alg + " in=" + b64in.substring(0,200) + " out=" + b64out.substring(0,400));
        } catch(e){}
        return r;
    };
    // SecretKeySpec keys
    var SK = Java.use('javax.crypto.spec.SecretKeySpec');
    SK.$init.overload('[B','java.lang.String').implementation = function(key, alg){
        var hex = Array.prototype.map.call(key, function(b){return ('0'+(b&0xff).toString(16)).slice(-2);}).join('');
        console.log("[KEY] alg=" + alg + " key=" + hex);
        return this.$init(key, alg);
    };
    var IV = Java.use('javax.crypto.spec.IvParameterSpec');
    IV.$init.overload('[B').implementation = function(iv){
        var hex = Array.prototype.map.call(iv, function(b){return ('0'+(b&0xff).toString(16)).slice(-2);}).join('');
        console.log("[IV] " + hex);
        return this.$init(iv);
    };
    console.log("[*] crypto hooks ready");
});
