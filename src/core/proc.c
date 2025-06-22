#include "include/fs.h"
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>

// Static process table
static proc_info_t proc_table[64] = {0};
static int proc_count = 1;

// Initialize process table with init process
int proc_init(void)
{
    proc_table[0].pid = 0;
    strncpy(proc_table[0].name, "init", sizeof(proc_table[0].name) - 1);
    proc_table[0].state = 'R'; // Running
    proc_table[0].utime = 0;
    proc_table[0].stime = 0;
    return 0;
}

// Handle reads from /proc/stat
ssize_t proc_stat_read(char *buf, size_t count, off_t offset)
{
    static char stat_data[2048];
    static int stat_len = 0;

    // Generate /proc/stat data if not cached
    if (stat_len == 0)
    {
        char *p = stat_data;
        for (int i = 0; i < proc_count && i < 64; i++)
        {
            if (proc_table[i].pid != 0)
            {
                p += snprintf(p, stat_data + sizeof(stat_data) - p,
                              "%u %s %c %u %u\n",
                              proc_table[i].pid,
                              proc_table[i].name,
                              proc_table[i].state,
                              proc_table[i].utime,
                              proc_table[i].stime);
            }
        }
        stat_len = p - stat_data;
    }

    // Handle read with offset
    if (offset >= stat_len)
        return 0;
    size_t to_copy = (count < (size_t)(stat_len - offset)) ? count : (stat_len - offset);
    memcpy(buf, stat_data + offset, to_copy);
    return to_copy;
}
