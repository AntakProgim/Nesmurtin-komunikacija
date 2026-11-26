import * as d3 from 'd3';

export interface TextAnalysisResult {
  facts: number;
  feelings: number;
  needs: number;
  summary: string;
  source: 'live' | 'ai';
}

interface SliceDatum {
  key: 'facts' | 'feelings' | 'needs';
  label: string;
  value: number;
  color: string;
}

const SLICE_COLORS: Record<'facts' | 'feelings' | 'needs', string> = {
  facts: '#475569',     // Slate — Faktai / Stebėjimas
  feelings: '#d97706',  // Warm Amber — Jausmai
  needs: '#3a5a40',     // Primary Sage — Poreikiai
};

const FACT_MARKERS = [
  'pastebėj', 'matau', 'matė', 'girdėj', 'girdžiu', 'įvyk', 'pateik', 'gavom', 'negavom',
  'buvo', 'nebuvo', 'kartus', 'minuč', 'valand', 'dien', 'savait', 'mėnes', 'metų', 'data',
  'nr.', 'rašt', 'laišk', 'pamok', 'mokykl', 'gatv', 'perėj', 'įraš', 'grafik', 'termin',
  'vėlav', 'praleid', 'neatsak', 'sprendim', 'dokument', 'adres', 'fakt'
];

const FEELING_MARKERS = [
  'jauč', 'jausm', 'pikt', 'pykst', 'liūdn', 'nuliūd', 'nerim', 'sunerim', 'susirūpin',
  'išsigand', 'baim', 'nusivyl', 'sutrik', 'suglum', 'pavarg', 'išsek', 'bejėg', 'nepatog',
  'įsiut', 'susierzin', 'įsižeid', 'dėking', 'ramu', 'džiaug', 'laiming', 'palengv',
  'vieniš', 'kalt', 'smals', 'įtamp', 'skaud', 'bais', 'bjaur', 'nuobod', 'apsunk',
  'niekada', 'visada', 'siaubing', 'nesąmon', 'ignoruoj', 'negerb', 'meluoj', 'tingin'
];

const NEED_MARKERS = [
  'svarb', 'reik', 'poreik', 'saugum', 'pagarb', 'aiškum', 'skaidrum', 'tvark', 'ryš',
  'bendradarbiav', 'pasitikėjim', 'poils', 'ramyb', 'lygyb', 'supratim', 'pagalb',
  'palaikym', 'prasm', 'tiksl', 'sprendim', 'dialog', 'bendruomen', 'privatum', 'sveikat',
  'nuspėjam', 'galimyb', 'patikimum', 'atsakomyb', 'sąžining', 'laisv', 'norėč', 'prašau',
  'prašom', 'galėtum', 'siūlom', 'gerov'
];

