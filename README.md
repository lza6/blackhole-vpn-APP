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
