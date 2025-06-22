#ifndef TERMINAL_H
#define TERMINAL_H

#include <stdint.h>
#include <stddef.h>

// Terminal dimensions
#define TERM_WIDTH 80
#define TERM_HEIGHT 24
#define TERM_BUFFER_SIZE (TERM_WIDTH * TERM_HEIGHT)

// ANSI escape codes
#define ANSI_RESET "\033[0m"
#define ANSI_BOLD "\033[1m"
#define ANSI_DIM "\033[2m"
#define ANSI_UNDERLINE "\033[4m"
#define ANSI_BLINK "\033[5m"
#define ANSI_REVERSE "\033[7m"

// Colors
#define ANSI_BLACK "\033[30m"
#define ANSI_RED "\033[31m"
#define ANSI_GREEN "\033[32m"
#define ANSI_YELLOW "\033[33m"
#define ANSI_BLUE "\033[34m"
#define ANSI_MAGENTA "\033[35m"
#define ANSI_CYAN "\033[36m"
#define ANSI_WHITE "\033[37m"

// Cursor control
#define ANSI_CURSOR_UP "\033[A"
#define ANSI_CURSOR_DOWN "\033[B"
#define ANSI_CURSOR_RIGHT "\033[C"
#define ANSI_CURSOR_LEFT "\033[D"
#define ANSI_CURSOR_HOME "\033[H"
#define ANSI_CLEAR_SCREEN "\033[2J"
#define ANSI_CLEAR_LINE "\033[K"

// Character cell
typedef struct {
    char ch;
    uint8_t fg_color;
    uint8_t bg_color;
    uint8_t attributes;
} term_cell_t;

// Terminal state
typedef struct {
    term_cell_t screen[TERM_HEIGHT][TERM_WIDTH];
    int cursor_x;
    int cursor_y;
    uint8_t current_fg;
    uint8_t current_bg;
    uint8_t current_attr;
    int escape_state;
    char escape_buffer[32];
    int escape_pos;
} terminal_state_t;

// Terminal functions
int terminal_init(void);
void terminal_clear(void);
void terminal_put_char(char c);
void terminal_put_string(const char *str);
void terminal_set_color(uint8_t fg, uint8_t bg);
void terminal_set_cursor(int x, int y);
void terminal_scroll_up(void);
void terminal_process_escape(const char *seq);
char *terminal_get_screen_buffer(void);
void terminal_render_to_string(char *buffer, size_t size);

#endif // TERMINAL_H
