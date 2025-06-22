#include "include/shell.h"
#include "include/terminal.h"
#include "include/fs.h"
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <sys/stat.h>
#include <dirent.h>
#include <unistd.h>
#include <errno.h>

// Global shell state
static shell_state_t shell_state = {0};

// Built-in commands table
static shell_command_t builtin_commands[] = {
    {"help", cmd_help, "Show available commands"},
    {"ls", cmd_ls, "List directory contents"},
    {"cd", cmd_cd, "Change directory"},
    {"pwd", cmd_pwd, "Print working directory"},
    {"echo", cmd_echo, "Display text"},
    {"cat", cmd_cat, "Display file contents"},
    {"mkdir", cmd_mkdir, "Create directory"},
    {"rmdir", cmd_rmdir, "Remove directory"},
    {"rm", cmd_rm, "Remove file"},
    {"cp", cmd_cp, "Copy file"},
    {"mv", cmd_mv, "Move/rename file"},
    {"ps", cmd_ps, "List processes"},
    {"kill", cmd_kill, "Kill process"},
    {"env", cmd_env, "Show environment variables"},
    {"export", cmd_export, "Set environment variable"},
    {"history", cmd_history, "Show command history"},
    {"clear", cmd_clear, "Clear screen"},
    {"whoami", cmd_whoami, "Show current user"},
    {NULL, NULL, NULL}};

int shell_init(void)
{
    memset(&shell_state, 0, sizeof(shell_state));

    // Set default prompt
    strcpy(shell_state.prompt, "wasm-kernel$ ");

    // Set default directory
    strcpy(shell_state.current_dir, "/");

    // Set default environment variables
    shell_set_env("PATH", "/bin:/usr/bin");
    shell_set_env("HOME", "/home");
    shell_set_env("USER", "user");
    shell_set_env("SHELL", "/bin/sh");

    // Create initial directory structure
    mkdir("/home", 0755);
    mkdir("/home/user", 0755);
    mkdir("/home/user/documents", 0755);
    mkdir("/home/user/downloads", 0755);
    mkdir("/bin", 0755);
    mkdir("/usr", 0755);
    mkdir("/usr/bin", 0755);
    mkdir("/etc", 0755);
    mkdir("/var", 0755);

    // Create some sample files
    FILE *readme = fopen("/home/user/README.txt", "w");
    if (readme)
    {
        fprintf(readme, "Welcome to the WASM Kernel!\n\n");
        fprintf(readme, "This is a WebAssembly-based operating system kernel\n");
        fprintf(readme, "with a full POSIX-compatible shell environment.\n\n");
        fprintf(readme, "Available commands:\n");
        fprintf(readme, "- ls: List directory contents\n");
        fprintf(readme, "- cd: Change directory\n");
        fprintf(readme, "- pwd: Print working directory\n");
        fprintf(readme, "- mkdir: Create directory\n");
        fprintf(readme, "- cat: Display file contents\n");
        fprintf(readme, "- echo: Display text\n");
        fprintf(readme, "- ps: Show processes\n");
        fprintf(readme, "- help: Show all commands\n\n");
        fprintf(readme, "Try: cat /home/user/README.txt\n");
        fclose(readme);
    }

    FILE *hosts = fopen("/etc/hosts", "w");
    if (hosts)
    {
        fprintf(hosts, "127.0.0.1\tlocalhost\n");
        fprintf(hosts, "::1\tlocalhost\n");
        fclose(hosts);
    }

    // Set working directory to user home
    chdir("/home/user");
    strcpy(shell_state.current_dir, "/home/user");

    return 0;
}

int shell_execute_command(const char *command)
{
    if (!command || strlen(command) == 0)
    {
        return 0;
    }

    // Add to history
    shell_add_history(command);

    // Parse command
    char *args[MAX_ARGS];
    int argc = shell_parse_command(command, args);

    if (argc == 0)
    {
        return 0;
    }

    // Look for built-in command
    for (int i = 0; builtin_commands[i].name != NULL; i++)
    {
        if (strcmp(args[0], builtin_commands[i].name) == 0)
        {
            return builtin_commands[i].handler(argc, args);
        }
    }

    // Command not found
    terminal_put_string("Command not found: ");
    terminal_put_string(args[0]);
    terminal_put_string("\n");

    return -1;
}

