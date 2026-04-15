#!/usr/bin/env python3
"""
Cross-platform launcher for Event Invitation Manager Streamlit app
Works on Windows, macOS, and Linux
Uses uv for fast dependency management
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"\n[*] {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=False)
        return result.returncode == 0
    except Exception as e:
        print(f"[!] Error: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("  Event Invitation Manager - Streamlit Web UI")
    print("  Powered by uv (fast Python package manager)")
    print("="*70)
    
    ui_dir = Path(__file__).parent
    project_root = ui_dir.parent
    
    # Step 1: Check if uv is installed
    print("\n[1/4] Checking for uv...")
    uv_check = subprocess.run("uv --version", shell=True, capture_output=True, text=True)
    
    if uv_check.returncode != 0:
        print("[!] uv not found. Installing...")
        install_cmd = f"{sys.executable} -m pip install uv"
        if not run_command(install_cmd, "Installing uv"):
            print("[!] Failed to install uv. Falling back to pip...")
            use_uv = False
        else:
            use_uv = True
    else:
        print(f"[✓] Found: {uv_check.stdout.strip()}")
        use_uv = True
    
    # Step 2: Ensure parent package is installed
    print("\n[2/4] Ensuring parent package is installed...")
    os.chdir(project_root)
    if use_uv:
        run_command(f"uv pip install -e .", "Installing parent package with uv")
    else:
        run_command(f"{sys.executable} -m pip install -e .", "Installing parent package with pip")
    
    # Step 3: Install UI dependencies
    print("\n[3/4] Installing dependencies...")
    os.chdir(ui_dir)
    if use_uv:
        if not run_command("uv sync", "Setting up environment with uv"):
            print("[!] uv sync failed, trying pip...")
            run_command("uv pip install -r requirements.txt", "Installing with uv pip")
    else:
        run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing with pip")
    
    # Step 4: Launch Streamlit app
    print("\n[4/4] Starting Streamlit app...")
    print("\n" + "="*70)
    print("  Opening http://localhost:8501 in your browser...")
    print("  Press Ctrl+C to stop the server")
    print("="*70 + "\n")
    
    cmd = f"{sys.executable} -m streamlit run app.py"
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[✓] Server stopped")
        sys.exit(0)
    except Exception as e:
        print(f"\n[!] Unexpected error: {e}")
        sys.exit(1)
