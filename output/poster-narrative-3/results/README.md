# Результаты экспериментов

`metrics.csv` и `metrics.json` содержат измеренные значения. `comparisons.*`, `per-question-scores.csv` и `retrieval_diagnostics.*` раскрывают сравнения и подробные результаты; `protocol.json` описывает протокол. Статус выполнения и проверки сохранены в `experiment-status.md`, `offline_verification.json` и `run-verification.json`.

Актуальные графики постера:

- `pipeline-metrics.svg` / `.png` / `.pdf` — answer quality, citation precision и citation recall для R0–R6.
- `ocr-control.svg` / `.png` / `.pdf` — сравнение исходного корпуса, смешанного корпуса и обработки OCR.

SVG строятся из `metrics.csv` скриптом `../poster/build-figures.mjs`; PNG/PDF обновляет `../poster/export.mjs`. Постер использует эти же SVG напрямую.

Данные и исходная нумерация шести исследовательских гипотез сохранены. Соответствие трём гипотезам постера описано в [основном README](../README.md).
