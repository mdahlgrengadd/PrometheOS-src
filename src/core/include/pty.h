#ifndef PTY_H
#define PTY_H

#include <stdint.h>
#include <stddef.h>
#include <sys/types.h>
#include "terminal.h"
#include "shell.h"

// TTY ring buffers (8KB each direction for larger capacity)
typedef struct
{
    uint8_t data[8192];
    volatile uint32_t read_pos;
    volatile uint32_t write_pos;
} tty_buffer_t;

// PTY mode flags
#define PTY_MODE_RAW 0x01
#define PTY_MODE_ECHO 0x02
#define PTY_MODE_CANON 0x04

// TTY state with enhanced features
typedef struct
{
    tty_buffer_t input;     // Input from user
    tty_buffer_t output;    // Output to user
    terminal_state_t term;  // Terminal emulation state
    shell_state_t shell;    // Shell state
    uint8_t mode_flags;     // PTY mode flags
    int is_active;          // Whether PTY is actively processing
    char line_buffer[1024]; // Line buffering for canonical mode
    int line_pos;           // Position in line buffer
} tty_state_t;

// Global TTY state
extern tty_state_t tty1;

// Enhanced PTY operations
int pty_init(void);
ssize_t pty_read(int fd, void *buf, size_t count);
ssize_t pty_write(int fd, const void *buf, size_t count);

// Enhanced PTY functions
int pty_process_input(void);
void pty_set_mode(uint8_t flags);
uint8_t pty_get_mode(void);
void pty_flush_output(void);
int pty_has_data(void);
char *pty_get_screen(void);
void pty_send_output(const char *data, size_t len);

// Input processing
void pty_handle_keypress(char key);
void pty_handle_special_key(const char *seq);

#endif // PTY_H
