#!/usr/bin/env bash
set -euo pipefail

SDT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SDT_DIR/../.." && pwd)"

# Default to REPL mode
MODE="${1:-repl}"
shift || true

case "$MODE" in
  repl|read|init|click|input|wait|move|attack|script)
    npx tsx "$SDT_DIR/cli/src/index.ts" "$MODE" "$@"
    ;;
  build)
    cd "$SDT_DIR/java"
    gradle build
    ;;
  help|--help|-h)
    echo "SDT Test Agent - Interactive CLI for SPD Java testing"
    echo ""
    echo "Usage:"
    echo "  ./sdt-test-agent.sh repl              Start interactive REPL"
    echo "  ./sdt-test-agent.sh read              Read game state (single command)"
    echo "  ./sdt-test-agent.sh init <seed> <hero> Initialize game"
    echo "  ./sdt-test-agent.sh click <x> <y>     Click at coordinates"
    echo "  ./sdt-test-agent.sh input <key>       Send keyboard input"
    echo "  ./sdt-test-agent.sh wait <turns>      Advance turns"
    echo "  ./sdt-test-agent.sh move <dx> <dy>    Move hero"
    echo "  ./sdt-test-agent.sh attack <dx> <dy>  Attack mob"
    echo "  ./sdt-test-agent.sh script <file>     Run test script"
    echo "  ./sdt-test-agent.sh build             Build Java agent"
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Usage: ./sdt-test-agent.sh <command> [args]"
    echo "Run './sdt-test-agent.sh help' for available commands."
    exit 1
    ;;
esac
