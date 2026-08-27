#!/usr/bin/env bash

set -e

# Validate input argument
LESSON_ID="$1"

if [ -z "$LESSON_ID" ]; then
  echo "❌ Error: Lesson ID is required."
  echo "Usage: ./scripts/video.sh <lesson_number>"
  echo "Example: ./scripts/video.sh 001"
  exit 1
fi

# Find corresponding folder in public directory (e.g. 001 -> 001-pythagorean-theorem)
PUBLIC_MATCH=$(find public -mindepth 1 -maxdepth 1 -type d -name "${LESSON_ID}*" | head -n 1)

if [ -z "$PUBLIC_MATCH" ]; then
  echo "❌ Error: Could not find any directory matching '${LESSON_ID}' in public/"
  exit 1
fi

FOLDER_NAME=$(basename "$PUBLIC_MATCH")
SUMMARY_JSON="$PUBLIC_MATCH/summary.json"

if [ ! -f "$SUMMARY_JSON" ]; then
  echo "❌ Error: Missing summary.json at $SUMMARY_JSON"
  exit 1
fi

OUT_DIR="./out/$FOLDER_NAME"
OUT_FILE="$OUT_DIR/$FOLDER_NAME.mp4"

echo "=========================================="
echo "🎬 MathLogic Video Render Pipeline"
echo "📌 Lesson ID     : $LESSON_ID"
echo "📂 Target Folder: $FOLDER_NAME"
echo "📄 Summary JSON : $SUMMARY_JSON"
echo "🎯 Output File  : $OUT_FILE"
echo "=========================================="

# Ensure output directory exists
mkdir -p "$OUT_DIR"

# Run Remotion render
echo "🚀 Starting Remotion video rendering..."
npx remotion render src/index.ts MathLesson "$OUT_FILE"

if [ -f "$OUT_FILE" ]; then
  echo "------------------------------------------"
  echo "✅ Video generated successfully!"
  echo "📹 Output path: $OUT_FILE"
  echo "------------------------------------------"
else
  echo "❌ Error: Video rendering failed."
  exit 1
fi