int shell_parse_command(const char *input, char **args)
{
    static char buffer[MAX_COMMAND_LENGTH];
    strncpy(buffer, input, sizeof(buffer) - 1);
    buffer[sizeof(buffer) - 1] = '\0';

    int argc = 0;
    char *token = strtok(buffer, " \t\n");

    while (token != NULL && argc < MAX_ARGS - 1)
    {
        args[argc++] = token;
        token = strtok(NULL, " \t\n");
    }

    args[argc] = NULL;
    return argc;
}

void shell_add_history(const char *command)
{
    if (shell_state.history_count < MAX_HISTORY)
    {
        strncpy(shell_state.history[shell_state.history_count], command,
                MAX_COMMAND_LENGTH - 1);
        shell_state.history[shell_state.history_count][MAX_COMMAND_LENGTH - 1] = '\0';
        shell_state.history_count++;
    }
    else
    {
        // Shift history up
        for (int i = 0; i < MAX_HISTORY - 1; i++)
        {
            strcpy(shell_state.history[i], shell_state.history[i + 1]);
        }
        strncpy(shell_state.history[MAX_HISTORY - 1], command, MAX_COMMAND_LENGTH - 1);
        shell_state.history[MAX_HISTORY - 1][MAX_COMMAND_LENGTH - 1] = '\0';
    }
    shell_state.history_index = shell_state.history_count;
}

char *shell_get_env(const char *name)
{
    for (int i = 0; i < shell_state.env_count; i++)
    {
        if (strcmp(shell_state.env_vars[i].name, name) == 0)
        {
            return shell_state.env_vars[i].value;
        }
    }
    return NULL;
}

void shell_set_env(const char *name, const char *value)
{
    // Check if variable already exists
    for (int i = 0; i < shell_state.env_count; i++)
    {
        if (strcmp(shell_state.env_vars[i].name, name) == 0)
        {
            free(shell_state.env_vars[i].value);
            shell_state.env_vars[i].value = strdup(value);
            return;
        }
    }

    // Add new variable
    if (shell_state.env_count < MAX_ENV_VARS)
    {
        shell_state.env_vars[shell_state.env_count].name = strdup(name);
        shell_state.env_vars[shell_state.env_count].value = strdup(value);
        shell_state.env_count++;
    }
}

void shell_prompt(void)
{
    terminal_put_string(shell_state.prompt);
}

// Built-in command implementations

int cmd_help(int argc, char **argv)
{
    terminal_put_string("Available commands:\n");
    for (int i = 0; builtin_commands[i].name != NULL; i++)
    {
        terminal_put_string("  ");
        terminal_put_string(builtin_commands[i].name);
        terminal_put_string(" - ");
        terminal_put_string(builtin_commands[i].description);
        terminal_put_string("\n");
    }
    return 0;
}

