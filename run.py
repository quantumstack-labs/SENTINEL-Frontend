import subprocess
import os
import sys
import threading
import time

def log_process(process, prefix):
    """Logs the output of a process with a prefix."""
    try:
        for line in iter(process.stdout.readline, ''):
            if line:
                print(f"{prefix} | {line.strip()}")
    except Exception as e:
        print(f"{prefix} | Error reading logs: {e}")
    finally:
        process.stdout.close()

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "SENTINEL-Backend")
    frontend_dir = os.path.join(root_dir, "SENTINEL-Frontend")
    venv_bin = os.path.join(root_dir, "venv", "Scripts")
    
    # Determine the python path from venv
    python_exe = os.path.join(venv_bin, "python.exe")
    if not os.path.exists(python_exe):
        print(f"⚠️ Virtual environment not found at {python_exe}. Using system python.")
        python_exe = sys.executable

    print("\n" + "="*50)
    print("🚀 STARTING SENTINEL ECOSYSTEM")
    print("="*50 + "\n")

    # Backend command: Use venv python to run uvicorn
    backend_cmd = [python_exe, "-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"]
    
    # Frontend command: npm run dev
    frontend_cmd = ["npm.cmd", "run", "dev"] # .cmd for Windows

    processes = []
    
    try:
        # Start Backend
        print("📡 Starting Backend...")
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            shell=False,
            env={**os.environ, "PYTHONUTF8": "1"}
        )
        processes.append(backend_proc)
        threading.Thread(target=log_process, args=(backend_proc, "\033[94mBACKEND\033[0m"), daemon=True).start()

        # Start Frontend
        print("🎨 Starting Frontend...")
        frontend_proc = subprocess.Popen(
            frontend_cmd,
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            shell=True # Shell=True often needed for npm on Windows
        )
        processes.append(frontend_proc)
        threading.Thread(target=log_process, args=(frontend_proc, "\033[92mFRONTEND\033[0m"), daemon=True).start()

        print("\n✅ Both services are starting! Press Ctrl+C to stop both.\n")

        # Keep the main script running while children are alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down SENTINEL...")
        for p in processes:
            try:
                # On Windows, taskkill is more reliable for stopping sub-processes
                if os.name == 'nt':
                     subprocess.run(['taskkill', '/F', '/T', '/PID', str(p.pid)], capture_output=True)
                else:
                    p.terminate()
            except:
                pass
        print("👋 Goodbye!\n")
        sys.exit(0)

if __name__ == "__main__":
    main()
