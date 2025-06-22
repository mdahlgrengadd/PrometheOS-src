#include "include/pty.h"
#include <string.h>

// Global TTY state
tty_state_t tty1 = {0};

// Initialize PTY (20 lines total implementation)
int pty_init(void) {
    memset(&tty1, 0, sizeof(tty1));
    return 0;
}

// Read from TTY
ssize_t pty_read(int fd, void* buf, size_t count) {
    if (fd != 1) return -1; // Only support tty1
    tty_buffer_t* tb = &tty1.output;
    uint32_t available = (tb->write_pos - tb->read_pos) % sizeof(tb->data);
    if (available == 0) return 0;
    uint32_t to_read = (count < available) ? count : available;
    for (uint32_t i = 0; i < to_read; i++) {
        ((char*)buf)[i] = tb->data[(tb->read_pos + i) % sizeof(tb->data)];
    }
    tb->read_pos = (tb->read_pos + to_read) % sizeof(tb->data);
    return to_read;
}

// Write to TTY  
ssize_t pty_write(int fd, const void* buf, size_t count) {
    if (fd != 1) return -1; // Only support tty1
    tty_buffer_t* tb = &tty1.input;
    for (size_t i = 0; i < count; i++) {
        tb->data[tb->write_pos] = ((const char*)buf)[i];
        tb->write_pos = (tb->write_pos + 1) % sizeof(tb->data);
    }
    return count;
}
