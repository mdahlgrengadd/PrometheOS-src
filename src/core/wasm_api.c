#include "include/pty.h"
#include "include/terminal.h"
#include "include/shell.h"
#include <emscripten.h>
#include <string.h>

// JavaScript-callable wrapper functions
EMSCRIPTEN_KEEPALIVE
int wasm_pty_write_input(const char *data, int len)
{
    return pty_write(1, data, len);
}

EMSCRIPTEN_KEEPALIVE
int wasm_pty_read_output(char *buffer, int max_len)
{
    return pty_read(1, buffer, max_len);
}

EMSCRIPTEN_KEEPALIVE
int wasm_pty_has_output(void)
{
    return pty_has_data();
}

EMSCRIPTEN_KEEPALIVE
char *wasm_pty_get_screen(void)
{
    return pty_get_screen();
}

EMSCRIPTEN_KEEPALIVE
void wasm_pty_set_mode(int mode)
{
    pty_set_mode((uint8_t)mode);
}

EMSCRIPTEN_KEEPALIVE
int wasm_pty_get_mode(void)
{
    return (int)pty_get_mode();
}

EMSCRIPTEN_KEEPALIVE
void wasm_pty_flush(void)
{
    pty_flush_output();
}

EMSCRIPTEN_KEEPALIVE
void wasm_shell_execute(const char *command)
{
    shell_execute_command(command);
}

EMSCRIPTEN_KEEPALIVE
char *wasm_shell_get_env(const char *name)
{
    return shell_get_env(name);
}

EMSCRIPTEN_KEEPALIVE
void wasm_shell_set_env(const char *name, const char *value)
{
    shell_set_env(name, value);
}

EMSCRIPTEN_KEEPALIVE
void wasm_shell_prompt(void)
{
    shell_prompt();
}

EMSCRIPTEN_KEEPALIVE
void wasm_terminal_clear(void)
{
    terminal_clear();
}

EMSCRIPTEN_KEEPALIVE
void wasm_terminal_put_string(const char *str)
{
    terminal_put_string(str);
}

// Constants for JavaScript
EMSCRIPTEN_KEEPALIVE
int get_pty_mode_raw(void) { return PTY_MODE_RAW; }

EMSCRIPTEN_KEEPALIVE
int get_pty_mode_echo(void) { return PTY_MODE_ECHO; }

EMSCRIPTEN_KEEPALIVE
int get_pty_mode_canon(void) { return PTY_MODE_CANON; }

EMSCRIPTEN_KEEPALIVE
int get_term_width(void) { return TERM_WIDTH; }

EMSCRIPTEN_KEEPALIVE
int get_term_height(void) { return TERM_HEIGHT; }
