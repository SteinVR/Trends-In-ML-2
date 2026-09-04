const colors = {
  ink: '#172234',
  blue: '#245f7a',
  coral: '#a83f35',
};

function Circle({ cx, cy, r = 15 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill={colors.blue} />;
}

function Diamond({ cx, cy, r = 17 }: { cx: number; cy: number; r?: number }) {
  return (
    <polygon
      points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
      fill={colors.coral}
    />
  );
}

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <h2>{children}</h2>
    </div>
  );
}

function EvidenceShapeKey() {
  return (
    <div className="shape-key" aria-label="Evidence-shape legend">
      <span className="key-item localized">
        <i aria-hidden="true" /> Localized: one gold page
      </span>
      <span className="key-item distributed">
        <i aria-hidden="true" /> Distributed: multiple gold pages
      </span>
    </div>
  );
}

function MethodFlow() {
  const steps = [
    ['01', 'Page-first ingestion', '30 DIFC PDFs / 590 pages'],
    ['02', 'Multi-view index', 'Page / section / clause / table'],
    ['03', 'Hybrid retrieval', 'BM25 + Qwen3 Embedding'],
    ['04', 'Fusion + reranking', 'RRF + Qwen3 Reranker'],
    ['05', 'Typed answering', 'gpt-5.4-mini + validation'],
    ['06', 'Page attribution', 'Supported pages + trace'],
  ];

  return (
    <figure className="method-flow" aria-label="Page-stable legal RAG pipeline">
      {steps.map(([number, title, detail]) => (
        <div className="flow-step" key={number}>
          <span className="flow-number">{number}</span>
          <strong>{title}</strong>
          <small>{detail}</small>
        </div>
      ))}
    </figure>
  );
}

function PrimaryComparisonPlot() {
  const x = (value: number) => 286 + ((value - 75) / 25) * 812;
  const ticks = [75, 80, 85, 90, 95, 100];
  const rows = [
    { y: 70, label: 'Localized', value: 95.9, kind: 'localized' },
    { y: 116, label: 'Distributed', value: 94.4, kind: 'distributed' },
    { y: 217, label: 'Localized', value: 93.8, kind: 'localized' },
    { y: 263, label: 'Distributed', value: 81.6, kind: 'distributed' },
  ] as const;

  return (
    <svg
      className="primary-plot"
      viewBox="0 0 1200 330"
      aria-label="Answer quality is similar across evidence shapes while final page grounding is lower for distributed evidence"
    >
      <title>Answer quality and final page grounding by evidence shape</title>

      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} y1="38" x2={x(tick)} y2="285" className="primary-grid" />
          <text x={x(tick)} y="320" textAnchor="middle" className="primary-axis">
            {tick}%
          </text>
        </g>
      ))}

      <text x="18" y="28" className="metric-heading">ANSWER QUALITY</text>
      <text x="1180" y="28" textAnchor="end" className="small-gap">1.5 pp difference</text>
      <text x="18" y="176" className="metric-heading">FINAL PAGE GROUNDING</text>
      <text x="1180" y="176" textAnchor="end" className="large-gap">12.2 pp gap</text>

      {rows.map((row) => (
        <g key={`${row.label}-${row.y}`}>
          <line x1="286" y1={row.y} x2="1098" y2={row.y} className="primary-track" />
          <text x="18" y={row.y + 10} className={`group-label ${row.kind}`}>{row.label}</text>
          {row.kind === 'localized' ? (
            <Circle cx={x(row.value)} cy={row.y} r={14} />
          ) : (
            <Diamond cx={x(row.value)} cy={row.y} r={16} />
          )}
          <text x={x(row.value) + 25} y={row.y + 11} className={`${row.kind}-value`}>
            {row.value.toFixed(1)}%
          </text>
        </g>
      ))}

      <line x1="18" y1="147" x2="1180" y2="147" className="metric-divider" />
    </svg>
  );
}

