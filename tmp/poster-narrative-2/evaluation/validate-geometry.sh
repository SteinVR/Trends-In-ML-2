#!/usr/bin/env bash
set -euo pipefail

root="/Users/steinv/Uni-Trier/Trends-In-ML-2"
out="$root/output/poster-narrative-2"
expected_ratio="1.4158249"
runtime_python="/Users/steinv/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
content_check="$root/tmp/poster-narrative-2/evaluation/inspect-candidate.py"

if [[ ! -d "$out" ]]; then
  echo "No candidate output directory yet: $out"
  exit 0
fi

find "$out" -type f \( -name '*.pdf' -o -name '*.png' -o -name '*.pptx' \) -print0 |
while IFS= read -r -d '' artifact; do
  echo "$artifact"
  case "$artifact" in
    *.pdf)
      pdfinfo "$artifact" | awk -F: '/^Pages|^Page size|^PDF version/ {gsub(/^[[:space:]]+/, "", $2); print "  " $1 ": " $2}'
      "$runtime_python" "$content_check" "$artifact" || true
      ;;
    *.png)
      width="$(sips -g pixelWidth "$artifact" | awk '/pixelWidth/ {print $2}')"
      height="$(sips -g pixelHeight "$artifact" | awk '/pixelHeight/ {print $2}')"
      ratio="$(awk -v w="$width" -v h="$height" 'BEGIN {printf "%.7f", w/h}')"
      delta="$(awk -v a="$ratio" -v b="$expected_ratio" 'BEGIN {d=a-b; if (d<0) d=-d; printf "%.7f", d}')"
      echo "  pixels: ${width} x ${height}; ratio=${ratio}; delta=${delta}"
      ;;
    *.pptx)
      test -s "$artifact"
      unzip -tq "$artifact" >/dev/null
      size_xml="$(unzip -p "$artifact" ppt/presentation.xml | tr '>' '>\n' | rg -o '<p:sldSz[^>]*' -m1 || true)"
      slides="$(unzip -Z1 "$artifact" | rg -c '^ppt/slides/slide[0-9]+\.xml$' || true)"
      echo "  slides: $slides"
      echo "  slide-size xml: ${size_xml:-not found}"
      ;;
  esac
done
