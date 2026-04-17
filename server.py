import os
import subprocess
import sys
import time

# Resolve the local nodeenv path so Vite can be launched
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
NODE_ENV_SCRIPTS = os.path.join(ROOT_DIR, "mynodeenv", "Scripts")
PNPM_CMD = os.path.join(NODE_ENV_SCRIPTS, "pnpm.cmd")  # Windows .cmd wrapper

def start_dev():
    print("Starting InfraSetu Full-Stack (Django + React/Vite)...")
    try:
        subprocess.run([sys.executable, "debug_pip.py"])
    except:
        pass
    env = os.environ.copy()
    # Inject local node into PATH for all subprocesses
    env["PATH"] = NODE_ENV_SCRIPTS + os.pathsep + env.get("PATH", "")
    
    # 1. Ensure pip is available
    print("Verifying Python environment...")
    local_site = os.path.expanduser("~/.local/lib/python3.10/site-packages")
    if local_site not in sys.path:
        sys.path.insert(0, local_site)
    env["PYTHONPATH"] = local_site + ":" + env.get("PYTHONPATH", "")

    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], check=True, capture_output=True)
        print("Pip is already available.")
    except subprocess.CalledProcessError:
        print("Pip not found. attempting to bootstrap pip...")
        try:
            import urllib.request
            url = "https://bootstrap.pypa.io/get-pip.py"
            urllib.request.urlretrieve(url, "get_pip_installer.py")
            subprocess.run([sys.executable, "get_pip_installer.py", "--user"], check=True)
            print("Pip bootstrapped successfully.")
        except Exception as e:
            print(f"Failed to bootstrap pip: {e}")

    # 2. Install requirements
    print("Installing requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--user", "-r", "requirements.txt"], check=True)
        print("Requirements installed successfully.")
    except Exception as e:
        print(f"Failed to install requirements: {e}")

    # 2. Run migrations and seed
    try:
        subprocess.run([sys.executable, "backend/manage.py", "migrate"], check=True, env=env)
        subprocess.run([sys.executable, "backend/seed.py"], check=True, env=env)
    except Exception as e:
        print(f"Warning: Database setup/seeding failed: {e}")

    # 3. Start Django on 8000
    django_proc = subprocess.Popen([sys.executable, "backend/manage.py", "runserver", "8000"], env=env)
    
    # 4. Start Vite from src/frontend using local nodeenv pnpm
    frontend_dir = os.path.join(ROOT_DIR, "src", "frontend")
    if os.path.exists(PNPM_CMD):
        pnpm_exe = PNPM_CMD
    else:
        pnpm_exe = "pnpm"  # fallback to system pnpm
    print(f"Starting Vite with: {pnpm_exe}")
    try:
        vite_proc = subprocess.Popen(
            [pnpm_exe, "run", "dev"],
            cwd=frontend_dir,
            env=env,
        )
    except Exception as e:
        print(f"Error starting Vite: {e}")
        django_proc.terminate()
        return

    try:
        while True:
            time.sleep(1)
            if django_proc.poll() is not None:
                print("InfraSetu Backend crashed. Restarting...")
                django_proc = subprocess.Popen([sys.executable, "backend/manage.py", "runserver", "8000"], env=env)
            if vite_proc.poll() is not None:
                print("Vite server crashed. Exiting...")
                break
    except KeyboardInterrupt:
        django_proc.terminate()
        vite_proc.terminate()

if __name__ == "__main__":
    start_dev()
