import os, sys, subprocess, time

os.environ["HF_HOME"] = "/media/elmehdi-lakhial/USB_STORAGE22/.hf_cache"
os.chdir(os.path.dirname(__file__))

proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8010"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
)
print(f"PID: {proc.pid}", flush=True)

# Read output for 10 seconds
start = time.time()
while time.time() - start < 10:
    line = proc.stdout.readline()
    if line:
        print(f"[uvicorn] {line.decode().rstrip()}", flush=True)

ret = proc.poll()
print(f"Exit code: {ret}", flush=True)
if ret is not None:
    remaining = proc.stdout.read()
    if remaining:
        print(f"[remaining] {remaining.decode()}", flush=True)
