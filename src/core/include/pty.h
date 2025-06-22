#ifndef PTY_H
#define PTY_H

#include <stdint.h>
#include <stddef.h>
#include <sys/types.h>

// TTY ring buffers (4KB each direction)
typedef struct
{
    uint8_t data[4096];
    volatile uint32_t read_pos;
    volatile uint32_t write_pos;
} tty_buffer_t;

// TTY state
typedef struct
{
    tty_buffer_t input;  // Input from user
    tty_buffer_t output; // Output to user
} tty_state_t;

// Global TTY state
extern tty_state_t tty1;

// PTY operations (20 lines total)
int pty_init(void);
ssize_t pty_read(int fd, void *buf, size_t count);
ssize_t pty_write(int fd, const void *buf, size_t count);

#endif // PTY_H
