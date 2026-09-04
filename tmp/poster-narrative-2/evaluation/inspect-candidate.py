#!/usr/bin/env python3
"""Read-only checks for one poster PDF."""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from math import hypot, sqrt
from pathlib import Path

from pypdf import PdfReader


REQUIRED_LABEL_PATTERNS = {
    "Hypothesis": r"\bhypothesis\b",
    "Methodology": r"\bmethodology\b",
    "Results": r"\bresults\b",
}

REQUIRED_COMPACT_TOKENS = {
    "answer quality 0.956": "0.956",
    "benchmark grounding 0.847": "0.847",
    "telemetry 1.000": "1.000",
    "latency multiplier 0.938": "0.938",
    "total score 0.759": "0.759",
    "precision gain +10.2 pp": "+10.2pp",
    "pages/question -0.33": "-0.33",
    "hit coverage 95/95": "95/95",
    "TTFT 6.39 s": "6.39s",
    # The unit may be shown once in the chart subtitle/axis rather than repeated
    # on every bar; the signed values themselves are the hard content check.
    "single-page +4.0": "+4.0",
    "multi-page -2.6": "-2.6",
    "single-document +3.2": "+3.2",
    "multi-document -1.4": "-1.4",
}

FORBIDDEN_PATTERNS = {
    "Lorem ipsum": r"lorem\s+ipsum",
    "unfinished author placeholder": r"\[(?:author|student(?:\s+id)?)\]",
    "TODO/TBD": r"\b(?:TODO|TBD)\b",
}


def normalized(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def main() -> int:
    if len(sys.argv) != 2:
        print(f"usage: {Path(sys.argv[0]).name} poster.pdf", file=sys.stderr)
        return 2

    path = Path(sys.argv[1]).resolve()
    reader = PdfReader(str(path))
    print(path)
    print(f"  pages: {len(reader.pages)}")

    all_text: list[str] = []
    visitor_fragments: list[str] = []
    small_runs: dict[float, list[str]] = defaultdict(list)
    for page_index, page in enumerate(reader.pages, start=1):
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        print(
            f"  page {page_index}: {width:.2f} x {height:.2f} pt; "
            f"ratio={max(width, height) / min(width, height):.7f}"
        )

        def visitor(text, cm, tm, _font_dict, font_size):
            clean = normalized(text)
            if not clean:
                return
            visitor_fragments.append(clean)
            # PowerPoint PDFs frequently encode a 1 pt font and apply the real
            # size through both the current and text matrices. Browser PDFs
            # typically keep those matrices at unit scale. Account for both.
            cm_scale = sqrt(max(hypot(cm[0], cm[1]) * hypot(cm[2], cm[3]), 0.0))
            tm_scale = sqrt(max(hypot(tm[0], tm[1]) * hypot(tm[2], tm[3]), 0.0))
            effective_size = float(font_size) * cm_scale * tm_scale
            if effective_size < 23.5:
                small_runs[round(effective_size, 1)].append(clean)

        all_text.append(page.extract_text(visitor_text=visitor) or "")

    # Visitor fragments are more reliable for PowerPoint-generated PDFs,
    # whose content streams can confuse the default text-order reconstruction.
    text = normalized(" ".join(visitor_fragments or all_text))
    print(f"  extracted text: {len(text)} chars")

    compact = re.sub(r"\s+", "", text).lower()
    compact = compact.replace(",", ".").replace("−", "-").replace("–", "-")

    missing = [
        label
        for label, pattern in REQUIRED_LABEL_PATTERNS.items()
        if not re.search(pattern, text, flags=re.IGNORECASE)
    ]
    missing.extend(
        label
        for label, token in REQUIRED_COMPACT_TOKENS.items()
        if token not in compact
    )
    forbidden = [
        label
        for label, pattern in FORBIDDEN_PATTERNS.items()
        if re.search(pattern, text, flags=re.IGNORECASE)
    ]

    grounding_ok = bool(
        re.search(
            r"(?:benchmark[^.]{0,120}0[.,]847|0[.,]847[^.]{0,120}(?:benchmark|100))",
            text,
            flags=re.IGNORECASE,
        )
    )
    macro_ok = bool(
        re.search(
            r"(?:(?:macro|annotated|95)[^.]{0,160}(?:0[.,]892|89[.,]2\s*%)|"
            r"(?:0[.,]892|89[.,]2\s*%)[^.]{0,160}(?:macro|annotated|95))",
            text,
            flags=re.IGNORECASE,
        )
    )

    print(f"  required content: {'PASS' if not missing else 'MISSING'}")
    for item in missing:
        print(f"    - {item}")
    print(f"  grounding disambiguation: {'PASS' if grounding_ok and macro_ok else 'CHECK'}")
    if not grounding_ok:
        print("    - 0.847 needs a nearby benchmark/100-answer label")
    if not macro_ok:
        print("    - 0.892 or 89.2% needs a nearby macro/95-annotated label")
    print(f"  placeholder scan: {'PASS' if not forbidden else 'FOUND'}")
    for item in forbidden:
        print(f"    - {item}")

    if small_runs:
        print("  text runs below 23.5 pt (manual classification required):")
        for size in sorted(small_runs):
            sample = " | ".join(small_runs[size][:5])
            print(f"    {size:>4.1f} pt: {sample[:300]}")
    else:
        print("  text runs below 23.5 pt: none detected")

    return 1 if missing or forbidden or not (grounding_ok and macro_ok) else 0


if __name__ == "__main__":
    raise SystemExit(main())
