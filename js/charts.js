// Fincas Blanco - Gráficos SVG nativos (usan FB.fmt)
(function (global) {
  'use strict';

  const FBCharts = {
    // Barras verticales
    renderBarChart(containerId, data, labels, colors) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const max = Math.max.apply(null, data.concat([1]));
      const barColor = (colors && colors[0]) || 'var(--kimi-chart-1, #2563eb)';

      let html = '<div class="fb-bar-chart">';
      data.forEach((v, i) => {
        const h = (v / max) * 160;
        const label = labels[i] || '';
        const displayVal = v > 0 ? FB.fmt(v) : '';
        html += '<div class="fb-bar-group">'
              + '<div class="fb-bar-value">' + displayVal + '</div>'
              + '<div class="fb-bar" style="height:' + h + 'px;background:' + barColor + ';opacity:' + (v > 0 ? 1 : 0.15) + ';" title="' + label + ': ' + FB.fmt(v) + '"></div>'
              + '<div class="fb-bar-label">' + label + '</div>'
              + '</div>';
      });
      html += '</div>';
      container.innerHTML = html;
    },

    // Línea: acumulado vs objetivo
    renderLineChart(containerId, actualData, targetData, labels) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const w = container.clientWidth || 600;
      const h = 200;
      // ⚠️ FIX: aumentamos pad.left para que quepan los importes con formato
      const pad = { top: 10, right: 16, bottom: 30, left: 76 };
      const cw = Math.max(w - pad.left - pad.right, 10);
      const ch = h - pad.top - pad.bottom;

      const maxVal = Math.max.apply(null, actualData.concat(targetData, [1]));
      const n = actualData.length;
      if (n === 0) { container.innerHTML = ''; return; }

      const x = (i) => pad.left + (n > 1 ? (i / (n - 1)) * cw : cw / 2);
      const y = (v) => pad.top + ch - (v / maxVal) * ch;

      let actualPath = 'M ' + x(0) + ' ' + y(actualData[0]);
      for (let i = 1; i < n; i++) actualPath += ' L ' + x(i) + ' ' + y(actualData[i]);

      let targetPath = 'M ' + x(0) + ' ' + y(targetData[0]);
      for (let i = 1; i < n; i++) targetPath += ' L ' + x(i) + ' ' + y(targetData[i]);

      const areaPath = actualPath + ' L ' + x(n - 1) + ' ' + (pad.top + ch) + ' L ' + x(0) + ' ' + (pad.top + ch) + ' Z';

      // ⚠️ FIX: formateamos los valores del eje Y sin decimales ni símbolo €,
      // usando separador de miles pero sin ".00" al final. Es más compacto.
      const fmtAxis = (v) => {
        return Number(v).toLocaleString('es-ES', { maximumFractionDigits: 0 });
      };

      let gridLines = '';
      for (let i = 0; i <= 5; i++) {
        const gv = (maxVal / 5) * i;
        const gy = y(gv);
        gridLines += '<line x1="' + pad.left + '" y1="' + gy + '" x2="' + (w - pad.right) + '" y2="' + gy + '" class="grid-line"/>';
        gridLines += '<text x="' + (pad.left - 10) + '" y="' + (gy + 4) + '" text-anchor="end" class="axis-text">' + fmtAxis(gv) + '</text>';
      }

      let xLabels = '';
      const step = Math.max(1, Math.ceil(n / 12));
      for (let i = 0; i < n; i += step) {
        xLabels += '<text x="' + x(i) + '" y="' + (h - 8) + '" text-anchor="middle" class="axis-text">' + (labels[i] || '') + '</text>';
      }

      let dots = '';
      actualData.forEach((v, i) => {
        dots += '<circle cx="' + x(i) + '" cy="' + y(v) + '" class="dot"/>';
      });

      // ⚠️ FIX: quitamos preserveAspectRatio="none" para evitar que el SVG
      // deforme el texto al estirarse. Mantenemos el viewBox para que escale.
      const svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet">'
                + gridLines
                + '<path d="' + areaPath + '" class="area-actual"/>'
                + '<path d="' + targetPath + '" class="line-target"/>'
                + '<path d="' + actualPath + '" class="line-actual"/>'
                + dots
                + xLabels
                + '</svg>';

      container.innerHTML = '<div class="fb-line-chart">' + svg + '</div>';
    },

    // Donut
    renderDonut(containerId, values, labels, colors) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const total = values.reduce((a, b) => a + b, 0);
      if (total === 0) {
        container.innerHTML = '<div class="fb-muted fb-center" style="padding:40px">sin datos</div>';
        return;
      }

      const size = 160, cx = size / 2, cy = size / 2, r = 60, innerR = 38;

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
        const color = (colors && colors[i]) || ('var(--kimi-chart-' + ((i % 5) + 1) + ')');

        paths += '<path d="M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2
              + ' L ' + x3 + ' ' + y3 + ' A ' + innerR + ' ' + innerR + ' 0 ' + largeArc + ' 0 ' + x4 + ' ' + y4 + ' Z"'
              + ' fill="' + color + '" stroke="var(--kimi-color-bg-primary)" stroke-width="2"/>';

        legend += '<div style="display:flex;align-items:center;gap:6px;font-size:12px;">'
                + '<div style="width:8px;height:8px;border-radius:50%;background:' + color + ';"></div>'
                + '<span>' + labels[i] + ': ' + FB.fmt0(v) + '</span>'
                + '</div>';

        startAngle = endAngle;
      });

      const centerText = '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-size="14" font-weight="500" fill="var(--kimi-color-text-primary)">' + FB.fmt0(total) + '</text>'
                       + '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" font-size="10" fill="var(--kimi-color-text-secondary)">total</text>';

      container.innerHTML = '<div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;justify-content:center;">'
                          + '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + paths + centerText + '</svg>'
                          + '<div style="display:flex;flex-direction:column;gap:6px;">' + legend + '</div>'
                          + '</div>';
    }
  };

  global.FBCharts = FBCharts;
})(window);
