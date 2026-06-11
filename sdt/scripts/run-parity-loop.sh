#!/usr/bin/env bash
set -euo pipefail

SDT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="$(cd "$SDT_DIR/.." && pwd)"

echo "=== SDT Parity Loop ==="
echo "This script runs parity tests in a loop for AI agents."
echo "Press Ctrl+C to stop."
echo ""

SEEDS=("TEST-ABC" "RAT-SLAYER" "SEWER-KING")
HEROES=("WARRIOR" "MAGE" "ROGUE")

ITERATION=0
while true; do
    ITERATION=$((ITERATION + 1))
    echo ""
    echo "============================================"
    echo "  Iteration $ITERATION ($(date -u +"%Y-%m-%dT%H:%M:%SZ"))"
    echo "============================================"

    ALL_PASSED=true

    for SEED in "${SEEDS[@]}"; do
        for HERO in "${HEROES[@]}"; do
            echo ""
            echo "--- Testing: seed=$SEED hero=$HERO ---"
            export SEED HERO
            if bash "$SDT_DIR/scripts/run-parity.sh" --seed "$SEED" --hero "$HERO" 2>&1 | tail -5; then
                echo "✅  $SEED/$HERO passed"
            else
                echo "❌  $SEED/$HERO failed"
                ALL_PASSED=false
            fi
        done
    done

    echo ""
    if [ "$ALL_PASSED" = true ]; then
        echo "✅  All parity tests passed!"
    else
        echo "❌  Some parity tests failed. Check sdt/sync-tracker/ for details."
    fi

    echo ""
    echo "Waiting 30 seconds before next iteration..."
    sleep 30
done
