#!/usr/bin/env bash
set -euo pipefail

HARNESS_DIR="$(cd "$(dirname "$0")" && pwd)"
SPDDIR="/home/citnut/Desktop/shattered-pixel-dungeon"
GC="$HOME/.gradle/caches/modules-2/files-2.1"

SEED="${1:-TEST-ABC}"
HERO="${2:-WARRIOR}"
shift 2 || true
ACTIONS=("$@")
if [ ${#ACTIONS[@]} -eq 0 ]; then
  ACTIONS=("wait=2" "move=0,-1" "move=-1,0")
fi

LIBDIR="$HARNESS_DIR/libs"
mkdir -p "$LIBDIR"

# Download deps if missing
if [ ! -f "$LIBDIR/gdx-backend-headless-1.14.0.jar" ]; then
  curl -sL "https://repo1.maven.org/maven2/com/badlogicgames/gdx/gdx-backend-headless/1.14.0/gdx-backend-headless-1.14.0.jar" -o "$LIBDIR/gdx-backend-headless-1.14.0.jar"
fi
if [ ! -f "$LIBDIR/json-20170516.jar" ]; then
  curl -sL "https://repo1.maven.org/maven2/org/json/json/20170516/json-20170516.jar" -o "$LIBDIR/json-20170516.jar"
fi

# Precise jar paths (gradle cache)
NATIVES_JAR="$GC/com.badlogicgames.gdx/gdx-platform/1.14.0/d0ecc53f2c20576f1ba4ac9ba157cf48f7bd9821/gdx-platform-1.14.0-natives-desktop.jar"
CONTROLLERS_JAR="$GC/com.badlogicgames.gdx-controllers/gdx-controllers-core/2.2.4/d8a18ff371fb01c1763e9fe5ea050e39d2d66437/gdx-controllers-core-2.2.4.jar"
GDX_JAR="$GC/com.badlogicgames.gdx/gdx/1.14.0/8accfce8d9313d9ddd23a2c9e315179783085ef2/gdx-1.14.0.jar"
JNIGEN_JAR="$GC/com.badlogicgames.gdx/gdx-jnigen-loader/2.5.2/f35e90affe07c46b4f5e5958a1a4c1820c4890e2/gdx-jnigen-loader-2.5.2.jar"

ASSETS="${SPDDIR}/core/src/main/assets:${SPDDIR}/desktop/build/resources/main"
CP="${ASSETS}:${NATIVES_JAR}:${CONTROLLERS_JAR}:${LIBDIR}/gdx-backend-headless-1.14.0.jar:${GDX_JAR}:${JNIGEN_JAR}:${LIBDIR}/json-20170516.jar"
CP="${CP}:${SPDDIR}/core/build/libs/core-3.3.5.jar:${SPDDIR}/SPD-classes/build/libs/SPD-classes-3.3.5.jar"
CP="${CP}:${HARNESS_DIR}/build"

# Build if needed
if [ ! -f "$HARNESS_DIR/build/ParityOracle.class" ]; then
  echo "Building Java harness..." >&2
  javac --release 11 -cp "$CP" -d "$HARNESS_DIR/build" "$HARNESS_DIR/src/main/java/ParityOracle.java"
fi

# Run
exec java -cp "$CP" ParityOracle "$SEED" "$HERO" "${ACTIONS[@]}"
