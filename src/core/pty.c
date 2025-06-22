#include "include/pty.h"
#include "include/terminal.h"
#include "include/shell.h"
#include <string.h>
#include <stdio.h>

// Global TTY state
tty_state_t tty1 = {0};

// Initialize PTY with enhanced features
int pty_init(void)
{
    memset(&tty1, 0, sizeof(tty1));

    // Initialize terminal emulation
    if (terminal_init() != 0)
    {
        return -1;
    }

    // Initialize shell
    if (shell_init() != 0)
    {
        return -1;
    }

    // Set default mode (canonical with echo)
    tty1.mode_flags = PTY_MODE_CANON | PTY_MODE_ECHO;
    tty1.is_active = 1;

    // Initialize with shell prompt
    shell_prompt();

    return 0;
}

// Read from TTY output buffer
ssize_t pty_read(int fd, void *buf, size_t count)
{
    if (fd != 1 || !tty1.is_active)
        return -1;

    tty_buffer_t *tb = &tty1.output;
    uint32_t available = (tb->write_pos - tb->read_pos) % sizeof(tb->data);

    if (available == 0)
        return 0;

    uint32_t to_read = (count < available) ? count : available;

    for (uint32_t i = 0; i < to_read; i++)
    {
        ((char *)buf)[i] = tb->data[(tb->read_pos + i) % sizeof(tb->data)];
    }

    tb->read_pos = (tb->read_pos + to_read) % sizeof(tb->data);
    return to_read;
}

// Write to TTY input buffer
ssize_t pty_write(int fd, const void *buf, size_t count)
{
    if (fd != 1 || !tty1.is_active)
        return -1;

    tty_buffer_t *tb = &tty1.input;

    for (size_t i = 0; i < count; i++)
    {
        char c = ((const char *)buf)[i];

        // Store in input buffer
        tb->data[tb->write_pos] = c;
        tb->write_pos = (tb->write_pos + 1) % sizeof(tb->data);

        // Process input immediately
        pty_handle_keypress(c);
    }

    return count;
}

// Process accumulated input
int pty_process_input(void)
{
    if (!tty1.is_active)
        return 0;

    tty_buffer_t *tb = &tty1.input;
    uint32_t available = (tb->write_pos - tb->read_pos) % sizeof(tb->data);

    while (available > 0)
    {
        char c = tb->data[tb->read_pos];
        tb->read_pos = (tb->read_pos + 1) % sizeof(tb->data);
        available--;

        pty_handle_keypress(c);
    }

    return available;
}

// Handle individual keypress
void pty_handle_keypress(char key)
{
    if (key == '\n' || key == '\r')
    {
        // End of line - execute command
        if (tty1.mode_flags & PTY_MODE_ECHO)
        {
            pty_send_output("\n", 1);
        }

        // Null-terminate line buffer
        tty1.line_buffer[tty1.line_pos] = '\0';

        // Execute command
        if (tty1.line_pos > 0)
        {
            shell_execute_command(tty1.line_buffer);
        }

        // Reset line buffer and show new prompt
        tty1.line_pos = 0;
        shell_prompt();
    }
    else if (key == '\b' || key == 127)
    { // Backspace or DEL
        if (tty1.line_pos > 0)
        {
            tty1.line_pos--;
            if (tty1.mode_flags & PTY_MODE_ECHO)
            {
                pty_send_output("\b \b", 3); // Backspace, space, backspace
            }
        }
    }
    else if (key == '\t')
    { // Tab completion (basic)
        // TODO: Implement tab completion
        if (tty1.mode_flags & PTY_MODE_ECHO)
        {
            pty_send_output("    ", 4); // 4 spaces for now
        }
    }
    else if (key >= 32 && key <= 126)
    { // Printable characters
        if (tty1.line_pos < sizeof(tty1.line_buffer) - 1)
        {
            tty1.line_buffer[tty1.line_pos++] = key;

            if (tty1.mode_flags & PTY_MODE_ECHO)
            {
                pty_send_output(&key, 1);
            }
        }
    }
    else if (key == 27)
    { // ESC - might be start of escape sequence
        // TODO: Handle escape sequences for arrow keys, etc.
        pty_handle_special_key("\033");
    }
}

// Handle special key sequences (arrow keys, function keys, etc.)
void pty_handle_special_key(const char *seq)
{
    // TODO: Implement arrow key navigation, history browsing
    // For now, just ignore special sequences
}

// Send output to the terminal
void pty_send_output(const char *data, size_t len)
{
    tty_buffer_t *tb = &tty1.output;

    for (size_t i = 0; i < len; i++)
    {
        // Add to output buffer
        tb->data[tb->write_pos] = data[i];
        tb->write_pos = (tb->write_pos + 1) % sizeof(tb->data);

        // Also send to terminal emulation for screen rendering
        terminal_put_char(data[i]);
    }
}

// Set PTY mode flags
void pty_set_mode(uint8_t flags)
{
    tty1.mode_flags = flags;
}

// Get current PTY mode flags
uint8_t pty_get_mode(void)
{
    return tty1.mode_flags;
}

// Flush output buffer
void pty_flush_output(void)
{
    tty_buffer_t *tb = &tty1.output;
    tb->read_pos = tb->write_pos;
}

// Check if PTY has data available
int pty_has_data(void)
{
    tty_buffer_t *tb = &tty1.output;
    return (tb->write_pos != tb->read_pos);
}

// Get rendered screen buffer
char *pty_get_screen(void)
{
    static char screen_buffer[TERM_WIDTH * TERM_HEIGHT + TERM_HEIGHT + 1];
    terminal_render_to_string(screen_buffer, sizeof(screen_buffer));
    return screen_buffer;
}
