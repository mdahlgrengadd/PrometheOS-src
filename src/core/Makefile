# Minimal WASM kernel Makefile
# Target: ≤250KB gzipped core.wasm

CC = emcc
CFLAGS = -O3 -flto -DNDEBUG -Wall -Wextra -I.
LDFLAGS = -sWASMFS=1 \
          -sWASMFS_OPFS=1 \
          -sWASMFS_IDBFS=1 \
          -sUSE_PTHREADS=1 \
          -sPTHREAD_POOL_SIZE=4 \
          -sEXPORTED_FUNCTIONS='["_main"]' \
          -sEXPORTED_RUNTIME_METHODS='[]' \
          -sALLOW_MEMORY_GROWTH=1 \
          -sINITIAL_MEMORY=1MB \
          -sSTACK_SIZE=64KB \
          -sNO_DYNAMIC_EXECUTION=1 \
          -sNO_FILESYSTEM=0 \
          -sMODULARIZE=1 \
          -sEXPORT_NAME=WasmCore \
          --closure 1 \
          -flto

SOURCES = main.c fs.c pty.c bus.c proc.c
OBJECTS = $(SOURCES:.c=.o)
TARGET = core.wasm
JS_TARGET = core.js
DIST_DIR = ../../dist

# Default target
all: $(TARGET)

# Build the WASM kernel
$(TARGET): $(OBJECTS)
	$(CC) $(OBJECTS) -o $(JS_TARGET) $(LDFLAGS)
	@echo "Built $(TARGET)"
	@if command -v gzip >/dev/null 2>&1; then \
		gzip -c $(TARGET) | wc -c | awk '{print "Gzipped size: " $$1 " bytes"}'; \
		if [ `gzip -c $(TARGET) | wc -c` -gt 256000 ]; then \
			echo "WARNING: Size exceeds 250KB target"; \
		fi; \
	fi

# Compile source files
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Clean build artifacts
clean:
	rm -f $(OBJECTS) $(TARGET) $(JS_TARGET)

# Install to dist directory
install: $(TARGET)
	mkdir -p $(DIST_DIR)/wasm
	cp $(TARGET) $(JS_TARGET) $(DIST_DIR)/wasm/
	@echo "Installed to $(DIST_DIR)/wasm/"

# Size optimization target
optimize: CFLAGS += -Os -ffunction-sections -fdata-sections
optimize: LDFLAGS += --gc-sections -sAGGRESSIVE_VARIABLE_ELIMINATION=1
optimize: $(TARGET)

# Debug build
debug: CFLAGS += -g -DDEBUG -O0
debug: LDFLAGS += -sASSERTIONS=1 -sSAFE_HEAP=1
debug: $(TARGET)

.PHONY: all clean install optimize debug

# Dependencies
main.o: main.c include/fs.h include/bus.h include/pty.h
fs.o: fs.c include/fs.h include/bus.h
pty.o: pty.c include/pty.h
bus.o: bus.c include/bus.h include/fs.h
proc.o: proc.c include/fs.h
