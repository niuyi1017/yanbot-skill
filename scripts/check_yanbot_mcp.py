#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_yanbot_mcp.py
Verify that the Yanbot MCP server is correctly configured and reachable across platforms.
Supports: WorkBuddy, Claude Desktop, Cursor, Windsurf, Cline (VS Code),
          VS Code Copilot, Trae IDE.
"""

import json
import sys
import os
import io
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

YANBOT_URL = "https://api.yanbot.tech/mcp"
YANBOT_KEY = "yanbot"
HOME = Path.home()


def get_platform_configs():
    """Return a list of (platform_name, config_path, json_path) tuples."""
    configs = []

    if sys.platform == "win32":
        appdata = os.environ.get("APPDATA", str(HOME / "AppData" / "Roaming"))
        localappdata = os.environ.get("LOCALAPPDATA", str(HOME / "AppData" / "Local"))
        configs = [
            ("WorkBuddy", HOME / ".workbuddy" / "mcp.json", ["mcpServers"]),
            ("Claude Desktop", Path(appdata) / "Claude" / "claude_desktop_config.json", ["mcpServers"]),
            ("Cursor", HOME / ".cursor" / "mcp.json", ["mcpServers"]),
            ("Windsurf", HOME / ".codeium" / "windsurf" / "mcp_config.json", ["mcpServers"]),
            # VS Code Copilot — user-level mcp.json (VS Code stores per-profile)
            ("VS Code Copilot", Path(appdata) / "Code" / "User" / "globalStorage" / "github.copilot-chat" / "mcp.json", ["servers"]),
            # Trae IDE — config stored in AppData
            ("Trae IDE", Path(appdata) / "Trae" / "User" / "globalStorage" / "mcp.json", ["mcpServers"]),
        ]
        # VS Code settings - check common locations
        vscode_settings = HOME / "AppData" / "Roaming" / "Code" / "User" / "settings.json"
        if vscode_settings.exists():
            configs.append(("Cline (VS Code)", vscode_settings, ["cline.mcpServers"]))
    else:
        # macOS / Linux
        configs = [
            ("WorkBuddy", HOME / ".workbuddy" / "mcp.json", ["mcpServers"]),
            ("Claude Desktop", HOME / "Library" / "Application Support" / "Claude" / "claude_desktop_config.json", ["mcpServers"]),
            ("Cursor", HOME / ".cursor" / "mcp.json", ["mcpServers"]),
            ("Windsurf", HOME / ".codeium" / "windsurf" / "mcp_config.json", ["mcpServers"]),
            # VS Code Copilot
            ("VS Code Copilot", HOME / "Library" / "Application Support" / "Code" / "User" / "globalStorage" / "github.copilot-chat" / "mcp.json", ["servers"]),
            # Trae IDE
            ("Trae IDE", HOME / "Library" / "Application Support" / "Trae" / "User" / "globalStorage" / "mcp.json", ["mcpServers"]),
        ]
        vscode_settings = HOME / "Library" / "Application Support" / "Code" / "User" / "settings.json"
        if vscode_settings.exists():
            configs.append(("Cline (VS Code)", vscode_settings, ["cline.mcpServers"]))

    return configs


def check_platform(platform_name, config_path, json_path):
    """Check one platform for yanbot entry."""
    label = f"  [{platform_name}]"
    if not config_path.exists():
        print(f"{label} Not installed (config not found)")
        return None

    with open(config_path, "r", encoding="utf-8") as f:
        try:
            config = json.load(f)
        except json.JSONDecodeError as e:
            print(f"{label} JSON parse error: {e}")
            return False

    # Navigate the JSON path (e.g. ["mcpServers"] or ["cline", "mcpServers"])
    node = config
    for key in json_path:
        if isinstance(node, dict) and key in node:
            node = node[key]
        else:
            print(f"{label} No yanbot entry (key '{key}' not found)")
            return False

    if not isinstance(node, dict):
        print(f"{label} No yanbot entry (expected object)")
        return False

    if YANBOT_KEY not in node:
        print(f"{label} No yanbot entry")
        return False

    entry = node[YANBOT_KEY]
    url = entry.get("url", "")
    disabled = entry.get("disabled", False)

    if url != YANBOT_URL:
        print(f"{label} URL mismatch: {url}")
        return False

    if disabled:
        print(f"{label} Entry exists but disabled=true")
        return False

    print(f"{label} Config OK")
    return True


def check_connectivity():
    """Check if the MCP endpoint is reachable via HTTP."""
    print()
    print("=" * 50)
    print("Connectivity Check")
    print("=" * 50)
    print(f"  Target: {YANBOT_URL}")

    try:
        import urllib.request
        import urllib.error

        req = urllib.request.Request(
            YANBOT_URL,
            headers={"User-Agent": "yanbot-mcp-setup-check/1.0"},
            method="GET"
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                print(f"  Result: Endpoint reachable - HTTP {resp.status}")
                return True
        except urllib.error.HTTPError as e:
            if e.code < 500:
                print(f"  Result: Endpoint reachable - HTTP {e.code} (server responded)")
                return True
            else:
                print(f"  Result: Server error - HTTP {e.code}")
                return False
        except urllib.error.URLError as e:
            print(f"  Result: Connection failed - {e.reason}")
            return False
    except Exception as e:
        print(f"  Result: Unexpected error - {e}")
        return False


def main():
    print("=" * 50)
    print("Yanbot MCP Multi-Platform Config Check")
    print("=" * 50)
    print()

    configs = get_platform_configs()
    results = {"ok": [], "not_found": [], "error": []}

    for platform_name, config_path, json_path in configs:
        status = check_platform(platform_name, config_path, json_path)
        if status is True:
            results["ok"].append(platform_name)
        elif status is None:
            results["not_found"].append(platform_name)
        else:
            results["error"].append(platform_name)

    connectivity_ok = check_connectivity()

    print()
    print("=" * 50)
    print("Summary")
    print("=" * 50)

    if results["ok"]:
        print(f"  Configured OK: {', '.join(results['ok'])}")
    if results["not_found"]:
        print(f"  Not installed:  {', '.join(results['not_found'])}")
    if results["error"]:
        print(f"  Needs fix:      {', '.join(results['error'])}")

    if connectivity_ok:
        print(f"  Endpoint:       Reachable")
    else:
        print(f"  Endpoint:       UNREACHABLE - check network")

    if results["ok"] and connectivity_ok:
        print()
        print("  All configured platforms are ready to use!")
        sys.exit(0)
    elif results["ok"] and not connectivity_ok:
        print()
        print("  Config is OK but endpoint is unreachable.")
        print("  Check your network or VPN settings.")
        sys.exit(1)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
