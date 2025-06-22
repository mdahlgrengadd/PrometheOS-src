#ifndef BUS_H
#define BUS_H

#include "fs.h"

// Event bus for inter-thread communication
// All message handlers must be thread-safe

typedef struct
{
    uint8_t data[4096]; // Ring buffer data
    volatile uint32_t read_pos;
    volatile uint32_t write_pos;
} ring_buffer_t;

// Global event bus
extern ring_buffer_t event_bus;

// Bus operations
int bus_init(void);
int bus_post_message(const bus_msg_t *msg, const void *data);
int bus_poll_message(bus_msg_t *msg, void *data, size_t max_len);

#endif // BUS_H
