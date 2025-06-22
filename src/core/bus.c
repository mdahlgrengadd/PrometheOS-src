#include "include/bus.h"
#include <string.h>
#include <pthread.h>

// Global event bus with ring buffer
ring_buffer_t event_bus = {0};
static pthread_mutex_t bus_mutex = PTHREAD_MUTEX_INITIALIZER;

// Initialize event bus
int bus_init(void)
{
    pthread_mutex_lock(&bus_mutex);
    event_bus.read_pos = 0;
    event_bus.write_pos = 0;
    memset(event_bus.data, 0, sizeof(event_bus.data));
    pthread_mutex_unlock(&bus_mutex);
    return 0;
}

// Post message to event bus (thread-safe)
int bus_post_message(const bus_msg_t *msg, const void *data)
{
    pthread_mutex_lock(&bus_mutex);

    uint32_t write_pos = event_bus.write_pos;
    uint32_t read_pos = event_bus.read_pos;

    // Calculate space needed
    uint32_t msg_size = sizeof(bus_msg_t) + msg->data_len;
    uint32_t available = (read_pos <= write_pos) ? (sizeof(event_bus.data) - write_pos + read_pos) : (read_pos - write_pos);

    // Check if there's enough space
    if (msg_size >= available)
    {
        pthread_mutex_unlock(&bus_mutex);
        return -1; // Buffer full
    }

    // Write message header
    if (write_pos + sizeof(bus_msg_t) <= sizeof(event_bus.data))
    {
        memcpy(&event_bus.data[write_pos], msg, sizeof(bus_msg_t));
        write_pos += sizeof(bus_msg_t);
    }
    else
    {
        // Wrap around
        uint32_t first_part = sizeof(event_bus.data) - write_pos;
        memcpy(&event_bus.data[write_pos], msg, first_part);
        memcpy(event_bus.data, ((char *)msg) + first_part, sizeof(bus_msg_t) - first_part);
        write_pos = sizeof(bus_msg_t) - first_part;
    }

    // Write data if present
    if (msg->data_len > 0 && data)
    {
        if (write_pos + msg->data_len <= sizeof(event_bus.data))
        {
            memcpy(&event_bus.data[write_pos], data, msg->data_len);
            write_pos += msg->data_len;
        }
        else
        {
            // Wrap around
            uint32_t first_part = sizeof(event_bus.data) - write_pos;
            memcpy(&event_bus.data[write_pos], data, first_part);
            memcpy(event_bus.data, ((char *)data) + first_part, msg->data_len - first_part);
            write_pos = msg->data_len - first_part;
        }
    }

    event_bus.write_pos = write_pos;
    pthread_mutex_unlock(&bus_mutex);
    return 0;
}

// Poll for message (non-blocking, thread-safe)
int bus_poll_message(bus_msg_t *msg, void *data, size_t max_len)
{
    pthread_mutex_lock(&bus_mutex);

    uint32_t read_pos = event_bus.read_pos;
    uint32_t write_pos = event_bus.write_pos;

    // Check if buffer is empty
    if (read_pos == write_pos)
    {
        pthread_mutex_unlock(&bus_mutex);
        return 0; // No messages
    }

    // Read message header
    if (read_pos + sizeof(bus_msg_t) <= sizeof(event_bus.data))
    {
        memcpy(msg, &event_bus.data[read_pos], sizeof(bus_msg_t));
        read_pos += sizeof(bus_msg_t);
    }
    else
    {
        // Wrap around
        uint32_t first_part = sizeof(event_bus.data) - read_pos;
        memcpy(msg, &event_bus.data[read_pos], first_part);
        memcpy(((char *)msg) + first_part, event_bus.data, sizeof(bus_msg_t) - first_part);
        read_pos = sizeof(bus_msg_t) - first_part;
    }

    // Read data if present and requested
    if (msg->data_len > 0 && data && max_len > 0)
    {
        uint32_t copy_len = (msg->data_len < max_len) ? msg->data_len : max_len;

        if (read_pos + copy_len <= sizeof(event_bus.data))
        {
            memcpy(data, &event_bus.data[read_pos], copy_len);
            read_pos += msg->data_len; // Advance by full data length
        }
        else
        {
            // Wrap around
            uint32_t first_part = sizeof(event_bus.data) - read_pos;
            if (first_part < copy_len)
            {
                memcpy(data, &event_bus.data[read_pos], first_part);
                memcpy(((char *)data) + first_part, event_bus.data, copy_len - first_part);
            }
            else
            {
                memcpy(data, &event_bus.data[read_pos], copy_len);
            }
            read_pos = (read_pos + msg->data_len) % sizeof(event_bus.data);
        }
    }
    else if (msg->data_len > 0)
    {
        // Skip data if not requested
        read_pos = (read_pos + msg->data_len) % sizeof(event_bus.data);
    }

    event_bus.read_pos = read_pos;
    pthread_mutex_unlock(&bus_mutex);
    return 1; // Message read
}
