#include "include/fs.h"
#include "include/bus.h"
#include "include/pty.h"
#include <emscripten.h>
#include <emscripten/wasmfs.h>
#include <stdio.h>
#include <unistd.h>
#include <pthread.h>
#include <errno.h>

// Entry point - mount filesystems, init subsystems, loop forever
int main() {
    printf("Starting minimal WASM kernel...\n");
    
    // Mount WasmFS with OPFS at /home and MemFS at /tmp
    if (fs_mount_all() != 0) {
        printf("Failed to mount filesystems\n");
        return 1;
    }
    
    // Initialize subsystems
    if (bus_init() != 0) {
        printf("Failed to initialize event bus\n");
        return 1;
    }
    
    if (pty_init() != 0) {
        printf("Failed to initialize PTY\n");
        return 1;
    }
    
    printf("Kernel initialized successfully\n");
    
    // Main loop - process events forever
    for (;;) {
        bus_msg_t msg;
        uint8_t data[1024];
        
        // Poll for messages (non-blocking)
        if (bus_poll_message(&msg, data, sizeof(data)) > 0) {
            // Handle message based on type
            switch (msg.type) {
                case FS_READ:
                case FS_WRITE:
                case FS_RENAME:
                case FS_DELETE:
                    // These would be handled by filesystem workers
                    break;
                case FS_CHANGED:
                    // Notify listeners of filesystem changes
                    break;
            }
        }
        
        // Yield to other threads
        emscripten_sleep(1);
    }
    
    return 0;
}
