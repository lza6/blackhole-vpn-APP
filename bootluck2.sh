#!/bin/bash
ADB=/d/android-sdk/platform-tools/adb.exe
for boot in $(seq 1 15); do
  echo "=== BOOT $boot $(date) ==="
  $ADB emu kill 2>/dev/null; sleep 5
  powershell -c "Get-Process | Where-Object {\$_.ProcessName -match 'qemu'} | Stop-Process -Force" 2>/dev/null
  sleep 5
  cd /d/blackhole-vpn && (/d/android-sdk/emulator/emulator.exe -avd remakeface -no-window -no-audio -no-boot-anim -dns-server 192.168.1.2 > emuL2_$boot.log 2>&1 &)
  n=0
  until $ADB shell getprop sys.boot_completed 2>/dev/null | grep -q 1; do sleep 6; n=$((n+1)); [ $n -gt 60 ] && break; done
  $ADB shell "kill \$(pidof fs16) \$(pidof fs17) 2>/dev/null"
  $ADB root >/dev/null 2>&1; sleep 2
  $ADB shell "nohup /data/local/tmp/fs16 >/dev/null 2>&1 &"
  sleep 4
  $ADB shell "pm list packages | grep black" >/dev/null 2>&1 || $ADB install --abi arm64-v8a -r /d/blackhole-vpn/app_patched.apk >/dev/null 2>&1
  for i in $(seq 1 10); do
    $ADB shell am start -n com.blackhole.hd1763494114/com.blackhole.hd1763494114.ui.SplashActivity >/dev/null 2>&1
    sleep 9
    PID=$($ADB shell "pidof org.greatfire.gfvpn" | tr -d '\r')
    if [ -n "$PID" ]; then
      # stability check 15s
      sleep 15
      PID2=$($ADB shell "pidof org.greatfire.gfvpn" | tr -d '\r')
      if [ "$PID" = "$PID2" ]; then echo "SURVIVED boot$boot try$i PID=$PID"; echo $PID > /d/blackhole-vpn/survpid; exit 0; fi
    fi
  done
  echo "boot$boot failed"
done
echo "ALL FAILED"
