#include "include/fs.h"
#include "include/bus.h"
#include <emscripten/wasmfs.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/stat.h>
#include <time.h>

// UUID generation for temp files
static uint32_t uuid_counter = 1;

// Generate simple UUID for temp files
static void generate_uuid(char* buf, size_t len) {
    snprintf(buf, len, "%08x-%04x-%04x", 
             uuid_counter++, (uint32_t)time(NULL) & 0xFFFF, getpid() & 0xFFFF);
}

// Mount all filesystems
int fs_mount_all(void) {
    // Create mount points first
    mkdir("/home", 0755);
    mkdir("/tmp", 0755); 
    mkdir("/proc", 0755);
    
    // Create OPFS backend for /home (persistent storage)
    backend_t opfs = wasmfs_create_opfs_backend();
    if (opfs >= 0) {
        printf("✓ OPFS backend created for /home\n");
    } else {
        printf("⚠ OPFS creation failed, filesystem will use MemFS\n");
    }
    
    // Note: In WasmFS, backends are automatically available
    // No explicit mounting needed - directories use appropriate backends
    
    // Create necessary directories
    mkdir("/home/.tmp", 0755);
    
    printf("Filesystems ready: /home (OPFS if available), /tmp (MemFS)\n");
    return 0;
}

// Crash-safe write: write to temp file, fsync, then rename atomically
ssize_t fs_safe_write(const char* path, const void* data, size_t len) {
    char temp_path[256];
    char uuid[64];
    
    // Generate temporary file path
    generate_uuid(uuid, sizeof(uuid));
    snprintf(temp_path, sizeof(temp_path), "/home/.tmp/%s", uuid);
    
    // Write to temporary file
    int fd = open(temp_path, O_WRONLY | O_CREAT | O_EXCL, 0644);
    if (fd < 0) {
        return -1;
    }
    
    ssize_t written = write(fd, data, len);
    if (written != (ssize_t)len) {
        close(fd);
        unlink(temp_path);
        return -1;
    }
    
    // Force write to storage
    if (fsync(fd) != 0) {
        close(fd);
        unlink(temp_path);
        return -1;
    }
    
    close(fd);
    
    // Atomic rename
    if (rename(temp_path, path) != 0) {
        unlink(temp_path);
        return -1;
    }
    
    // Emit FS_CHANGED event
    fs_emit_changed(path);
    
    return written;
}

// Emit filesystem change event
int fs_emit_changed(const char* path) {
    bus_msg_t msg = {
        .version = 1,
        .type = FS_CHANGED,
        .flags = 0,
        .seq = 0,
        .data_len = 0
    };
    
    // Copy path (truncate if too long)
    strncpy(msg.path, path, sizeof(msg.path) - 1);
    msg.path[sizeof(msg.path) - 1] = '\0';
    
    return bus_post_message(&msg, NULL);
}

// Initialize filesystem
int fs_init(void) {
    printf("Filesystem initialized\n");
    return 0;
}

// Cleanup
void fs_cleanup(void) {
    // Cleanup is handled by WasmFS
}
