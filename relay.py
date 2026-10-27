# TLS-terminating relay is impossible without client trust; instead log DNS+TCP conns. 
# We can't decrypt TLS to real server. BUT app trusts user CAs? check android:networkSecurityConfig later.
# For now: log connections via mitm_log already. Focus: when app survives, frida hooks give plaintext directly.
print("relay placeholder")