function IntervalPlot() {
  const x = (value: number) => 58 + ((value + 22) / 34) * 570;

  return (
    <svg
      className="interval-plot"
      viewBox="0 0 720 285"
      aria-label="Bootstrap intervals for distributed minus localized group differences"
    >
      <title>Bootstrap intervals for distributed minus localized differences</title>
      <text x="18" y="30" className="minor-title">DISTRIBUTED - LOCALIZED / 95% CI</text>
      <line x1={x(0)} y1="44" x2={x(0)} y2="230" className="zero-line" />

      <text x="18" y="69" className="interval-label">Answer score</text>
      <text x="700" y="69" textAnchor="end" className="ci-caption">-10.8 to +6.7</text>
      <line x1={x(-10.8)} y1="106" x2={x(6.7)} y2="106" className="ci answer-ci" />
      <line x1={x(-10.8)} y1="94" x2={x(-10.8)} y2="118" className="ci-cap answer-ci" />
      <line x1={x(6.7)} y1="94" x2={x(6.7)} y2="118" className="ci-cap answer-ci" />
      <Diamond cx={x(-1.5)} cy={106} r={11} />
      <text x="700" y="117" textAnchor="end" className="interval-value">-1.5 pp</text>

      <text x="18" y="158" className="interval-label">Page grounding</text>
      <text x="700" y="158" textAnchor="end" className="ci-caption">-19.0 to -5.9</text>
      <line x1={x(-19.0)} y1="195" x2={x(-5.9)} y2="195" className="ci grounding-ci" />
      <line x1={x(-19.0)} y1="183" x2={x(-19.0)} y2="207" className="ci-cap grounding-ci" />
      <line x1={x(-5.9)} y1="183" x2={x(-5.9)} y2="207" className="ci-cap grounding-ci" />
      <Diamond cx={x(-12.2)} cy={195} r={11} />
      <text x="700" y="206" textAnchor="end" className="interval-value strong">-12.2 pp</text>

      <line x1={x(-22)} y1="230" x2={x(12)} y2="230" className="axis-line" />
      {[-20, -10, 0, 10].map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} y1="230" x2={x(tick)} y2="239" className="axis-tick" />
          <text x={x(tick)} y="276" textAnchor="middle" className="interval-axis">
            {tick > 0 ? `+${tick}` : tick} pp
          </text>
        </g>
      ))}
    </svg>
  );
}

function MismatchBars() {
  return (
    <div className="mismatch" aria-label="Perfect answers with grounding below 0.8">
      <h3>PERFECT ANSWER, GROUNDING BELOW 0.8</h3>
      <div className="mismatch-row localized-row">
        <div className="mismatch-meta">
          <span className="mismatch-name"><i aria-hidden="true" /> Localized</span>
          <strong>4 / 55&nbsp;&nbsp;·&nbsp;&nbsp;7.3%</strong>
        </div>
        <span className="bar-track"><b style={{ width: '7.3%' }} /></span>
      </div>
      <div className="mismatch-row distributed-row">
        <div className="mismatch-meta">
          <span className="mismatch-name"><i aria-hidden="true" /> Distributed</span>
          <strong>16 / 34&nbsp;&nbsp;·&nbsp;&nbsp;47.1%</strong>
        </div>
        <span className="bar-track"><b style={{ width: '47.1%' }} /></span>
      </div>
      <p>A correct-looking answer is not enough: incomplete support is much more common when gold evidence spans pages.</p>
    </div>
  );
}