export function analyzeTextLocally(rawText: string): TextAnalysisResult {
  const text = rawText.trim().toLowerCase();
  if (!text) {
    return {
      facts: 34,
      feelings: 33,
      needs: 33,
      summary: 'Įveskite tekstą, kad pamatytumėte jausmų, poreikių ir faktų balansą.',
      source: 'live',
    };
  }

  let factScore = 0;
  let feelingScore = 0;
  let needScore = 0;

  // Numeric/date/time signals strongly indicate facts
  const numMatches = text.match(/\b\d+([.,:]\d+)?\b/g);
  if (numMatches) {
    factScore += Math.min(4, numMatches.length) * 1.6;
  }

  // Exclamation marks & emotional intensifiers signal emotional charge
  const exclMatches = text.match(/!+/g);
  if (exclMatches) {
    feelingScore += Math.min(3, exclMatches.length) * 1.4;
  }

  for (const m of FACT_MARKERS) {
    if (text.includes(m)) factScore += 1.2;
  }
  for (const m of FEELING_MARKERS) {
    if (text.includes(m)) feelingScore += 1.4;
  }
  for (const m of NEED_MARKERS) {
    if (text.includes(m)) needScore += 1.3;
  }

  // Baseline smoothing so short sentences still produce meaningful non-NaN splits
  if (factScore === 0 && feelingScore === 0 && needScore === 0) {
    factScore = 2.0;
    feelingScore = 2.4;
    needScore = 1.6;
  } else {
    factScore += 0.4;
    feelingScore += 0.4;
    needScore += 0.4;
  }

  const total = factScore + feelingScore + needScore;
  const facts = Math.round((factScore / total) * 100);
  const feelings = Math.round((feelingScore / total) * 100);
  const needs = Math.max(0, 100 - facts - feelings);

  let summary = 'Tekste gana subalansuotas faktų, jausmų ir poreikių santykis.';
  if (feelings >= 46 && facts < 28) {
    summary = 'Tekste vyrauja emocinė raiška – pridėjus konkrečių faktų (ką matėte / kada įvyko), žinutė taps lengviau išgirstama.';
  } else if (facts >= 48 && needs < 26) {
    summary = 'Tekstas labai faktinis – įvardijus, koks poreikis ar vertybė jums svarbi, prašymas taps aiškesnis.';
  } else if (needs >= 46 && facts < 26) {
    summary = 'Aiškiai matyti jūsų poreikis – pridėjus trumpą neutralų stebėjimą (faktą), kontekstas taps konkretesnis.';
  } else if (feelings >= 42 && needs < 28) {
    summary = 'Ryški jausmų dalis – pabandykite aiškiau įvardyti už jų slypintį poreikį ir konkretų prašymą.';
  }

  return { facts, feelings, needs, summary, source: 'live' };
}

// Keep previous arc angles per container for smooth interpolation
const previousAnglesMap = new WeakMap<HTMLElement, Record<string, d3.PieArcDatum<SliceDatum>>>();

