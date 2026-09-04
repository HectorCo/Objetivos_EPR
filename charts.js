// Fincas Blanco 2026 - Gráficos SVG nativos

const FBCharts = {
  // Gráfico de barras para ingresos por PYS
  renderBarChart(containerId, data, labels, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const max = Math.max(...data, 1);
    const barColor = colors?.[0] || 'var(--kimi-chart-1, #2563eb)';

    let html = '<div class="fb-bar-chart">';
    data.forEach((v, i) => {
      const h = (v / max) * 160;
      const label = labels[i] || '';
      const displayVal = v > 0 ? FB.fmt(v) : '';
      html += `<div class="fb-bar-group">
        <div class="fb-bar-value">${displayVal}</div>
        <div class="fb-bar" style="height:${h}px;background:${barColor};opacity:${v>0?1:0.15};" title="${label}: ${FB.fmt(v)}"></div>
        <div class="fb-bar-label">${label}</div>
      </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  },

  // Gráfico de líneas: progreso acumulado vs objetivo
  renderLineChart(containerId, actualData, targetData, labels) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const w = container.clientWidth || 600;
    const h = 200;
    const pad = { top: 10, right: 10, bottom: 30, left: 50 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const maxVal = Math.max(...actualData, ...targetData, 1);
    const n = actualData.length;

    const x = (i) => pad.left + (i / (n - 1)) * cw;
    const y = (v) => pad.top + ch - (v / maxVal) * ch;

    // Build actual line path
    let actualPath = `M ${x(0)} ${y(actualData[0])}`;
    for (let i = 1; i < n; i++) {
      actualPath += ` L ${x(i)} ${y(actualData[i])}`;
    }

    // Build target line path
    let targetPath = `M ${x(0)} ${y(targetData[0])}`;
    for (let i = 1; i < n; i++) {
      targetPath += ` L ${x(i)} ${y(targetData[i])}`;
    }

    // Area under actual
    let areaPath = actualPath + ` L ${x(n-1)} ${pad.top + ch} L ${x(0)} ${pad.top + ch} Z`;

    // Grid lines
    const gridCount = 5;
    let gridLines = '';
    for (let i = 0; i <= gridCount; i++) {
      const gv = (maxVal / gridCount) * i;
      const gy = y(gv);
      gridLines += `<line x1="${pad.left}" y1="${gy}" x2="${w - pad.right}" y2="${gy}" class="grid-line"/>`;
      gridLines += `<text x="${pad.left - 8}" y="${gy + 3}" text-anchor="end" class="axis-text">${FB.fmt0(gv)}</text>`;
    }

    // X labels
    let xLabels = '';
    const step = Math.ceil(n / 12);
    for (let i = 0; i < n; i += step) {
      xLabels += `<text x="${x(i)}" y="${h - 8}" text-anchor="middle" class="axis-text">${labels[i] || ''}</text>`;
    }

    // Dots for actual
    let dots = '';
    actualData.forEach((v, i) => {
      dots += `<circle cx="${x(i)}" cy="${y(v)}" class="dot"/>`;
    });

    const svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      ${gridLines}
      <path d="${areaPath}" class="area-actual"/>
      <path d="${targetPath}" class="line-target"/>
      <path d="${actualPath}" class="line-actual"/>
      ${dots}
      ${xLabels}
    </svg>`;

    container.innerHTML = `<div class="fb-line-chart">${svg}</div>`;
  },

  // Mini sparkline para KPIs
  renderSparkline(containerId, data, color) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const w = container.clientWidth || 120;
    const h = 40;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const n = data.length;

    let path = '';
    data.forEach((v, i) => {
      const x = (i / (n - 1)) * w;
      const y = h - ((v - min) / range) * h;
      path += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
    });

    const svg = `<svg width="${w}" height="${h}" style="overflow:visible">
      <path d="${path}" fill="none" stroke="${color || 'var(--kimi-chart-1, #2563eb)'}" stroke-width="2" stroke-linecap="round"/>
    </svg>`;

    container.innerHTML = svg;
  },

  // Donut chart para desglose por tipo
  renderDonut(containerId, values, labels, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0) { container.innerHTML = '<div class="fb-muted fb-center" style="padding:40px">sin datos</div>'; return; }

    const size = 160;
    const cx = size / 2;
    const cy = size / 2;
    const r = 60;
    const innerR = 38;

    let startAngle = -Math.PI / 2;
    let paths = '';
    let legend = '';

    values.forEach((v, i) => {
      const angle = (v / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const x3 = cx + innerR * Math.cos(endAngle);
      const y3 = cy + innerR * Math.sin(endAngle);
      const x4 = cx + innerR * Math.cos(startAngle);
      const y4 = cy + innerR * Math.sin(startAngle);

      const largeArc = angle > Math.PI ? 1 : 0;
      const color = colors[i] || `var(--kimi-chart-${(i % 5) + 1})`;

      paths += `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z" fill="${color}" stroke="var(--kimi-color-bg-primary)" stroke-width="2"/>`;

      legend += `<div style="display:flex;align-items:center;gap:6px;font-size:12px;">
        <div style="width:8px;height:8px;border-radius:50%;background:${color};"></div>
        <span>${labels[i]}: ${FB.fmt(v)}</span>
      </div>`;

      startAngle = endAngle;
    });

    const centerText = `<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="14" font-weight="500" fill="var(--kimi-color-text-primary)">${FB.fmt(total)}</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="10" fill="var(--kimi-color-text-secondary)">total</text>`;

    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;justify-content:center;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${paths}${centerText}</svg>
        <div style="display:flex;flex-direction:column;gap:6px;">${legend}</div>
      </div>
    `;
  }
};
