# 黑洞加速器 (5.17634.94114_Mod) 逆向报告

> 目标：提取该 VPN 应用的节点/代理源，接入线上代理池
> 状态：**协议与基础设施已完全打通；节点解密 key 待抓取**

## 1. 应用结构

| 层 | 技术 |
|---|---|
| 壳 | DPT-Shell (luoyesiqiu 抽取壳) + 菜鸟云验证 (qidianyun.icu, appid=31) |
| 真身包名 | `org.greatfire.gfvpn` (对外 `com.blackhole.hd1763494114`) |
| 内核 | v2ray-core (libgojni.so, Go) + libtun2socks.so |
| 加固资产 | `assets/aP5nR8wY2sL` (3.7MB 加密 dex), `assets/bT3kM6xQ1zH` (224B key), native `libc4f7a2e9d1b8.so` (MilkObfuscator 定制 DPT) |
| 白盒加密 | `libcryptbox.so` (Java_com_crypt_box_CryptBox_decrypt, AES whitebox CFB/CTR/OFB) |

## 2. 完全脱壳产物（已落地）

- `dec.zip` → 4 个解密 dex（主 9.75MB）— 从 `/data/user/0/.../code_cache/h9Vc4eN7uD.zip` dump
- `jadx-real/` — 全量反编译源码（部分方法体被 CodeItem 抽取，需运行时 hook）

## 3. API 协议（静态+运行时确认）

**域名池**（端口 20000，TLS 自签）：
```
https://www.h7ayd.info:20000   (当前 DNS 失效)
https://www.hmj1ed.cc:20000    ★ 存活
https://www.hmq5hd.cc:20000    (失效)
https://www.hmt4ad.cc:20000    (失效)
https://www.hu5yed.cc:20000    (失效)
https://www.hxl5d.info:20000   (失效)
```