export function renderAnimatedDonutChart(
  container: HTMLElement,
  data: TextAnalysisResult,
  options: { popReveal?: boolean } = {}
): void {
  const { popReveal = false } = options;
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slices: SliceDatum[] = [
    { key: 'facts', label: 'Faktai', value: Math.max(0, data.facts), color: SLICE_COLORS.facts },
    { key: 'feelings', label: 'Jausmai', value: Math.max(0, data.feelings), color: SLICE_COLORS.feelings },
    { key: 'needs', label: 'Poreikiai', value: Math.max(0, data.needs), color: SLICE_COLORS.needs },
  ];

  // Dominant slice for center display
  const dominant = [...slices].sort((a, b) => b.value - a.value)[0];

  const size = 148;
  const radius = size / 2;
  const innerRadius = radius * 0.58;
  const outerRadius = radius * 0.92;

  const pie = d3
    .pie<SliceDatum>()
    .value((d) => d.value)
    .sort(null)
    .padAngle(0.03);

  const arc = d3
    .arc<d3.PieArcDatum<SliceDatum>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(4);

  const arcHover = d3
    .arc<d3.PieArcDatum<SliceDatum>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius + 4)
    .cornerRadius(4);

  const pieData = pie(slices);
  const prevAngles = previousAnglesMap.get(container) || {};

  // Ensure SVG structure exists
  let svg = d3.select(container).select<SVGSVGElement>('svg.nvc-donut-svg');
  let chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let centerValueText: d3.Selection<SVGTextElement, unknown, null, undefined>;
  let centerLabelText: d3.Selection<SVGTextElement, unknown, null, undefined>;

  if (svg.empty()) {
    d3.select(container).selectAll('*').remove();
    svg = d3
      .select(container)
      .append('svg')
      .attr('class', 'nvc-donut-svg')
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('width', size)
      .attr('height', size)
      .attr('role', 'img')
      .attr('aria-label', 'Teksto orientacijos į faktus, jausmus ir poreikius diagrama');

    chartGroup = svg
      .append('g')
      .attr('class', 'nvc-donut-group')
      .attr('transform', `translate(${radius}, ${radius}) scale(0.58)`)
      .style('opacity', 0);

    centerValueText = chartGroup
      .append('text')
      .attr('class', 'donut-center-value')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.05em');

    centerLabelText = chartGroup
      .append('text')
      .attr('class', 'donut-center-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.35em');
  } else {
    chartGroup = svg.select<SVGGElement>('g.nvc-donut-group');
    centerValueText = chartGroup.select<SVGTextElement>('text.donut-center-value');
    centerLabelText = chartGroup.select<SVGTextElement>('text.donut-center-label');
  }

  // Scale + Opacity expansion animation ("išsipūtimas" / scale reveal)
  const duration = reducedMotion ? 0 : popReveal ? 760 : 480;
  if (popReveal && !reducedMotion) {
    chartGroup
      .interrupt()
      .attr('transform', `translate(${radius}, ${radius}) scale(0.55)`)
      .style('opacity', 0.15)
      .transition()
      .duration(duration)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('transform', `translate(${radius}, ${radius}) scale(1)`)
      .style('opacity', 1);
  } else if (!reducedMotion) {
    chartGroup
      .interrupt()
      .attr('transform', `translate(${radius}, ${radius}) scale(0.92)`)
      .transition()
      .duration(duration)
      .ease(d3.easeCubicOut)
      .attr('transform', `translate(${radius}, ${radius}) scale(1)`)
      .style('opacity', 1);
  } else {
    chartGroup.attr('transform', `translate(${radius}, ${radius}) scale(1)`).style('opacity', 1);
  }

  // Bind arcs
  const paths = chartGroup
    .selectAll<SVGPathElement, d3.PieArcDatum<SliceDatum>>('path.donut-slice')
    .data(pieData, (d) => d.data.key);

  const entered = paths
    .enter()
    .append('path')
    .attr('class', 'donut-slice')
    .attr('fill', '#d5dfd8')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer');

  const merged = entered.merge(paths);

  merged
    .on('mouseenter', function (_event, d) {
      d3.select(this).transition().duration(140).attr('d', arcHover(d) || '');
      centerValueText.text(`${d.data.value}%`).attr('fill', d.data.color);
      centerLabelText.text(d.data.label);
    })
    .on('mouseleave', function (_event, d) {
      d3.select(this).transition().duration(160).attr('d', arc(d) || '');
      centerValueText.text(`${dominant.value}%`).attr('fill', dominant.color);
      centerLabelText.text(dominant.label);
    });

  if (popReveal && !reducedMotion) {
    // Animate fill color transition from muted sage-gray into full color + full angular sweep
    merged
      .attr('fill', '#d5dfd8')
      .transition()
      .duration(duration)
      .ease(d3.easeCubicOut)
      .attr('fill', (d) => d.data.color)
      .attrTween('d', function (d) {
        const startArc: d3.PieArcDatum<SliceDatum> = {
          ...d,
          startAngle: 0,
          endAngle: 0,
        };
        const interpolate = d3.interpolate(startArc, d);
        return (t) => arc(interpolate(t)) || '';
      });
  } else {
    merged
      .transition()
      .duration(duration)
      .ease(d3.easeCubicOut)
      .attr('fill', (d) => d.data.color)
      .attrTween('d', function (d) {
        const prev = prevAngles[d.data.key] || { ...d, startAngle: d.startAngle, endAngle: d.startAngle };
        const interpolate = d3.interpolate(prev, d);
        return (t) => arc(interpolate(t)) || '';
      });
  }

  // Update center text smoothly
  centerValueText
    .attr('fill', dominant.color)
    .text(`${dominant.value}%`);
  centerLabelText.text(dominant.label);

  // Store angles for next update
  const nextAngles: Record<string, d3.PieArcDatum<SliceDatum>> = {};
  pieData.forEach((d) => {
    nextAngles[d.data.key] = d;
  });
  previousAnglesMap.set(container, nextAngles);
}
