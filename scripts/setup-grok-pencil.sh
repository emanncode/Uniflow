#!/usr/bin/env bash
# Idempotently connect Pencil MCP to Grok (user + project scopes).
# Requires: Grok CLI, Pencil VS Code extension installed and opened at least once.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PENCIL_MCP="${HOME}/.pencil/mcp/visual_studio_code/out/mcp-server-linux-x64"

resolve_pencil_mcp() {
  if [[ -x "${PENCIL_MCP}" ]]; then
    return 0
  fi

  local ext_dir
  ext_dir="$(ls -d "${HOME}/.vscode/extensions/highagency.pencildev-"* 2>/dev/null | sort -V | tail -1 || true)"
  if [[ -n "${ext_dir}" && -x "${ext_dir}/out/mcp-server-linux-x64" ]]; then
    PENCIL_MCP="${ext_dir}/out/mcp-server-linux-x64"
    return 0
  fi

  return 1
}

if ! command -v grok >/dev/null 2>&1; then
  echo "Grok CLI not found. Install Grok first: https://github.com/xai-org/grok-cli"
  exit 1
fi

if ! resolve_pencil_mcp; then
  echo "Pencil MCP binary not found."
  echo "Install the Pencil VS Code extension, open VS Code once, then run this script again."
  exit 1
fi

echo "Using Pencil MCP: ${PENCIL_MCP}"

if grok mcp list --json 2>/dev/null | grep -q '"name": "pencil"'; then
  echo "Pencil already configured in Grok user config."
else
  grok mcp add pencil -- "${PENCIL_MCP}" --app visual_studio_code --agent grokCLI
  echo "Added Pencil to Grok user config (~/.grok/config.toml)."
fi

if [[ -f "${ROOT_DIR}/.grok/config.toml" ]]; then
  echo "Project MCP config present: ${ROOT_DIR}/.grok/config.toml"
else
  echo "Warning: missing project config at ${ROOT_DIR}/.grok/config.toml"
fi

echo ""
echo "Checking Pencil MCP health..."
if grok mcp doctor pencil; then
  echo ""
  echo "Setup complete."
  echo "Next steps:"
  echo "  1. Open VS Code with the Pencil extension"
  echo "  2. Open design/uniflow-mobile.pen"
  echo "  3. Start or restart a Grok session in this repo"
  echo "  4. Run /mcps and confirm pencil is enabled"
else
  echo ""
  echo "Pencil MCP did not pass health check."
  echo "Make sure VS Code is running with a .pen file open, then retry."
  exit 1
fi