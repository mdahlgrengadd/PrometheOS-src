#ifndef SHELL_H
#define SHELL_H

#include <stdint.h>
#include <stddef.h>

// Maximum command length
#define MAX_COMMAND_LENGTH 1024
#define MAX_ARGS 64
#define MAX_ENV_VARS 128
#define MAX_HISTORY 100

// Command structure
typedef struct
{
    char *name;
    int (*handler)(int argc, char **argv);
    char *description;
} shell_command_t;

// Environment variable
typedef struct
{
    char *name;
    char *value;
} env_var_t;

// Shell state
typedef struct
{
    char prompt[64];
    char current_dir[256];
    env_var_t env_vars[MAX_ENV_VARS];
    int env_count;
    char history[MAX_HISTORY][MAX_COMMAND_LENGTH];
    int history_count;
    int history_index;
    char input_buffer[MAX_COMMAND_LENGTH];
    int input_pos;
    int cursor_pos;
} shell_state_t;

// Shell functions
int shell_init(void);
int shell_execute_command(const char *command);
int shell_parse_command(const char *input, char **args);
void shell_add_history(const char *command);
char *shell_get_env(const char *name);
void shell_set_env(const char *name, const char *value);
void shell_prompt(void);

// Built-in commands
int cmd_help(int argc, char **argv);
int cmd_ls(int argc, char **argv);
int cmd_cd(int argc, char **argv);
int cmd_pwd(int argc, char **argv);
int cmd_echo(int argc, char **argv);
int cmd_cat(int argc, char **argv);
int cmd_mkdir(int argc, char **argv);
int cmd_rmdir(int argc, char **argv);
int cmd_rm(int argc, char **argv);
int cmd_cp(int argc, char **argv);
int cmd_mv(int argc, char **argv);
int cmd_ps(int argc, char **argv);
int cmd_kill(int argc, char **argv);
int cmd_env(int argc, char **argv);
int cmd_export(int argc, char **argv);
int cmd_history(int argc, char **argv);
int cmd_clear(int argc, char **argv);
int cmd_whoami(int argc, char **argv);

#endif // SHELL_H
