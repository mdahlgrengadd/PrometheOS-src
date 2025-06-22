@echo on
REM Minimal WASM kernel build script for Windows
REM Requires Emscripten SDK to be activated

echo Building minimal WASM kernel...

REM Check if emcc is available
emcc --version >nul 2>&1
if errorlevel 1 (
    echo Error: Emscripten not found. Please install and activate Emscripten SDK.
    echo Download from: https://emscripten.org/
    exit /b 1
)

REM Clean previous build
if exist core.wasm del core.wasm
if exist core.js del core.js
if exist *.o del *.o

REM Compile object files
echo Compiling object files...
emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c main.c -o main.o
if errorlevel 1 goto :error

emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c fs.c -o fs.o
if errorlevel 1 goto :error

emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c pty.c -o pty.o
if errorlevel 1 goto :error

emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c bus.c -o bus.o
if errorlevel 1 goto :error

emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c proc.c -o proc.o
if errorlevel 1 goto :error

REM Link final binary
echo Linking core.wasm...
emcc main.o fs.o pty.o bus.o proc.o -o core.js ^
    -sWASMFS=1 ^
    -sUSE_PTHREADS=1 ^
    -sPTHREAD_POOL_SIZE=4 ^
    "-sEXPORTED_FUNCTIONS=[\"_main\"]" ^
    "-sEXPORTED_RUNTIME_METHODS=[]" ^
    -sALLOW_MEMORY_GROWTH=1 ^
    -sINITIAL_MEMORY=1MB ^
    -sSTACK_SIZE=64KB ^
    -sNO_DYNAMIC_EXECUTION=1 ^
    -sMODULARIZE=1 ^
    -sEXPORT_NAME=WasmCore ^
    -flto

if errorlevel 1 goto :error

REM Check file size
if exist core.wasm (
    for %%A in (core.wasm) do echo Built core.wasm: %%~zA bytes
    echo Build completed successfully!
) else (
    echo Error: core.wasm was not created
    exit /b 1
)

goto :end

:error
echo Build failed!
exit /b 1

:end