function NarrowingPlot() {
  const y = (value: number) => 254 - ((value - 78) / 19) * 190;
  const ticks = [80, 85, 90, 95];
  const xRaw = 180;
  const xFinal = 560;

  return (
    <svg
      className="narrowing-plot"
      viewBox="0 0 800 340"
      aria-label="Raw-to-final page grounding rises for localized evidence and falls for distributed evidence"
    >
      <title>Raw-to-final page grounding by evidence shape</title>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1="126" y1={y(tick)} x2="618" y2={y(tick)} className="slope-grid" />
          <text x="104" y={y(tick) + 10} textAnchor="end" className="slope-axis">{tick}%</text>
        </g>
      ))}

      <text x="706" y="34" textAnchor="middle" className="delta-unit">CHANGE</text>

      <line x1={xRaw} y1={y(89.8)} x2={xFinal} y2={y(93.8)} className="localized-line" />
      <Circle cx={xRaw} cy={y(89.8)} r={16} />
      <Circle cx={xFinal} cy={y(93.8)} r={16} />
      <text x={xRaw} y={y(89.8) - 22} textAnchor="middle" className="localized-value">89.8%</text>
      <text x={xFinal} y={y(93.8) - 22} textAnchor="middle" className="localized-value">93.8%</text>
      <text x="706" y={y(93.8) + 10} textAnchor="middle" className="delta-positive">+4.0</text>

      <line x1={xRaw} y1={y(84.2)} x2={xFinal} y2={y(81.6)} className="distributed-line" />
      <Diamond cx={xRaw} cy={y(84.2)} r={18} />
      <Diamond cx={xFinal} cy={y(81.6)} r={18} />
      <text x={xRaw} y={y(84.2) - 22} textAnchor="middle" className="distributed-value">84.2%</text>
      <text x={xFinal} y={y(81.6) + 42} textAnchor="middle" className="distributed-value">81.6%</text>
      <text x="706" y={y(81.6) + 10} textAnchor="middle" className="delta-negative">-2.6</text>

      <text x={xRaw} y="326" textAnchor="middle" className="stage-label">RAW RETRIEVAL</text>
      <text x={xFinal} y="326" textAnchor="middle" className="stage-label">FINAL ATTRIBUTION</text>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="poster">
      <header className="poster-header">
        <div className="header-meta">
          <p>EMPIRICAL NLP / RESEARCH POSTER</p>
          <p>AUTHOR NAME / UNIVERSITY OF TRIER / STUDENT ID: [PLACEHOLDER]</p>
        </div>

        <div className="title-row">
          <div className="title-copy">
            <h1>Correct Answers, Uneven Grounding</h1>
            <p className="subtitle">The distributed-evidence gap in legal RAG</p>
          </div>
          <div className="headline-finding">
            <strong>-12.2 pp</strong>
            <span>final page-grounding gap</span>
            <small>95% CI: -19.0 to -5.9</small>
          </div>
        </div>

        <div className="header-bottom">
          <p className="thesis">Answer scores stay high. Complete source support falls when evidence spans pages.</p>
          <p className="scope">95 eligible questions / 30 PDFs / 590 pages</p>
        </div>
      </header>

      <section className="poster-body">
        <aside className="hypothesis-panel">
          <SectionLabel number="1">Hypothesis</SectionLabel>
          <p className="context">
            Correct answers and complete citation sets are different outcomes. Aggregate scores can hide whether their mismatch depends on evidence shape.
          </p>

          <div className="research-question">
            <h3>RESEARCH QUESTION</h3>
            <p>How does distributed evidence affect answer quality and page grounding in a legal RAG pipeline?</p>
          </div>

          <div className="hypothesis-statement">
            <h3>H1</h3>
            <p>Multi-page evidence will preserve answer quality but weaken final grounding; uniform narrowing may widen the gap.</p>
          </div>

          <div className="study-split">
            <div>
              <strong>59</strong>
              <span><i className="circle-mark" aria-hidden="true" /> localized</span>
              <small>exactly one gold page</small>
            </div>
            <div>
              <strong>36</strong>
              <span><i className="diamond-mark" aria-hidden="true" /> distributed</span>
              <small>multiple gold pages</small>
            </div>
          </div>

          <div className="definitions">
            <p><b>Answer quality</b> / mean benchmark score on a 0-1 scale.</p>
            <p><b>Source grounding</b> / page F-beta, beta = 2.5, weighting recall.</p>
            <p><b>Evidence shape</b> / 35 of 36 distributed questions also span documents; the effects are confounded.</p>
          </div>
        </aside>

        <section className="method-panel">
          <div className="method-heading">
            <SectionLabel number="2">Methodology</SectionLabel>
            <p>Page identity is preserved from ingestion to emitted citations.</p>
          </div>
          <MethodFlow />
          <div className="method-note">
            <EvidenceShapeKey />
            <p>One saved pipeline run; architecture explains traceability, not causality.</p>
          </div>
        </section>

        <section className="results-panel">
          <SectionLabel number="3">Results</SectionLabel>
          <div className="results-title-row">
            <h2>Answers stay level.<br />Grounding separates.</h2>
            <p>Means across 95 questions with annotated gold pages.</p>
          </div>
          <PrimaryComparisonPlot />
          <div className="result-details">
            <div className="interval-wrap">
              <IntervalPlot />
              <p>20,000 stratified bootstrap resamples. The answer interval crosses zero; the grounding interval does not.</p>
            </div>
            <MismatchBars />
          </div>
        </section>

        <aside className="diagnostic-panel">
          <SectionLabel number="4">Diagnostic</SectionLabel>
          <h2>Citation narrowing<br />moves groups apart.</h2>
          <p className="diagnostic-intro">Page F-beta before and after answer-conditioned attribution, from the same run.</p>
          <NarrowingPlot />
          <div className="decision">
            <h3>DESIGN IMPLICATION</h3>
            <p>Use evidence spread as a routing signal: narrow localized support; preserve and aggregate distributed support.</p>
          </div>
          <p className="boundary">Gold evidence shape is unavailable at inference time. Observable proxies include retrieval spread, cross-document dependencies, and claim-level support checks.</p>
        </aside>
      </section>

      <footer className="poster-footer">
        <section>
          <h2>Limitations</h2>
          <p>One saved development run; retrospective and observational analysis; page and document spread are confounded; answer types and scoring methods are uneven; the grounding-below-0.8 threshold is descriptive.</p>
        </section>
        <section>
          <h2>Interpretation boundary</h2>
          <p>The evidence-shape pattern is an association, not a causal effect. Raw-to-final changes occur inside one pipeline run and are not an ablation of independently executed systems.</p>
        </section>
        <section>
          <h2>Reproducibility</h2>
          <p className="repo">github.com/SteinVR/Agentic-RAG-Challenge</p>
          <p>20,000 stratified bootstrap resamples / seed 20260903. Configuration, answer scores, and the page-level grounding ledger are retained with the saved run.</p>
        </section>
      </footer>
    </main>
  );
}
