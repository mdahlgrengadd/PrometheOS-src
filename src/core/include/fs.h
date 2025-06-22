#ifndef FS_H
#define FS_H

#include <stdint.h>
#include <stddef.h>
#include <unistd.h>
#include <sys/types.h>

// Event-bus ABI - Fixed-width message tags (≤32 bytes, version-prefixed)
typedef enum {
    FS_READ = 1,
    FS_WRITE = 2,
    FS_RENAME = 3,
    FS_DELETE = 4,
    FS_CHANGED = 5
} fs_msg_type_t;

// Bus message header (exactly 32 bytes)
typedef struct {
    uint8_t version;        // ABI version (currently 1)
    uint8_t type;          // fs_msg_type_t
    uint16_t flags;        // Operation flags
    uint32_t seq;          // Sequence number
    uint32_t data_len;     // Length of following data
    char path[20];         // Path (truncated if needed)
} __attribute__((packed)) bus_msg_t;

// Process info for /proc/stat
typedef struct {
    uint32_t pid;
    char name[16];
    uint8_t state;         // R=running, S=sleeping, Z=zombie
    uint32_t utime;        // User time
    uint32_t stime;        // System time
} proc_info_t;

// Core functions
int fs_init(void);
int bus_init(void);
int pty_init(void);
void fs_cleanup(void);

// Filesystem operations
int fs_mount_all(void);
ssize_t fs_safe_write(const char* path, const void* data, size_t len);
int fs_emit_changed(const char* path);

#endif // FS_H
