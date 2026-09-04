// Fincas Blanco 2026 - Aplicación Principal (v3 - Reescritura completa)

(function() {
  'use strict';

  // ===== CONSTANTES =====
  const MONTHS = ['noviembre','diciembre','enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const MONTHS_SHORT = ['nov','dic','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const MONTHS_ESCRITURA = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const TYPES = ['VENTA PISO','VENTA LOCAL','ALQUILER','VENTA PARKING','TASACIÓN'];
  const TYPE_LABELS = {
    'VENTA PISO': 'venta piso',
    'VENTA LOCAL': 'venta local',
    'ALQUILER': 'alquiler',
    'VENTA PARKING': 'venta parking',
    'TASACIÓN': 'tasación'
  };

  // ===== DATOS POR DEFECTO =====
  const DEFAULT_OPS = [
    {id:1,month:0,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'febrero',pct:0.8},
    {id:2,month:0,type:'VENTA PISO',qty:1,honorarios:19500,escritura:'enero',pct:0.4},
    {id:3,month:0,type:'VENTA PISO',qty:0,honorarios:10000,escritura:'enero',pct:0.8},
    {id:4,month:0,type:'VENTA PISO',qty:1,honorarios:12000,escritura:'febrero',pct:1.0},
    {id:5,month:0,type:'VENTA PISO',qty:1,honorarios:12000,escritura:'marzo',pct:0.8},
    {id:6,month:0,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'enero',pct:0.8},
    {id:7,month:2,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'agosto',pct:0.4},
    {id:8,month:2,type:'VENTA LOCAL',qty:1,honorarios:10000,escritura:'abril',pct:0.8},
    {id:9,month:2,type:'VENTA LOCAL',qty:1,honorarios:39000,escritura:'abril',pct:1.0},
    {id:10,month:3,type:'ALQUILER',qty:1,honorarios:1058,escritura:'febrero',pct:1.0},
    {id:11,month:3,type:'ALQUILER',qty:1,honorarios:948,escritura:'febrero',pct:1.0},
    {id:12,month:3,type:'VENTA PISO',qty:1,honorarios:6000,escritura:'junio',pct:1.0},
    {id:13,month:3,type:'VENTA LOCAL',qty:1,honorarios:48400,escritura:'julio',pct:1.0},
    {id:14,month:3,type:'VENTA PISO',qty:1,honorarios:12000,escritura:'febrero',pct:0.3},
    {id:15,month:4,type:'VENTA PISO',qty:1,honorarios:12000,escritura:'junio',pct:1.0},
    {id:16,month:5,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'noviembre',pct:0.8},
    {id:17,month:5,type:'ALQUILER',qty:1,honorarios:1508.25,escritura:'abril',pct:1.0},
    {id:18,month:5,type:'VENTA LOCAL',qty:1,honorarios:10000,escritura:'mayo',pct:0.4},
    {id:19,month:5,type:'ALQUILER',qty:1,honorarios:1084.16,escritura:'abril',pct:1.0},
    {id:20,month:5,type:'VENTA LOCAL',qty:1,honorarios:30000,escritura:'septiembre',pct:1.0},
    {id:21,month:6,type:'ALQUILER',qty:1,honorarios:985.77,escritura:'mayo',pct:1.0},
    {id:22,month:6,type:'ALQUILER',qty:1,honorarios:1480.57,escritura:'mayo',pct:1.0},
    {id:23,month:6,type:'VENTA PISO',qty:0,honorarios:22000,escritura:'septiembre',pct:0.2},
    {id:24,month:6,type:'ALQUILER',qty:1,honorarios:1270.5,escritura:'mayo',pct:1.0},
    {id:25,month:7,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'septiembre',pct:1.0},
    {id:26,month:7,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'julio',pct:1.0},
    {id:27,month:7,type:'VENTA PISO',qty:0,honorarios:10000,escritura:'septiembre',pct:0.4},
    {id:28,month:7,type:'VENTA PISO',qty:1,honorarios:5000,escritura:'septiembre',pct:0.4},
    {id:29,month:7,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'octubre',pct:1.0},
    {id:30,month:8,type:'VENTA LOCAL',qty:1,honorarios:5500,escritura:'julio',pct:1.0},
  ];

  const DEFAULT_GOALS = {
    pisos: 22,
    locales: 2,
    alquileres: 4,
    ingresos: 258000,
    trimestre: 64500,
    pisoValor: 10550
  };

  const DEFAULT_ADDRESSES_SOLD = [
    {date:'2025-11-01',addr:'C/ 8 de març, 64, 2º 1ª',val:6446.28},
    {date:'2026-02-01',addr:'Av/ Torrente Gornal, 72',val:2975.21},
    {date:'2026-03-01',addr:'C/ Llunàs, 2, 1º 1ª',val:9917.36},
    {date:'2026-05-01',addr:'C/ Badalona, 14 (CASA)',val:0},
    {date:'2025-11-01',addr:'Plaza Blocs Florida, 12 3º 4ª',val:6611.57},
    {date:'2026-06-01',addr:'C/ Rubidi, 8, 2º 2ª',val:8264.46},
    {date:'2026-04-01',addr:'C/ Alegria, 4 (LOCAL)',val:3305.79},
    {date:'2025-11-01',addr:'C/ Casanova, 23 3º 1ª',val:9917.36},
    {date:'2025-12-01',addr:'C/ Teide, 10 4º 3ª',val:6611.57},
    {date:'2025-11-01',addr:'Rambla Marina, 528 13º 1ª',val:7933.88},
    {date:'2026-01-01',addr:'Av/ Vilanova, 12 (LOCAL)',val:6611.57},
    {date:'2026-01-01',addr:'C/ Vinaroz, 3 3º 1ª',val:3305.79},
    {date:'2026-01-26',addr:'C/ Gerona, 27 (LOCAL)',val:32231.40},
    {date:'2026-02-01',addr:'C/ CENTRE 4, plta 1, prta 2',val:4958.68},
    {date:'2026-02-01',addr:'Av/ Fabregada, 93 (LOCAL)',val:40000},
    {date:'2026-04-01',addr:'HIERBABUENA, DE LA, 10, prta: 1',val:6611.57},
    {date:'2026-06-01',addr:'Ctra de Esplugues, 14, 9º 3ª',val:8264.46},
    {date:'2026-04-01',addr:'C/ Josep Torras i Bages, 31 (LOCAL)',val:24793.39},
    {date:'2026-06-01',addr:'Rambla Just Oliveras, 27 Entlo 2ª',val:8264.46},
    {date:'2026-06-01',addr:'C/ Rosa de Alejandría, 85, SB 1º',val:1652.89},
    {date:'2026-07-01',addr:'C/ Estronci, 47, LOCAL',val:4545.45},
  ];

  const DEFAULT_ADDRESSES_RENT = [
    {date:'2025-11-01',addr:'Av/ Isabel la católica, 14, 3º 8ª',contract:550,val:1424.38},
    {date:'2026-02-01',addr:'C/ Santa Rosa, 12, 3º 2ª',contract:550,val:1333.47},
    {date:'2026-03-01',addr:'Carretera de Hospitalet, 238 ESC B 1º 3ª',contract:550,val:1796.49},
    {date:'2026-05-01',addr:'Av/ Fabregada, 70, 5º 2ª',contract:550,val:1364.69},
    {date:'2025-11-01',addr:'Av/ Isabel la católica, 34, 5º 6ª',contract:550,val:550},
    {date:'2026-06-01',addr:'C/ Santiago de Compostela, 2-4, At 2ª',contract:0,val:896},
    {date:'2026-04-01',addr:'Rambla Marina 528, 1-4',contract:550,val:1773.61},
    {date:'2026-04-01',addr:'Av/ Carrilet, 220, At 3ª',contract:0,val:1050},
  ];

  const DEFAULT_COMISIONES = [
    {sin:16528.93,con:20000},{sin:15702.48,con:19000},{sin:14876.03,con:18000},
    {sin:14049.59,con:17000},{sin:13223.14,con:16000},{sin:12396.69,con:15000},
    {sin:11570.25,con:14000},{sin:10743.80,con:13000},{sin:9917.36,con:12000},
    {sin:9090.91,con:11000},{sin:8264.46,con:10000},{sin:7438.02,con:9000},
    {sin:6611.57,con:8000},{sin:5785.12,con:7000},{sin:4958.68,con:6000},
    {sin:4132.23,con:5000},{sin:0,con:0}
  ];

  const DEFAULT_COEFS = [
    {type:'VENTA PISO',coef:1.0,month:'enero'},
    {type:'VENTA PARKING',coef:0.8,month:'febrero'},
    {type:'VENTA LOCAL',coef:0.6,month:'marzo'},
    {type:'TASACIÓN',coef:0.4,month:'abril'},
    {type:'ALQUILER',coef:0.2,month:'mayo'},
  ];

  // ===== ESTADO =====
  let state = {
    year: 2026,
    ops: [],
    sold: [],
    rent: [],
    goals: {},
    comisiones: [],
    coefs: [],
    editingOp: null,
    editingAddress: null,
    nextId: 1,
    nextAddrId: 1,
    activeTab: 'dashboard'
  };

  // ===== FORMATO =====
  function fmt(n) {
    if (n === undefined || n === null || isNaN(n)) return '-';
    return n.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' €';
  }

  function fmt0(n) {
    if (n === undefined || n === null || isNaN(n)) return '-';
    return n.toLocaleString('es-ES', {maximumFractionDigits: 0});
  }

  function fmtPct(n) {
    if (n === undefined || n === null || isNaN(n)) return '-';
    return (n * 100).toFixed(0) + '%';
  }

  function fmtDateEU(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}-${m}-${y}`;
  }

  function parseDateEU(euDate) {
    if (!euDate) return '';
    const [d, m, y] = euDate.split('-');
    return `${y}-${m}-${d}`;
  }

  // ===== CÁLCULOS =====
  function calcSinIva(op) {
    return op.qty * (op.honorarios * op.pct) / 1.21;
  }

  function getPysByMonth() {
    const arr = new Array(14).fill(0);
    state.ops.forEach(op => {
      if (op.month >= 0 && op.month < 14) {
        arr[op.month] += calcSinIva(op);
      }
    });
    return arr;
  }

  function getEscrituraByMonth() {
    const map = {};
    MONTHS_ESCRITURA.forEach(m => map[m] = 0);
    state.ops.forEach(op => {
      const m = op.escritura.toLowerCase();
      if (map[m] !== undefined) {
        map[m] += calcSinIva(op);
      }
    });
    return map;
  }

  function getTotals() {
    let pisos = 0, locales = 0, alquileres = 0, total = 0;
    state.ops.forEach(op => {
      const v = calcSinIva(op);
      total += v;
      if (op.type === 'VENTA PISO') pisos += op.qty;
      if (op.type === 'VENTA LOCAL') locales += op.qty;
      if (op.type === 'ALQUILER') alquileres += op.qty;
    });
    return { pisos, locales, alquileres, total };
  }

  function getTrimestreData(escrituraMap) {
    const meses = MONTHS_ESCRITURA;
    const result = [];
    for (let t = 0; t < 4; t++) {
      const sum = meses.slice(t * 3, (t + 1) * 3).reduce((a, m) => a + (escrituraMap[m] || 0), 0);
      const falta = sum - state.goals.trimestre;
      const pisos = Math.abs(falta / state.goals.pisoValor);
      result.push({ trimestre: t + 1, ingresos: sum, falta, pisos });
    }
    return result;
  }

  function getMonthLabel(idx) {
    return MONTHS[idx] + ' ' + (idx < 2 ? 2025 : 2026);
  }

  function getCurrentMonthIndex() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-11
    if (y === 2025) return m - 10;
    return m + 2;
  }

  // ===== PERSISTENCIA =====
  const STORAGE_KEY = 'fincas_blanco_data_v3';

  function loadYear(year) {
    state.year = year;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const all = JSON.parse(saved);
        const data = all[year];
        if (data) {
          state.ops = data.ops || [];
          state.sold = data.sold || [];
          state.rent = data.rent || [];
          state.goals = data.goals || { ...DEFAULT_GOALS };
          state.comisiones = data.comisiones || JSON.parse(JSON.stringify(DEFAULT_COMISIONES));
          state.coefs = data.coefs || JSON.parse(JSON.stringify(DEFAULT_COEFS));
          state.nextId = data.nextId || 1;
          state.nextAddrId = data.nextAddrId || 1;
          return;
        }
      } catch (e) {}
    }
    // Datos por defecto
    if (year === 2026) {
      state.ops = JSON.parse(JSON.stringify(DEFAULT_OPS));
      state.sold = JSON.parse(JSON.stringify(DEFAULT_ADDRESSES_SOLD));
      state.rent = JSON.parse(JSON.stringify(DEFAULT_ADDRESSES_RENT));
    } else {
      state.ops = [];
      state.sold = [];
      state.rent = [];
    }
    state.goals = { ...DEFAULT_GOALS };
    state.comisiones = JSON.parse(JSON.stringify(DEFAULT_COMISIONES));
    state.coefs = JSON.parse(JSON.stringify(DEFAULT_COEFS));
    state.nextId = year === 2026 ? 31 : 1;
    state.nextAddrId = year === 2026 ? 22 : 1;
  }

  function saveState() {
    try {
      let all = {};
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) all = JSON.parse(raw);
      all[state.year] = {
        ops: state.ops,
        sold: state.sold,
        rent: state.rent,
        goals: state.goals,
        comisiones: state.comisiones,
        coefs: state.coefs,
        nextId: state.nextId,
        nextAddrId: state.nextAddrId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  function exportJSON() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fincas_blanco_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        callback(null, data);
      } catch (err) { callback(err); }
    };
    reader.readAsText(file);
  }

  // ===== INICIALIZACIÓN =====
  function init() {
    loadYear(2026);
    bindEvents();
    renderAll();
    setupServiceWorker();
  }

  function bindEvents() {
    // Tabs
    document.querySelectorAll('.fb-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Year selector
    document.getElementById('year-display')?.addEventListener('click', showYearModal);

    // Export/Import
    document.getElementById('btn-export')?.addEventListener('click', () => {
      exportJSON();
      showToast('backup exportado');
    });

    document.getElementById('btn-import')?.addEventListener('click', () => {
      document.getElementById('import-file').click();
    });

    document.getElementById('import-file')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      importJSON(file, (err) => {
        if (err) { showToast('error al importar'); return; }
        loadYear(state.year);
        renderAll();
        showToast('backup importado');
      });
      e.target.value = '';
    });

    // Modal
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') closeModal();
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.fb-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    document.querySelectorAll('.fb-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tabName));
    if (tabName === 'dashboard') setTimeout(renderDashboard, 50);
    if (tabName === 'graficos') setTimeout(renderGraficos, 50);
  }

  function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // ===== RENDER PRINCIPAL =====
  function renderAll() {
    renderDashboard();
    renderOperaciones();
    renderResumen();
    renderListas();
    renderConfig();
    renderGraficos();
    updateYearDisplay();
  }

  function updateYearDisplay() {
    const el = document.getElementById('year-display');
    if (el) el.textContent = state.year;
  }

  // ===== DASHBOARD =====
  function renderDashboard() {
    const t = getTotals();
    const esc = getEscrituraByMonth();
    const trimData = getTrimestreData(esc);
    const pys = getPysByMonth();

    // KPIs
    const kpiContainer = document.getElementById('kpi-cards');
    if (kpiContainer) {
      kpiContainer.innerHTML = `
        <div class="fb-card">
          <div class="fb-metric-label">pisos vendidos</div>
          <div class="fb-metric-value">${fmt0(t.pisos)}<span class="fb-metric-suffix">/ ${fmt0(state.goals.pisos)}</span></div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.pisos / state.goals.pisos * 100)}%;background:var(--kimi-chart-1)"></div></div>
        </div>
        <div class="fb-card">
          <div class="fb-metric-label">locales vendidos</div>
          <div class="fb-metric-value">${fmt0(t.locales)}<span class="fb-metric-suffix">/ ${fmt0(state.goals.locales)}</span></div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.locales / state.goals.locales * 100)}%;background:var(--kimi-chart-2)"></div></div>
        </div>
        <div class="fb-card">
          <div class="fb-metric-label">alquileres</div>
          <div class="fb-metric-value">${fmt0(t.alquileres)}<span class="fb-metric-suffix">/ ${fmt0(state.goals.alquileres)}</span></div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.alquileres / state.goals.alquileres * 100)}%;background:var(--kimi-chart-3)"></div></div>
        </div>
        <div class="fb-card">
          <div class="fb-metric-label">ingresos totales</div>
          <div class="fb-metric-value">${fmt(t.total)}<span class="fb-metric-suffix">/ ${fmt(state.goals.ingresos)}</span></div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.total / state.goals.ingresos * 100)}%"></div></div>
        </div>
      `;
    }

    // Bar chart PYS
    renderBarChart('pys-chart', pys, MONTHS_SHORT);

    // Escritura table
    const escTable = document.getElementById('escritura-table');
    if (escTable) {
      let tbody = '';
      MONTHS_ESCRITURA.forEach((m, i) => {
        const v = esc[m] || 0;
        const trimIdx = Math.floor(i / 3);
        const isTrimEnd = (i + 1) % 3 === 0;
        tbody += `<tr><td style="text-transform:capitalize">${m}</td><td class="num">${fmt(v)}</td></tr>`;
        if (isTrimEnd && trimData[trimIdx]) {
          const td = trimData[trimIdx];
          tbody += `<tr style="background:color-mix(in srgb,var(--kimi-color-bg-hover) 40%,transparent)">
            <td colspan="2" style="text-align:right;font-size:12px;color:var(--kimi-color-text-secondary);padding:6px 10px">
              ${td.trimestre}º trimestre: falta <span class="${td.falta < 0 ? 'fb-negative' : 'fb-positive'}">${fmt(td.falta)}</span> · ${fmt(td.pisos)} pisos
            </td>
          </tr>`;
        }
      });
      escTable.innerHTML = `<thead><tr><th>mes</th><th class="num">importe</th></tr></thead><tbody>${tbody}</tbody>`;
    }

    // Bono table
    const bonoTable = document.getElementById('bono-table');
    if (bonoTable) {
      let tbody = '';
      trimData.forEach(td => {
        tbody += `<tr>
          <td>${td.trimestre}º</td>
          <td class="num">${fmt(td.ingresos)}</td>
          <td class="num ${td.falta < 0 ? 'fb-negative' : 'fb-positive'}">${fmt(td.falta)}</td>
          <td class="num">${fmt(td.pisos)}</td>
        </tr>`;
      });
      bonoTable.innerHTML = `<thead><tr><th>trimestre</th><th class="num">ingresos</th><th class="num">falta</th><th class="num">pisos</th></tr></thead><tbody>${tbody}</tbody>`;
    }
  }

  // ===== OPERACIONES =====
  function renderOperaciones() {
    const container = document.getElementById('ops-container');
    if (!container) return;

    let html = '';
    for (let m = 0; m < 14; m++) {
      const ops = state.ops.filter(o => o.month === m);
      const isEditingNew = state.editingOp && state.editingOp.id === 0 && state.editingOp.month === m;

      if (ops.length === 0 && !isEditingNew) continue;

      html += `<div class="fb-month-header" data-month="${m}">${getMonthLabel(m)}</div>`;
      html += `<div class="fb-table-wrap"><table class="fb-table"><thead><tr><th>tipo</th><th class="center">cant</th><th class="num">honorarios</th><th>escritura</th><th class="num">%</th><th class="num">sin iva</th><th></th></tr></thead><tbody>`;

      ops.forEach(op => {
        if (state.editingOp && state.editingOp.id === op.id) {
          html += renderOpEditRow(op);
        } else {
          html += renderOpRow(op);
        }
      });

      if (isEditingNew) {
        html += renderOpEditRow(state.editingOp);
      }

      html += '</tbody></table></div>';
    }

    container.innerHTML = html || '<div class="fb-muted fb-center" style="padding:60px 20px">no hay operaciones registradas. haz clic en "+ nueva operación" para empezar.</div>';
  }

  function renderOpRow(op) {
    const badgeClass = {
      'VENTA PISO': 'fb-badge-piso',
      'VENTA LOCAL': 'fb-badge-local',
      'ALQUILER': 'fb-badge-alq',
      'VENTA PARKING': 'fb-badge-parking',
      'TASACIÓN': 'fb-badge-tas'
    }[op.type] || 'fb-badge-piso';

    return `<tr>
      <td><span class="fb-badge ${badgeClass}">${TYPE_LABELS[op.type] || op.type.toLowerCase()}</span></td>
      <td class="center">${fmt0(op.qty)}</td>
      <td class="num">${fmt(op.honorarios)}</td>
      <td style="text-transform:capitalize">${op.escritura}</td>
      <td class="num">${fmtPct(op.pct)}</td>
      <td class="num" style="font-weight:500">${fmt(calcSinIva(op))}</td>
      <td class="num" style="width:90px"><span class="fb-row-actions">
        <button class="fb-btn fb-btn-sm" onclick="App.editOp(${op.id})">editar</button>
        <button class="fb-btn fb-btn-sm fb-btn-danger" onclick="App.delOp(${op.id})">×</button>
      </span></td>
    </tr>`;
  }

  function renderOpEditRow(op) {
    const typeOpts = TYPES.map(t => `<option value="${t}" ${op.type === t ? 'selected' : ''}>${TYPE_LABELS[t]}</option>`).join('');
    const escOpts = MONTHS_ESCRITURA.map(m => `<option value="${m}" ${op.escritura === m ? 'selected' : ''}>${m}</option>`).join('');

    return `<tr class="fb-edit-row">
      <td><select class="fb-select" id="op-type-${op.id}" style="min-width:110px">${typeOpts}</select></td>
      <td><input class="fb-input" id="op-qty-${op.id}" type="number" value="${op.qty}" style="width:55px;text-align:center"></td>
      <td><input class="fb-input" id="op-hon-${op.id}" type="number" step="0.01" value="${op.honorarios}" style="width:90px;text-align:right"></td>
      <td><select class="fb-select" id="op-esc-${op.id}" style="min-width:95px">${escOpts}</select></td>
      <td><input class="fb-input" id="op-pct-${op.id}" type="number" step="0.05" value="${op.pct}" style="width:55px;text-align:right"></td>
      <td class="num" style="color:var(--kimi-color-text-secondary)">${fmt(calcSinIva(op))}</td>
      <td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveOp(${op.id})">guardar</button> <button class="fb-btn fb-btn-sm" onclick="App.cancelEdit()">cancelar</button></td>
    </tr>`;
  }

  // ===== RESUMEN =====
  function renderResumen() {
    const t = getTotals();
    const cumpl = t.total / state.goals.ingresos;

    const kpiContainer = document.getElementById('resumen-kpis');
    if (kpiContainer) {
      kpiContainer.innerHTML = `
        <div class="fb-card">
          <div class="fb-card-title">cumplimiento de objetivos</div>
          <div class="fb-metric-value" style="font-size:42px;margin:8px 0">${fmt(cumpl * 100)}</div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, cumpl * 100)}%"></div></div>
          <div class="fb-small fb-mt-sm">real: ${fmt(t.total)} · objetivo: ${fmt(state.goals.ingresos)}</div>
        </div>
        <div class="fb-card">
          <div class="fb-card-title">desglose por tipo</div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
            <div class="fb-flex fb-flex-between"><span class="fb-small">pisos vendidos</span><span class="fb-mid">${fmt0(t.pisos)} / ${fmt0(state.goals.pisos)}</span></div>
            <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.pisos / state.goals.pisos * 100)}%;background:var(--kimi-chart-1)"></div></div>
            <div class="fb-flex fb-flex-between"><span class="fb-small">locales vendidos</span><span class="fb-mid">${fmt0(t.locales)} / ${fmt0(state.goals.locales)}</span></div>
            <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.locales / state.goals.locales * 100)}%;background:var(--kimi-chart-2)"></div></div>
            <div class="fb-flex fb-flex-between"><span class="fb-small">alquileres</span><span class="fb-mid">${fmt0(t.alquileres)} / ${fmt0(state.goals.alquileres)}</span></div>
            <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.alquileres / state.goals.alquileres * 100)}%;background:var(--kimi-chart-3)"></div></div>
          </div>
        </div>
      `;
    }

    // Direcciones vendidas
    const soldTable = document.getElementById('dir-vendidas');
    if (soldTable) {
      let tbody = state.sold.map((s, i) => `<tr>
        <td>${fmtDateEU(s.date)}</td>
        <td>${s.addr}</td>
        <td class="num">${fmt(s.val)}</td>
        <td class="num" style="width:70px"><span class="fb-row-actions">
          <button class="fb-btn fb-btn-sm" onclick="App.editSold(${i})">editar</button>
          <button class="fb-btn fb-btn-sm fb-btn-danger" onclick="App.delSold(${i})">×</button>
        </span></td>
      </tr>`).join('');
      if (state.editingAddress && state.editingAddress.type === 'sold' && state.editingAddress.index === -1) {
        tbody += renderAddressEditRow('sold', -1, { date: '', addr: '', val: 0 });
      }
      soldTable.innerHTML = `<thead><tr><th>fecha</th><th>dirección</th><th class="num">valor</th><th></th></tr></thead><tbody>${tbody}</tbody>`;
    }

    // Direcciones alquiladas
    const rentTable = document.getElementById('dir-alquiladas');
    if (rentTable) {
      let tbody = state.rent.map((r, i) => `<tr>
        <td>${fmtDateEU(r.date)}</td>
        <td>${r.addr}</td>
        <td class="num">${fmt(r.contract)}</td>
        <td class="num">${fmt(r.val)}</td>
        <td class="num" style="width:70px"><span class="fb-row-actions">
          <button class="fb-btn fb-btn-sm" onclick="App.editRent(${i})">editar</button>
          <button class="fb-btn fb-btn-sm fb-btn-danger" onclick="App.delRent(${i})">×</button>
        </span></td>
      </tr>`).join('');
      if (state.editingAddress && state.editingAddress.type === 'rent' && state.editingAddress.index === -1) {
        tbody += renderAddressEditRow('rent', -1, { date: '', addr: '', contract: 0, val: 0 });
      }
      rentTable.innerHTML = `<thead><tr><th>fecha</th><th>dirección</th><th class="num">contrato</th><th class="num">valor</th><th></th></tr></thead><tbody>${tbody}</tbody>`;
    }
  }

  function renderAddressEditRow(type, index, data) {
    const isRent = type === 'rent';
    const dateVal = data.date ? fmtDateEU(data.date) : '';
    return `<tr class="fb-edit-row">
      <td><input class="fb-input" id="addr-date-${type}-${index}" type="text" value="${dateVal}" placeholder="DD-MM-AAAA" style="min-width:110px"></td>
      <td><input class="fb-input" id="addr-addr-${type}-${index}" type="text" value="${data.addr}" placeholder="dirección"></td>
      ${isRent ? `<td><input class="fb-input" id="addr-contract-${type}-${index}" type="number" step="0.01" value="${data.contract}" style="width:80px;text-align:right"></td>` : ''}
      <td><input class="fb-input" id="addr-val-${type}-${index}" type="number" step="0.01" value="${data.val}" style="width:90px;text-align:right"></td>
      <td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveAddress('${type}',${index})">guardar</button> <button class="fb-btn fb-btn-sm" onclick="App.cancelAddrEdit()">cancelar</button></td>
    </tr>`;
  }

  // ===== LISTAS =====
  function renderListas() {
    const comTable = document.getElementById('comisiones-table');
    if (comTable) {
      let tbody = state.comisiones.map((c, i) => `<tr>
        <td class="num">${fmt(c.sin)}</td>
        <td class="num">${fmt(c.con)}</td>
        <td class="num" style="width:70px"><span class="fb-row-actions">
          <button class="fb-btn fb-btn-sm" onclick="App.editComision(${i})">editar</button>
          <button class="fb-btn fb-btn-sm fb-btn-danger" onclick="App.delComision(${i})">×</button>
        </span></td>
      </tr>`).join('');
      if (state.editingOp && state.editingOp._type === 'comision' && state.editingOp.index === -1) {
        tbody += `<tr class="fb-edit-row"><td><input class="fb-input" id="com-sin--1" type="number" step="0.01" value="0" style="text-align:right"></td><td><input class="fb-input" id="com-con--1" type="number" step="0.01" value="0" style="text-align:right"></td><td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveComision(-1)">guardar</button> <button class="fb-btn fb-btn-sm" onclick="App.cancelEdit()">cancelar</button></td></tr>`;
      }
      comTable.innerHTML = `<thead><tr><th class="num">sin iva</th><th class="num">con iva</th><th></th></tr></thead><tbody>${tbody}</tbody>`;
    }

    const coefTable = document.getElementById('coef-table');
    if (coefTable) {
      let tbody = state.coefs.map((c, i) => `<tr>
        <td>${c.type.toLowerCase()}</td>
        <td class="num">${c.coef}</td>
        <td style="text-transform:capitalize">${c.month}</td>
        <td class="num" style="width:70px"><span class="fb-row-actions">
          <button class="fb-btn fb-btn-sm" onclick="App.editCoef(${i})">editar</button>
          <button class="fb-btn fb-btn-sm fb-btn-danger" onclick="App.delCoef(${i})">×</button>
        </span></td>
      </tr>`).join('');
      coefTable.innerHTML = `<thead><tr><th>tipo</th><th class="num">coef</th><th>mes</th><th></th></tr></thead><tbody>${tbody}</tbody>`;
    }
  }

  // ===== CONFIG =====
  function renderConfig() {
    const form = document.getElementById('config-form');
    if (!form) return;
    form.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="fb-form-group"><label class="fb-form-label">objetivo pisos vendidos</label><input class="fb-input" type="number" id="cfg-pisos" value="${state.goals.pisos}"></div>
        <div class="fb-form-group"><label class="fb-form-label">objetivo locales vendidos</label><input class="fb-input" type="number" id="cfg-locales" value="${state.goals.locales}"></div>
        <div class="fb-form-group"><label class="fb-form-label">objetivo alquileres</label><input class="fb-input" type="number" id="cfg-alq" value="${state.goals.alquileres}"></div>
        <div class="fb-form-group"><label class="fb-form-label">objetivo ingresos anual</label><input class="fb-input" type="number" id="cfg-ing" value="${state.goals.ingresos}"></div>
        <div class="fb-form-group"><label class="fb-form-label">mínimo trimestral para bono</label><input class="fb-input" type="number" id="cfg-trim" value="${state.goals.trimestre}"></div>
        <div class="fb-form-group"><label class="fb-form-label">valor estimado por piso</label><input class="fb-input" type="number" id="cfg-pval" value="${state.goals.pisoValor}"></div>
        <div class="fb-flex fb-gap-sm fb-mt-sm">
          <button class="fb-btn fb-btn-primary" onclick="App.saveConfig()">guardar objetivos</button>
          <button class="fb-btn" onclick="App.exportExcel()">exportar a excel</button>
        </div>
      </div>
    `;
  }

  // ===== GRÁFICOS =====
  function renderGraficos() {
    const esc = getEscrituraByMonth();
    const meses = MONTHS_ESCRITURA;

    // Acumulado vs objetivo
    const actualCumul = [];
    const targetCumul = [];
    let acc = 0;
    const monthlyTarget = state.goals.ingresos / 12;
    meses.forEach((m, i) => {
      acc += esc[m] || 0;
      actualCumul.push(acc);
      targetCumul.push(monthlyTarget * (i + 1));
    });

    renderLineChart('chart-line', actualCumul, targetCumul, meses.map(m => m.slice(0, 3)));

    // Donut por tipo
    const t = getTotals();
    renderDonut('chart-donut', [t.pisos, t.locales, t.alquileres], ['pisos', 'locales', 'alquileres']);

    // Bar chart escritura
    const escValues = meses.map(m => esc[m] || 0);
    renderBarChart('chart-escritura', escValues, meses.map(m => m.slice(0, 3)), ['var(--kimi-chart-2)']);
  }

  // ===== GRÁFICOS SVG NATIVOS =====
  function renderBarChart(containerId, data, labels, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const max = Math.max(...data, 1);
    const barColor = colors?.[0] || 'var(--kimi-chart-1, #2563eb)';
    let html = '<div class="fb-bar-chart">';
    data.forEach((v, i) => {
      const h = (v / max) * 160;
      html += `<div class="fb-bar-group">
        <div class="fb-bar-value">${v > 0 ? fmt(v) : ''}</div>
        <div class="fb-bar" style="height:${h}px;background:${barColor};opacity:${v > 0 ? 1 : 0.15};"></div>
        <div class="fb-bar-label">${labels[i] || ''}</div>
      </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function renderLineChart(containerId, actualData, targetData, labels) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const w = container.clientWidth || 600;
    const h = 200;
    const pad = { top: 10, right: 10, bottom: 30, left: 60 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;
    const maxVal = Math.max(...actualData, ...targetData, 1);
    const n = actualData.length;
    const x = (i) => pad.left + (i / (n - 1)) * cw;
    const y = (v) => pad.top + ch - (v / maxVal) * ch;

    let actualPath = `M ${x(0)} ${y(actualData[0])}`;
    for (let i = 1; i < n; i++) actualPath += ` L ${x(i)} ${y(actualData[i])}`;
    let targetPath = `M ${x(0)} ${y(targetData[0])}`;
    for (let i = 1; i < n; i++) targetPath += ` L ${x(i)} ${y(targetData[i])}`;
    let areaPath = actualPath + ` L ${x(n-1)} ${pad.top + ch} L ${x(0)} ${pad.top + ch} Z`;

    let gridLines = '';
    for (let i = 0; i <= 5; i++) {
      const gv = (maxVal / 5) * i;
      const gy = y(gv);
      gridLines += `<line x1="${pad.left}" y1="${gy}" x2="${w - pad.right}" y2="${gy}" class="grid-line"/>`;
      gridLines += `<text x="${pad.left - 8}" y="${gy + 3}" text-anchor="end" class="axis-text">${fmt(gv)}</text>`;
    }

    let xLabels = '';
    const step = Math.ceil(n / 12);
    for (let i = 0; i < n; i += step) {
      xLabels += `<text x="${x(i)}" y="${h - 8}" text-anchor="middle" class="axis-text">${labels[i] || ''}</text>`;
    }

    let dots = '';
    actualData.forEach((v, i) => {
      dots += `<circle cx="${x(i)}" cy="${y(v)}" class="dot"/>`;
    });

    container.innerHTML = `<div class="fb-line-chart"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${gridLines}<path d="${areaPath}" class="area-actual"/><path d="${targetPath}" class="line-target"/><path d="${actualPath}" class="line-actual"/>${dots}${xLabels}</svg></div>`;
  }

  function renderDonut(containerId, values, labels) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0) { container.innerHTML = '<div class="fb-muted fb-center" style="padding:40px">sin datos</div>'; return; }
    const size = 160, cx = size / 2, cy = size / 2, r = 60, innerR = 38;
    let startAngle = -Math.PI / 2;
    let paths = '', legend = '';
    const chartColors = ['var(--kimi-chart-1)', 'var(--kimi-chart-2)', 'var(--kimi-chart-3)'];
    values.forEach((v, i) => {
      const angle = (v / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
      const x3 = cx + innerR * Math.cos(endAngle), y3 = cy + innerR * Math.sin(endAngle);
      const x4 = cx + innerR * Math.cos(startAngle), y4 = cy + innerR * Math.sin(startAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const color = chartColors[i] || `var(--kimi-chart-${(i % 5) + 1})`;
      paths += `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z" fill="${color}" stroke="var(--kimi-color-bg-primary)" stroke-width="2"/>`;
      legend += `<div style="display:flex;align-items:center;gap:6px;font-size:12px;"><div style="width:8px;height:8px;border-radius:50%;background:${color};"></div><span>${labels[i]}: ${fmt0(v)}</span></div>`;
      startAngle = endAngle;
    });
    container.innerHTML = `<div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;justify-content:center;"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${paths}<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="14" font-weight="500" fill="var(--kimi-color-text-primary)">${fmt0(total)}</text><text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="10" fill="var(--kimi-color-text-secondary)">total</text></svg><div style="display:flex;flex-direction:column;gap:6px;">${legend}</div></div>`;
  }

  // ===== ACCIONES: OPERACIONES =====
  window.App = window.App || {};

  App.newOp = function() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    let monthIndex;
    if (currentYear === 2025) { monthIndex = currentMonth - 10; }
    else { monthIndex = currentMonth + 2; }
    if (monthIndex < 0) monthIndex = 0;
    if (monthIndex > 13) monthIndex = 13;

    state.editingOp = {
      id: 0,
      month: monthIndex,
      type: 'VENTA PISO',
      qty: 1,
      honorarios: 0,
      escritura: MONTHS_ESCRITURA[currentMonth] || 'enero',
      pct: 1
    };
    switchTab('operaciones');
    setTimeout(() => {
      renderOperaciones();
      const headers = document.querySelectorAll('.fb-month-header');
      for (const h of headers) {
        if (parseInt(h.dataset.month) === monthIndex) {
          h.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }, 50);
  };

  App.editOp = function(id) {
    const op = state.ops.find(o => o.id === id);
    if (op) {
      state.editingOp = JSON.parse(JSON.stringify(op));
      renderOperaciones();
    }
  };

  App.delOp = function(id) {
    if (confirm('¿eliminar esta operación?')) {
      state.ops = state.ops.filter(o => o.id !== id);
      saveState();
      renderAll();
      showToast('operación eliminada');
    }
  };

  App.saveOp = function(id) {
    const typeEl = document.getElementById('op-type-' + id);
    const qtyEl = document.getElementById('op-qty-' + id);
    const honEl = document.getElementById('op-hon-' + id);
    const escEl = document.getElementById('op-esc-' + id);
    const pctEl = document.getElementById('op-pct-' + id);

    if (!typeEl || !qtyEl || !honEl || !escEl || !pctEl) {
      showToast('error: no se encontraron los campos');
      return;
    }

    const type = typeEl.value;
    const qty = parseFloat(qtyEl.value) || 0;
    const honorarios = parseFloat(honEl.value) || 0;
    const escritura = escEl.value;
    const pct = parseFloat(pctEl.value) || 0;

    if (id === 0) {
      state.ops.push({
        id: state.nextId++,
        month: state.editingOp.month,
        type: type,
        qty: qty,
        honorarios: honorarios,
        escritura: escritura,
        pct: pct
      });
    } else {
      const op = state.ops.find(o => o.id === id);
      if (op) {
        op.type = type;
        op.qty = qty;
        op.honorarios = honorarios;
        op.escritura = escritura;
        op.pct = pct;
      }
    }
    state.editingOp = null;
    saveState();
    renderAll();
    showToast('operación guardada');
  };

  App.cancelEdit = function() {
    state.editingOp = null;
    state.editingAddress = null;
    renderOperaciones();
    renderResumen();
    renderListas();
  };

  // ===== ACCIONES: DIRECCIONES =====
  App.newSold = function() {
    state.editingAddress = { type: 'sold', index: -1 };
    renderResumen();
  };

  App.newRent = function() {
    state.editingAddress = { type: 'rent', index: -1 };
    renderResumen();
  };

  App.editSold = function(index) {
    state.editingAddress = { type: 'sold', index: index };
    renderResumen();
  };

  App.editRent = function(index) {
    state.editingAddress = { type: 'rent', index: index };
    renderResumen();
  };

  App.delSold = function(index) {
    if (confirm('¿eliminar esta dirección?')) {
      state.sold.splice(index, 1);
      saveState();
      renderAll();
      showToast('dirección eliminada');
    }
  };

  App.delRent = function(index) {
    if (confirm('¿eliminar esta dirección?')) {
      state.rent.splice(index, 1);
      saveState();
      renderAll();
      showToast('dirección eliminada');
    }
  };

  App.saveAddress = function(type, index) {
    const dateEl = document.getElementById('addr-date-' + type + '-' + index);
    const addrEl = document.getElementById('addr-addr-' + type + '-' + index);
    const valEl = document.getElementById('addr-val-' + type + '-' + index);

    if (!dateEl || !addrEl || !valEl) {
      showToast('error: campos no encontrados');
      return;
    }

    const dateEU = dateEl.value;
    const dateISO = parseDateEU(dateEU);
    const addr = addrEl.value;
    const val = parseFloat(valEl.value) || 0;

    const item = { date: dateISO || dateEU, addr: addr, val: val };
    if (type === 'rent') {
      const contractEl = document.getElementById('addr-contract-' + type + '-' + index);
      item.contract = contractEl ? (parseFloat(contractEl.value) || 0) : 0;
    }

    if (index === -1) {
      state[type === 'sold' ? 'sold' : 'rent'].push(item);
    } else {
      state[type === 'sold' ? 'sold' : 'rent'][index] = item;
    }

    state.editingAddress = null;
    saveState();
    renderAll();
    showToast('dirección guardada');
  };

  App.cancelAddrEdit = function() {
    state.editingAddress = null;
    renderResumen();
  };

  // ===== ACCIONES: LISTAS =====
  App.newComision = function() {
    state.editingOp = { _type: 'comision', index: -1 };
    renderListas();
  };

  App.editComision = function(index) {
    state.editingOp = { _type: 'comision', index: index };
    renderListas();
  };

  App.delComision = function(index) {
    if (confirm('¿eliminar esta fila?')) {
      state.comisiones.splice(index, 1);
      saveState();
      renderListas();
      showToast('comisión eliminada');
    }
  };

  App.saveComision = function(index) {
    const sinEl = document.getElementById('com-sin-' + index);
    const conEl = document.getElementById('com-con-' + index);
    if (!sinEl || !conEl) { showToast('error'); return; }
    const sin = parseFloat(sinEl.value) || 0;
    const con = parseFloat(conEl.value) || 0;
    if (index === -1) {
      state.comisiones.push({ sin: sin, con: con });
    } else {
      state.comisiones[index] = { sin: sin, con: con };
    }
    state.editingOp = null;
    saveState();
    renderListas();
    showToast('comisión guardada');
  };

  App.editCoef = function(index) {
    const c = state.coefs[index];
    const newCoef = prompt('nuevo coeficiente para ' + c.type.toLowerCase() + ':', c.coef);
    if (newCoef !== null && !isNaN(parseFloat(newCoef))) {
      c.coef = parseFloat(newCoef);
      saveState();
      renderListas();
      showToast('coeficiente actualizado');
    }
  };

  App.delCoef = function(index) {
    if (confirm('¿eliminar este coeficiente?')) {
      state.coefs.splice(index, 1);
      saveState();
      renderListas();
      showToast('coeficiente eliminado');
    }
  };

  // ===== CONFIG =====
  App.saveConfig = function() {
    state.goals.pisos = parseFloat(document.getElementById('cfg-pisos').value) || 0;
    state.goals.locales = parseFloat(document.getElementById('cfg-locales').value) || 0;
    state.goals.alquileres = parseFloat(document.getElementById('cfg-alq').value) || 0;
    state.goals.ingresos = parseFloat(document.getElementById('cfg-ing').value) || 0;
    state.goals.trimestre = parseFloat(document.getElementById('cfg-trim').value) || 0;
    state.goals.pisoValor = parseFloat(document.getElementById('cfg-pval').value) || 0;
    saveState();
    renderAll();
    showToast('objetivos guardados');
  };

  // ===== EXPORTAR A CSV =====
  App.exportExcel = function() {
    const t = getTotals();
    const esc = getEscrituraByMonth();
    const trimData = getTrimestreData(esc);
    const pys = getPysByMonth();

    let csv = '﻿';
    csv += 'FINCAS BLANCO ' + state.year + '

';
    csv += 'INGRESOS POR PYS
';
    csv += 'Mes,Importe
';
    MONTHS.forEach((m, i) => { csv += m + ',' + fmt(pys[i]).replace(' €', '') + '
'; });
    csv += 'TOTAL,' + fmt(t.total).replace(' €', '') + '

';

    csv += 'INGRESOS POR ESCRITURA
';
    csv += 'Mes,Importe
';
    MONTHS_ESCRITURA.forEach(m => { csv += m + ',' + fmt(esc[m] || 0).replace(' €', '') + '
'; });
    csv += 'TOTAL,' + fmt(Object.values(esc).reduce((a, b) => a + b, 0)).replace(' €', '') + '

';

    csv += 'FALTA PARA BONO (TRIMESTRAL)
';
    csv += 'Trimestre,Ingresos,Falta,Pisos
';
    trimData.forEach(td => {
      csv += td.trimestre + 'º,' + fmt(td.ingresos).replace(' €', '') + ',' + fmt(td.falta).replace(' €', '') + ',' + fmt(td.pisos).replace(' €', '') + '
';
    });
    csv += '
';

    csv += 'RESUMEN DE OBJETIVOS
';
    csv += 'Concepto,Real,Objetivo
';
    csv += 'Pisos vendidos,' + t.pisos + ',' + state.goals.pisos + '
';
    csv += 'Locales vendidos,' + t.locales + ',' + state.goals.locales + '
';
    csv += 'Alquileres,' + t.alquileres + ',' + state.goals.alquileres + '
';
    csv += 'Ingresos totales,' + fmt(t.total).replace(' €', '') + ',' + fmt(state.goals.ingresos).replace(' €', '') + '

';

    csv += 'OPERACIONES
';
    csv += 'Mes,Tipo,Cantidad,Honorarios,Escritura,%,Sin IVA
';
    state.ops.forEach(op => {
      csv += getMonthLabel(op.month) + ',' + op.type + ',' + op.qty + ',' + op.honorarios + ',' + op.escritura + ',' + op.pct + ',' + fmt(calcSinIva(op)).replace(' €', '') + '
';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fincas_blanco_' + state.year + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('archivo csv exportado');
  };

  // ===== MODAL AÑO =====
  function showYearModal() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];
    content.innerHTML = `
      <div class="fb-modal-header">
        <div class="fb-modal-title">seleccionar año</div>
        <button class="fb-btn fb-btn-icon" onclick="App.closeModal()">✕</button>
      </div>
      <div class="fb-year-grid">
        ${years.map(y => `<div class="fb-year-option ${y === state.year ? 'active' : ''}" onclick="App.selectYear(${y})">${y}</div>`).join('')}
      </div>
    `;
    overlay.classList.add('show');
  }

  App.selectYear = function(year) {
    saveState();
    loadYear(year);
    renderAll();
    closeModal();
    showToast('año cambiado a ' + year);
  };

  App.closeModal = function() {
    closeModal();
  };

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('show');
  }

  // ===== TOAST =====
  function showToast(msg) {
    const toast = document.getElementById('fb-toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', init);
})();
