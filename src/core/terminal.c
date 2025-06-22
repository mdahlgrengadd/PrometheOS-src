#include "include/terminal.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

// Global terminal state
static terminal_state_t term_state = {0};

// Color mapping for ANSI codes
static const uint8_t ansi_colors[] = {
    0, // Black
    1, // Red
    2, // Green
    3, // Yellow
    4, // Blue
    5, // Magenta
    6, // Cyan
    7  // White
};

int terminal_init(void)
{
    memset(&term_state, 0, sizeof(term_state));

    // Initialize with default colors
    term_state.current_fg = 7; // White
    term_state.current_bg = 0; // Black
    term_state.current_attr = 0;

    terminal_clear();
    return 0;
}

void terminal_clear(void)
{
    for (int y = 0; y < TERM_HEIGHT; y++)
    {
        for (int x = 0; x < TERM_WIDTH; x++)
        {
            term_state.screen[y][x].ch = ' ';
            term_state.screen[y][x].fg_color = term_state.current_fg;
            term_state.screen[y][x].bg_color = term_state.current_bg;
            term_state.screen[y][x].attributes = 0;
        }
    }
    term_state.cursor_x = 0;
    term_state.cursor_y = 0;
}

void terminal_put_char(char c)
{
    switch (c)
    {
    case '\n':
        term_state.cursor_x = 0;
        term_state.cursor_y++;
        if (term_state.cursor_y >= TERM_HEIGHT)
        {
            terminal_scroll_up();
            term_state.cursor_y = TERM_HEIGHT - 1;
        }
        break;

    case '\r':
        term_state.cursor_x = 0;
        break;

    case '\t':
        // Tab to next 8-character boundary
        term_state.cursor_x = (term_state.cursor_x + 8) & ~7;
        if (term_state.cursor_x >= TERM_WIDTH)
        {
            terminal_put_char('\n');
        }
        break;

    case '\b':
        if (term_state.cursor_x > 0)
        {
            term_state.cursor_x--;
            term_state.screen[term_state.cursor_y][term_state.cursor_x].ch = ' ';
        }
        break;

    case '\033': // ESC - start escape sequence
        term_state.escape_state = 1;
        term_state.escape_pos = 0;
        term_state.escape_buffer[0] = c;
        term_state.escape_buffer[1] = '\0';
        break;

    default:
        if (term_state.escape_state)
        {
            // Accumulate escape sequence
            if (term_state.escape_pos < sizeof(term_state.escape_buffer) - 2)
            {
                term_state.escape_buffer[++term_state.escape_pos] = c;
                term_state.escape_buffer[term_state.escape_pos + 1] = '\0';
            }

            // Check if sequence is complete
            if (c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z')
            {
                terminal_process_escape(term_state.escape_buffer);
                term_state.escape_state = 0;
            }
        }
        else if (c >= 32 && c <= 126)
        { // Printable characters
            if (term_state.cursor_x < TERM_WIDTH)
            {
                term_state.screen[term_state.cursor_y][term_state.cursor_x].ch = c;
                term_state.screen[term_state.cursor_y][term_state.cursor_x].fg_color = term_state.current_fg;
                term_state.screen[term_state.cursor_y][term_state.cursor_x].bg_color = term_state.current_bg;
                term_state.screen[term_state.cursor_y][term_state.cursor_x].attributes = term_state.current_attr;
                term_state.cursor_x++;

                if (term_state.cursor_x >= TERM_WIDTH)
                {
                    terminal_put_char('\n');
                }
            }
        }
        break;
    }
}

void terminal_put_string(const char *str)
{
    while (*str)
    {
        terminal_put_char(*str++);
    }
}

void terminal_set_color(uint8_t fg, uint8_t bg)
{
    term_state.current_fg = fg & 7;
    term_state.current_bg = bg & 7;
}

void terminal_set_cursor(int x, int y)
{
    if (x >= 0 && x < TERM_WIDTH && y >= 0 && y < TERM_HEIGHT)
    {
        term_state.cursor_x = x;
        term_state.cursor_y = y;
    }
}

void terminal_scroll_up(void)
{
    // Move all lines up by one
    for (int y = 0; y < TERM_HEIGHT - 1; y++)
    {
        memcpy(term_state.screen[y], term_state.screen[y + 1],
               sizeof(term_cell_t) * TERM_WIDTH);
    }

    // Clear bottom line
    for (int x = 0; x < TERM_WIDTH; x++)
    {
        term_state.screen[TERM_HEIGHT - 1][x].ch = ' ';
        term_state.screen[TERM_HEIGHT - 1][x].fg_color = term_state.current_fg;
        term_state.screen[TERM_HEIGHT - 1][x].bg_color = term_state.current_bg;
        term_state.screen[TERM_HEIGHT - 1][x].attributes = 0;
    }
}

void terminal_process_escape(const char *seq)
{
    if (strlen(seq) < 2)
        return;

    if (seq[1] == '[')
    { // CSI sequence
        const char *params = &seq[2];
        char cmd = seq[strlen(seq) - 1];

        switch (cmd)
        {
        case 'A': // Cursor up
            if (term_state.cursor_y > 0)
                term_state.cursor_y--;
            break;

        case 'B': // Cursor down
            if (term_state.cursor_y < TERM_HEIGHT - 1)
                term_state.cursor_y++;
            break;

        case 'C': // Cursor right
            if (term_state.cursor_x < TERM_WIDTH - 1)
                term_state.cursor_x++;
            break;

        case 'D': // Cursor left
            if (term_state.cursor_x > 0)
                term_state.cursor_x--;
            break;

        case 'H': // Cursor home
            term_state.cursor_x = 0;
            term_state.cursor_y = 0;
            break;

        case 'J': // Clear screen
            if (*params == '2')
            {
                terminal_clear();
            }
            break;

        case 'K': // Clear line
            for (int x = term_state.cursor_x; x < TERM_WIDTH; x++)
            {
                term_state.screen[term_state.cursor_y][x].ch = ' ';
            }
            break;

        case 'm': // Set graphics mode
        {
            int code = atoi(params);
            if (code == 0)
            {
                // Reset
                term_state.current_fg = 7;
                term_state.current_bg = 0;
                term_state.current_attr = 0;
            }
            else if (code >= 30 && code <= 37)
            {
                // Foreground color
                term_state.current_fg = ansi_colors[code - 30];
            }
            else if (code >= 40 && code <= 47)
            {
                // Background color
                term_state.current_bg = ansi_colors[code - 40];
            }
            else if (code == 1)
            {
                term_state.current_attr |= 1; // Bold
            }
            else if (code == 4)
            {
                term_state.current_attr |= 2; // Underline
            }
        }
        break;
        }
    }
}

void terminal_render_to_string(char *buffer, size_t size)
{
    int pos = 0;

    for (int y = 0; y < TERM_HEIGHT && pos < size - 1; y++)
    {
        for (int x = 0; x < TERM_WIDTH && pos < size - 1; x++)
        {
            buffer[pos++] = term_state.screen[y][x].ch;
        }
        if (pos < size - 1)
            buffer[pos++] = '\n';
    }

    buffer[pos] = '\0';
}