int cmd_ls(int argc, char **argv)
{
    const char *path = (argc > 1) ? argv[1] : shell_state.current_dir;

    terminal_put_string("Directory listing for: ");
    terminal_put_string(path);
    terminal_put_string("\n");

    DIR *dir = opendir(path);
    if (dir == NULL)
    {
        terminal_put_string("Error: Cannot open directory - ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        return -1;
    }

    struct dirent *entry;
    struct stat st;
    char full_path[512];
    int count = 0;

    while ((entry = readdir(dir)) != NULL)
    {
        // Skip hidden files starting with '.'
        if (entry->d_name[0] == '.' && strcmp(entry->d_name, ".") != 0 && strcmp(entry->d_name, "..") != 0)
        {
            continue;
        }

        // Build full path for stat
        snprintf(full_path, sizeof(full_path), "%s/%s", path, entry->d_name);

        // Get file stats
        if (stat(full_path, &st) == 0)
        {
            if (S_ISDIR(st.st_mode))
            {
                terminal_put_string("[DIR]  ");
            }
            else
            {
                terminal_put_string("[FILE] ");
            }
        }
        else
        {
            terminal_put_string("[????] ");
        }

        terminal_put_string(entry->d_name);
        terminal_put_string("\n");
        count++;
    }

    closedir(dir);

    if (count == 0)
    {
        terminal_put_string("(empty directory)\n");
    }
    else
    {
        char count_str[32];
        snprintf(count_str, sizeof(count_str), "\nTotal: %d items\n", count);
        terminal_put_string(count_str);
    }

    return 0;
}

int cmd_cd(int argc, char **argv)
{
    const char *target_dir;

    if (argc < 2)
    {
        // No argument - go to home directory
        target_dir = "/home";
    }
    else
    {
        target_dir = argv[1];
    }

    // Check if directory exists
    struct stat st;
    if (stat(target_dir, &st) != 0)
    {
        terminal_put_string("cd: ");
        terminal_put_string(target_dir);
        terminal_put_string(": ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        return -1;
    }

    if (!S_ISDIR(st.st_mode))
    {
        terminal_put_string("cd: ");
        terminal_put_string(target_dir);
        terminal_put_string(": Not a directory\n");
        return -1;
    }

    // Change directory
    if (chdir(target_dir) != 0)
    {
        terminal_put_string("cd: ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        return -1;
    }

    // Update shell state with new directory
    if (getcwd(shell_state.current_dir, sizeof(shell_state.current_dir)) == NULL)
    {
        // Fallback to the target directory if getcwd fails
        strncpy(shell_state.current_dir, target_dir, sizeof(shell_state.current_dir) - 1);
        shell_state.current_dir[sizeof(shell_state.current_dir) - 1] = '\0';
    }

    return 0;
}

int cmd_pwd(int argc, char **argv)
{
    terminal_put_string(shell_state.current_dir);
    terminal_put_string("\n");
    return 0;
}

int cmd_echo(int argc, char **argv)
{
    for (int i = 1; i < argc; i++)
    {
        if (i > 1)
            terminal_put_string(" ");
        terminal_put_string(argv[i]);
    }
    terminal_put_string("\n");
    return 0;
}

int cmd_cat(int argc, char **argv)
{
    if (argc < 2)
    {
        terminal_put_string("Usage: cat <file>\n");
        return -1;
    }

    FILE *file = fopen(argv[1], "r");
    if (file == NULL)
    {
        terminal_put_string("cat: ");
        terminal_put_string(argv[1]);
        terminal_put_string(": ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        return -1;
    }

    char buffer[256];
    size_t bytes_read;

    while ((bytes_read = fread(buffer, 1, sizeof(buffer) - 1, file)) > 0)
    {
        buffer[bytes_read] = '\0';
        terminal_put_string(buffer);
    }

    fclose(file);
    return 0;
}

int cmd_mkdir(int argc, char **argv)
{
    if (argc < 2)
    {
        terminal_put_string("Usage: mkdir <directory>\n");
        return -1;
    }

    // Create directory with permissions 755
    if (mkdir(argv[1], 0755) != 0)
    {
        terminal_put_string("mkdir: ");
        terminal_put_string(argv[1]);
        terminal_put_string(": ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        return -1;
    }

    terminal_put_string("Created directory: ");
    terminal_put_string(argv[1]);
    terminal_put_string("\n");

    return 0;
}

int cmd_rmdir(int argc, char **argv)
{
    if (argc < 2)
    {
        terminal_put_string("Usage: rmdir <directory>\n");
        return -1;
    }

    if (rmdir(argv[1]) != 0)
    {
        terminal_put_string("rmdir: ");
        terminal_put_string(argv[1]);
        terminal_put_string(": ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        return -1;
    }

    terminal_put_string("Removed directory: ");
    terminal_put_string(argv[1]);
    terminal_put_string("\n");

    return 0;
}

int cmd_rm(int argc, char **argv)
{
    if (argc < 2)
    {
        terminal_put_string("Usage: rm <file>\n");
        return -1;
    }

    if (unlink(argv[1]) != 0)
    {
        terminal_put_string("rm: ");
        terminal_put_string(argv[1]);
        terminal_put_string(": ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        return -1;
    }

    terminal_put_string("Removed file: ");
    terminal_put_string(argv[1]);
    terminal_put_string("\n");

    return 0;
}

int cmd_cp(int argc, char **argv)
{
    if (argc < 3)
    {
        terminal_put_string("Usage: cp <source> <destination>\n");
        return -1;
    }

    FILE *src = fopen(argv[1], "rb");
    if (src == NULL)
    {
        terminal_put_string("cp: ");
        terminal_put_string(argv[1]);
        terminal_put_string(": ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        return -1;
    }

    FILE *dst = fopen(argv[2], "wb");
    if (dst == NULL)
    {
        terminal_put_string("cp: ");
        terminal_put_string(argv[2]);
        terminal_put_string(": ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        fclose(src);
        return -1;
    }

    char buffer[1024];
    size_t bytes;

    while ((bytes = fread(buffer, 1, sizeof(buffer), src)) > 0)
    {
        if (fwrite(buffer, 1, bytes, dst) != bytes)
        {
            terminal_put_string("cp: Error writing to destination\n");
            fclose(src);
            fclose(dst);
            return -1;
        }
    }

    fclose(src);
    fclose(dst);

    terminal_put_string("Copied ");
    terminal_put_string(argv[1]);
    terminal_put_string(" to ");
    terminal_put_string(argv[2]);
    terminal_put_string("\n");

    return 0;
}

int cmd_mv(int argc, char **argv)
{
    if (argc < 3)
    {
        terminal_put_string("Usage: mv <source> <destination>\n");
        return -1;
    }

    if (rename(argv[1], argv[2]) != 0)
    {
        terminal_put_string("mv: ");
        terminal_put_string(strerror(errno));
        terminal_put_string("\n");
        return -1;
    }
    terminal_put_string("Moved ");
    terminal_put_string(argv[1]);
    terminal_put_string(" to ");
    terminal_put_string(argv[2]);
    terminal_put_string("\n");

    return 0;
}

int cmd_ps(int argc, char **argv)
{
    terminal_put_string("PID  PPID  CMD\n");
    terminal_put_string("  1     0  kernel\n");
    terminal_put_string("  2     1  shell\n");
    return 0;
}

int cmd_kill(int argc, char **argv)
{
    if (argc < 2)
    {
        terminal_put_string("Usage: kill <pid>\n");
        return -1;
    }

    terminal_put_string("Killing process: ");
    terminal_put_string(argv[1]);
    terminal_put_string("\n");

    return 0;
}

int cmd_env(int argc, char **argv)
{
    for (int i = 0; i < shell_state.env_count; i++)
    {
        terminal_put_string(shell_state.env_vars[i].name);
        terminal_put_string("=");
        terminal_put_string(shell_state.env_vars[i].value);
        terminal_put_string("\n");
    }
    return 0;
}

int cmd_export(int argc, char **argv)
{
    if (argc < 2)
    {
        terminal_put_string("Usage: export VAR=value\n");
        return -1;
    }

    char *eq = strchr(argv[1], '=');
    if (!eq)
    {
        terminal_put_string("Invalid format. Use: export VAR=value\n");
        return -1;
    }

    *eq = '\0';
    shell_set_env(argv[1], eq + 1);
    *eq = '='; // Restore original string

    return 0;
}

int cmd_history(int argc, char **argv)
{
    for (int i = 0; i < shell_state.history_count; i++)
    {
        char num[16];
        sprintf(num, "%3d  ", i + 1);
        terminal_put_string(num);
        terminal_put_string(shell_state.history[i]);
        terminal_put_string("\n");
    }
    return 0;
}

int cmd_clear(int argc, char **argv)
{
    terminal_clear();
    return 0;
}

int cmd_whoami(int argc, char **argv)
{
    const char *user = shell_get_env("USER");
    if (user)
    {
        terminal_put_string(user);
    }
    else
    {
        terminal_put_string("unknown");
    }
    terminal_put_string("\n");
    return 0;
}