**端点**：
| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/alive` | GET | 明文心跳, 200 |
| `/api/evmess` | GET | **节点列表 (AES 加密 base64)** ★ |
| `/api/eversion` | GET | 版本/更新 (AES 加密, 11KB) |
| `/api/rules` | GET | 明文 JSON（邀请奖励规则） |
| `/api/links` | GET | PHP debug 泄露: `var_dump(md5锚点, sign, token)` |
| `/api/node` | GET | `{"ret":0,"msg":"token is null"}` (需 token) |

**关键泄露**：`/api/links` 返回 `string(32) "22a436ecbb589469bf587c8c07bea5d7"` — appid=31 的服务端固定 sign/key 锚点。

**已抓密钥**：云验证 AES-CBC key = `1234567890abcdef`（解出 `org.greatfire.gfvpn.IntroActivity`）。
**未抓密钥**：evmess 响应 key（请求参数派生，静态穷举未命中）。

## 4. 云验证流程

1. 启动 → 菜鸟云验证请求 `shell.qidianyun.icu/shell.php?version=155&appid=31...`
2. 失败重试 2 轮地址池 → 杀进程（`Runtime.exit` + `Process.killProcess`，frida 可拦）
3. 成功 → 加载远程 dex → 放行

## 5. 模拟器运行要点（Windows x86_64 + arm64 APK）

```
emulator -avd remakeface -no-window -no-audio -no-boot-anim -dns-server 192.168.1.2
```
- APK 强制 `--abi arm64-v8a`，走 ndk_translation
- 壳查 `vmInstructionSet` 得 x86_64 → patch dex 字符串 `dalvik.system.VMRuntime`→`VMruntimex`（等长）让 Java 抛异常回退 `"arm64"`
- **SIGSEGV 抽卡**：壳的 native ART inline-hook 与 ndk_translation 冲突，每 boot ~10% 存活，用 `bootluck.sh` 自动重启直到 `SURVIVED`
- spawn+frida 与壳互斥（RWX unlock 消 SIGSEGV 后又触发 VerifyError）；只能自然启动 + pid 轮询 attach（`watch2.py`）
- 广告 app（`com.photoeditor.remakemefaceswapaigenerator` 等 3 个）会抢前台并触发云验证黑名单杀进程 → `pm disable-user`

## 6. 抓 evmess key 的最优路线（下次会话执行）

**方案 A（推荐）：mitmproxy TLS 中间人**
```powershell
pip install mitmproxy
mitmproxy --listen-port 8888
# 模拟器 WiFi 代理指向宿主机:8888, 安装 mitmproxy CA 到系统证书(adb root remount /system)
```
app 直连 `www.hmj1ed.cc:20000`（非 443）— DNS 已由宿主 `dnsredir4.py` 劫持到 10.0.2.2，也可改 hosts 到 mitmproxy 端口。

**方案 B：boot-luck 窗口内 frida 抓**
```bash
bash bootluck.sh            # 直到 SURVIVED, PID 写入 survpid
frida -U -p $(cat survpid) -l antitamp3.js -l hookdec2.js -l bypass2.js
# 然后点穿 Disclosure→Intro→FreeTrial→VPN consent
# hookdec2.js 抓 SecretKeySpec(key)+Cipher.doFinal(input/output)
```

## 7. 拿到节点后的代理池接入

节点为 vmess 协议（v2ray 内核），解密后 `LineActivity$NodeListTask` 响应即节点列表 JSON。
接入 new-api 现有代理池（`relay/channel/tryingopen/proxy_pool`）：
- vmess 节点 ≠ HTTP 代理，需本地起 v2ray/xray 把每个 vmess 转成本地 socks/http 端口
- 建议：`xray -c node.json`（每节点 10801+ 端口）→ 把 `127.0.0.1:108xx` 写入 `TRYINGOPEN_PROXIES`

## 8. 文件清单

| 文件 | 说明 |
|---|---|
| `app.apk` / `app_patched.apk` | 原始 / VMRuntime-patched（jarsigner 重签） |
| `dec.zip` / `dec-dex/` | 脱壳 dex |
| `jadx-real/` | 真实代码反编译 |
| `hookdec2.js` | Cipher/SecretKeySpec/IvParameterSpec 全局 hook ★ |
| `antitamp3.js` | libc tgkill/kill/raise/abort 替换（防自杀） |
| `bypass2.js` | Runtime.exit/System.exit/killProcess 拦截 |
| `bypass.js` / `fixabi*.js` | 早期 hook 尝试 |
| `dnsredir4.py` | 宿主 DNS 劫持（www.hmj1ed.cc→10.0.2.2, dnslib） |
| `mitm_log.py` | :20000 请求记录器 |
| `bootluck.sh` / `bootluck2.sh` | 模拟器抽卡循环 |
| `watch2.py` | pid 轮询 attach + 自动 hook |
| `gateart2.py` | spawn+RWX unlock+hook 组合 |

---

## 9. 深入攻坚记录（2026-10-27 续）

### 9.1 SIGSEGV 根因确认

崩溃 `SIGSEGV/SEGV_ACCERR @ art::ClassLinker::LookupClass+0 (0x...41c6a0)` 的根因是
**libndk_translation 翻译器对 guest(ARM) 代码页自维护 W^X 保护**：
- 壳(DPT) 的 native 层需要 inline-hook `libart.so` 的 `.rodata/r-x` 段
- `mprotect` 在 21 个 `r--` 段页上返回 -1（`/apex` 文件映射受保护）
- `MAP_FIXED|MAP_ANONYMOUS` 重映射（内容读出写回, 21/21 成功）虽可执行，但破坏了
  ART 对 `.rodata` 的引用完整性 → `SEGV_MAPERR @ 0x37`
- **结论：x86_64 模拟器(ndk_translation) 下应用层无法绕过；昨日偶发成功是翻译窗口竞态**

### 9.2 VerifyError 关系

RWX unlock 后 SIGSEGV 消失，但出现 `VerifyError: CoreComponentFactory (data table 指令)`：
- 壳注入的 dex 使用 DEX 隐藏 opcode（data table），需壳先 hook verifier 才认
- spawn+frida 会干扰壳的 verifier hook 时序 → 与 spawn 模式互斥
- 只有自然启动 + boot-luck 窗口才能完整走通

### 9.3 已验证的防自杀 hook（生产可用）

```js
// antitamp3.js — libc 级替换, 壳的所有自杀路径全部吞掉
['tgkill','kill','raise','abort','pthread_kill'].forEach(Interceptor.replace → return 0)
// bypass2.js — Java 级
Runtime.exit / Runtime.halt / System.exit / Process.killProcess → 拦截
```

### 9.4 云验证密钥（实抓）

`javax.crypto.spec.SecretKeySpec` hook 输出:
```
[KEY] alg=AES key=31323334353637383930616263646566  (ASCII: "1234567890abcdef")
[IV]  c430e17437beb1a2f428005d6c340496
[CIPHER] alg=AES/CBC/PKCS5Padding → org.greatfire.gfvpn.IntroActivity
```

### 9.5 待办：evmess key

| 方案 | 可行性 |
|---|---|
| mitmproxy + 用户 CA（TLS MITM :20000） | ★★★★★ 需真机或可跑通 app 的环境 |
| 真机 Frida（hookdec2.js 一键） | ★★★★★ 最省事 |
| unidbg 离线调 libcryptbox.so | ★★★ 需补 JNI 环境 |
| x86_64 模拟器继续抽卡 | ★ 已证实受 ndk_translation W^X 限制 |
