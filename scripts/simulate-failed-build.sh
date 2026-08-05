#!/bin/bash
#
# Simulates a failed image build for manual testing of journal log output
# in the Cockpit UI.
#
# Creates:
#   1. A transient systemd unit that logs messages and exits non-zero
#   2. A compose directory in /var/lib/cockpit-image-builder/<uuid>/ (no buildlog)
#   3. A compose entry under an existing blueprint so getComposeStatus finds it
#
# Uses a fixed UUID so cleanup is straightforward and repeated runs don't
# create multiple fake composes.
#
# Usage:
#   ./scripts/simulate-failed-build.sh <blueprint-id>
#   ./scripts/simulate-failed-build.sh --cleanup <blueprint-id>

set -euo pipefail

UUID="00000000-0000-0000-0000-000000000000"

usage() {
  echo "Usage:"
  echo "  $0 <blueprint-id>              Create a simulated failed build"
  echo "  $0 --cleanup <blueprint-id>    Clean up a previous simulation"
  exit 1
}

get_bp_dir() {
  local blueprint_id="$1"
  local state_dir="${XDG_STATE_HOME:-$HOME/.local/state}"
  echo "${state_dir}/cockpit-image-builder/${blueprint_id}"
}

cleanup() {
  local blueprint_id="$1"
  local bp_dir
  bp_dir="$(get_bp_dir "$blueprint_id")"

  echo "Cleaning up simulated build ${UUID}..."
  sudo rm -rf "/var/lib/cockpit-image-builder/${UUID}"
  rm -f "${bp_dir}/${UUID}"
  echo "Done."
}

simulate() {
  local blueprint_id="$1"
  local bp_dir
  bp_dir="$(get_bp_dir "$blueprint_id")"

  if [ ! -d "$bp_dir" ]; then
    echo "Error: blueprint directory not found: ${bp_dir}"
    echo "Create a blueprint in the Cockpit UI first, then re-run this script."
    exit 1
  fi

  # Clean up any previous simulation first
  sudo rm -rf "/var/lib/cockpit-image-builder/${UUID}"
  rm -f "${bp_dir}/${UUID}"

  echo "==> Compose ID: ${UUID}"
  echo "==> Blueprint:  ${blueprint_id}"
  echo ""

  # 1. Create the compose output directory (without a buildlog to trigger error id 10)
  echo "Creating compose directory..."
  sudo mkdir -p "/var/lib/cockpit-image-builder/${UUID}"

  # 2. Start a transient unit that logs diagnostic messages and fails
  echo "Starting failing systemd unit..."
  sudo systemd-run \
    --unit "cockpit-image-builder-${UUID}" \
    --collect \
    -- /bin/bash -c '
      echo "image-builder: starting build for compose"
      echo "image-builder: resolving package dependencies"
      echo "image-builder: fatal error - disk space exhausted on /var/lib"
      echo "image-builder: build aborted"
      exit 1
    '

  # 3. Wait for the unit to finish (it should fail almost instantly)
  echo "Waiting for unit to exit..."
  sleep 2

  # 4. Verify journal entries exist
  echo ""
  echo "==> Journal entries:"
  journalctl -u "cockpit-image-builder-${UUID}.service" --no-pager -q || true

  # 5. Create the compose entry in the blueprint directory
  echo ""
  echo "Creating compose entry..."
  cat > "${bp_dir}/${UUID}" <<EOF
{
  "distribution": "rhel-9",
  "image_requests": [
    {
      "architecture": "x86_64",
      "image_type": "guest-image",
      "upload_request": { "type": "local" }
    }
  ]
}
EOF

  echo ""
  echo "Done! Open the Cockpit Image Builder UI and check the failed compose"
  echo "under blueprint '${blueprint_id}'. The error details should include"
  echo "the journal output above."
  echo ""
  echo "To clean up: $0 --cleanup ${blueprint_id}"
}

if [ $# -lt 1 ]; then
  usage
fi

case "$1" in
  --cleanup)
    [ $# -ne 2 ] && usage
    cleanup "$2"
    ;;
  --help|-h)
    usage
    ;;
  *)
    [ $# -ne 1 ] && usage
    simulate "$1"
    ;;
esac
