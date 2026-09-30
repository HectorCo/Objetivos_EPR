// Fincas Blanco - Aplicación principal (v5 - sin listas, resumen auto desde operaciones)
(function () {
  'use strict';

  // ===== ESTADO =====
  const state = {
    year: 2026,
    ops: [],
    // Mapa de direcciones asociadas a operaciones: { [opId]: { addr, date, contract, val } }
    opAddresses: {},
    goals: {},
    editingOp: null,
    editingAddressOpId: null,   // id de la operación cuya dirección se está editando
    nextId: 1,
    activeTab: 'dashboard'
  };

  // ===== PERSISTENCIA =====
  function buildDefaultData(year) {
    if (year === 2026) {
      return {
        ops: JSON.parse(JSON.stringify(FB.DEFAULT_OPS)),
        opAddresses: {},
        goals: Object.assign({}, FB.DEFAULT_GOALS),
        nextId: 31
      };
    }
    return {
      ops: [],
      opAddresses: {},
      goals: Object.assign({}, FB.DEFAULT_GOALS),
      nextId: 1
    };
  }

  function loadYear(year) {
    state.year = year;
    const data = FB.load(year);
    if (data) {
      state.ops = data.ops || [];
      state.opAddresses = data.opAddresses || {};
      state.goals = data.goals || Object.assign({}, FB.DEFAULT_GOALS);
      state.nextId = data.nextId || 1;
      // Compatibilidad con versiones antiguas que guardaban sold/rent por separado
      if (data.sold && !Object.keys(state.opAddresses).length) {
        // migración suave: se ignoran, el usuario las reintroducirá vinculadas a operaciones
      }
    } else {
      const def = buildDefaultData(year);
      Object.assign(state, def);
    }
  }

  function saveState() {
    FB.save(state.year, {
      ops: state.ops,
      opAddresses: state.opAddresses,
      goals: state.goals,
      nextId: state.nextId
    });
  }

  // ===== INICIALIZACIÓN =====
  function init() {
    loadYear(2026);
    bindEvents();
    updateYearDisplay();
    renderDashboard();
    renderOperaciones();
    renderResumen();
    renderConfig();
    setupServiceWorker();
  }

  function bindEvents() {
    document.querySelectorAll('.fb-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    const yearEl = document.getElementById('year-display');
    if (yearEl) yearEl.addEventListener('click', showYearModal);

    const btnExport = document.getElementById('btn-export');
    if (btnExport) btnExport.addEventListener('click', () => { FB.exportJSON(); showToast('backup exportado'); });

    const btnImport = document.getElementById('btn-import');
    if (btnImport) btnImport.addEventListener('click', () => {
      const f = document.getElementById('import-file');
      if (f) f.click();
    });

    const importFile = document.getElementById('import-file');
    if (importFile) importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      FB.importJSON(file, (err) => {
        if (err) { showToast('error al importar'); return; }
        loadYear(state.year);
        renderAll();
        showToast('backup importado');
      });
      e.target.value = '';
    });

    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') closeModal();
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.fb-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    document.querySelectorAll('.fb-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tabName));
    if (tabName === 'dashboard') setTimeout(renderDashboard, 0);
    if (tabName === 'graficos') setTimeout(renderGraficos, 0);
    if (tabName === 'resumen') setTimeout(renderResumen, 0);
  }

  function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  function renderAll() {
    renderDashboard();
    renderOperaciones();
    renderResumen();
    renderConfig();
    if (state.activeTab === 'graficos') renderGraficos();
    updateYearDisplay();
  }

  function updateYearDisplay() {
    const el = document.getElementById('year-display');
    if (el) el.textContent = state.year;
  }

  // ===== DASHBOARD =====
  function renderDashboard() {
    const t = FB.getTotals(state.ops);
    const esc = FB.getEscrituraByMonth(state.ops);
    const trimData = FB.getTrimestreData(esc, state.goals.trimestre, state.goals.pisoValor);
    const pys = FB.getPysByMonth(state.ops);

    const kpiContainer = document.getElementById('kpi-cards');
    if (kpiContainer) {
      const pctPisos = state.goals.pisos ? Math.min(100, t.pisos / state.goals.pisos * 100) : 0;
      const pctLocales = state.goals.locales ? Math.min(100, t.locales / state.goals.locales * 100) : 0;
      const pctAlq = state.goals.alquileres ? Math.min(100, t.alquileres / state.goals.alquileres * 100) : 0;
      const pctIng = state.goals.ingresos ? Math.min(100, t.total / state.goals.ingresos * 100) : 0;

      kpiContainer.innerHTML =
        '<div class="fb-card">'
        + '<div class="fb-metric-label">pisos vendidos</div>'
        + '<div class="fb-metric-value">' + FB.fmt0(t.pisos) + '<span class="fb-metric-suffix">/ ' + FB.fmt0(state.goals.pisos) + '</span></div>'
        + '<div class="fb-progress"><div class="fb-progress-fill" style="width:' + pctPisos + '%;background:var(--kimi-chart-1)"></div></div>'
        + '</div>'
        + '<div class="fb-card">'
        + '<div class="fb-metric-label">locales vendidos</div>'
        + '<div class="fb-metric-value">' + FB.fmt0(t.locales) + '<span class="fb-metric-suffix">/ ' + FB.fmt0(state.goals.locales) + '</span></div>'
        + '<div class="fb-progress"><div class="fb-progress-fill" style="width:' + pctLocales + '%;background:var(--kimi-chart-2)"></div></div>'
        + '</div>'
        + '<div class="fb-card">'
        + '<div class="fb-metric-label">alquileres</div>'
        + '<div class="fb-metric-value">' + FB.fmt0(t.alquileres) + '<span class="fb-metric-suffix">/ ' + FB.fmt0(state.goals.alquileres) + '</span></div>'
        + '<div class="fb-progress"><div class="fb-progress-fill" style="width:' + pctAlq + '%;background:var(--kimi-chart-3)"></div></div>'
        + '</div>'
        + '<div class="fb-card">'
        + '<div class="fb-metric-label">ingresos totales</div>'
        + '<div class="fb-metric-value">' + FB.fmt(t.total) + '<span class="fb-metric-suffix">/ ' + FB.fmt(state.goals.ingresos) + '</span></div>'
        + '<div class="fb-progress"><div class="fb-progress-fill" style="width:' + pctIng + '%"></div></div>'
        + '</div>';
    }

    FBCharts.renderBarChart('pys-chart', pys, FB.MONTHS_SHORT);

    const escTable = document.getElementById('escritura-table');
    if (escTable) {
      let tbody = '';
      FB.MONTHS_ESCRITURA.forEach((m, i) => {
        const v = esc[m] || 0;
        const trimIdx = Math.floor(i / 3);
        const isTrimEnd = (i + 1) % 3 === 0;
        tbody += '<tr><td style="text-transform:capitalize">' + m + '</td><td class="num">' + FB.fmt(v) + '</td></tr>';
        if (isTrimEnd && trimData[trimIdx]) {
          const td = trimData[trimIdx];
          tbody += '<tr style="background:color-mix(in srgb,var(--kimi-color-bg-hover) 40%,transparent)">'
                 + '<td colspan="2" style="text-align:right;font-size:12px;color:var(--kimi-color-text-secondary);padding:6px 10px">'
                 + td.trimestre + 'º trimestre: falta <span class="' + (td.falta < 0 ? 'fb-negative' : 'fb-positive') + '">' + FB.fmt(td.falta) + '</span> · ' + FB.fmt(td.pisos) + ' pisos'
                 + '</td></tr>';
        }
      });
      escTable.innerHTML = '<thead><tr><th>mes</th><th class="num">importe</th></tr></thead><tbody>' + tbody + '</tbody>';
    }

    const bonoTable = document.getElementById('bono-table');
    if (bonoTable) {
      let tbody = '';
      trimData.forEach(td => {
        tbody += '<tr>'
              + '<td>' + td.trimestre + 'º</td>'
              + '<td class="num">' + FB.fmt(td.ingresos) + '</td>'
              + '<td class="num ' + (td.falta < 0 ? 'fb-negative' : 'fb-positive') + '">' + FB.fmt(td.falta) + '</td>'
              + '<td class="num">' + FB.fmt(td.pisos) + '</td>'
              + '</tr>';
      });
      bonoTable.innerHTML = '<thead><tr><th>trimestre</th><th class="num">ingresos</th><th class="num">falta</th><th class="num">pisos</th></tr></thead><tbody>' + tbody + '</tbody>';
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

      html += '<div class="fb-month-header" data-month="' + m + '">' + FB.getMonthLabel(m) + '</div>';
      html += '<div class="fb-table-wrap"><table class="fb-table"><thead><tr>'
            + '<th>tipo</th><th class="center">cant</th><th class="num">honorarios</th>'
            + '<th>escritura</th><th class="num">%</th><th class="num">sin iva</th><th></th>'
            + '</tr></thead><tbody>';

      ops.forEach(op => {
        if (state.editingOp && state.editingOp.id === op.id) {
          html += renderOpEditRow(op);
        } else {
          html += renderOpRow(op);
        }
      });

      if (isEditingNew) html += renderOpEditRow(state.editingOp);

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

    return '<tr>'
      + '<td><span class="fb-badge ' + badgeClass + '">' + (FB.TYPE_LABELS[op.type] || op.type.toLowerCase()) + '</span></td>'
      + '<td class="center">' + FB.fmt0(op.qty) + '</td>'
      + '<td class="num">' + FB.fmt(op.honorarios) + '</td>'
      + '<td style="text-transform:capitalize">' + op.escritura + '</td>'
      + '<td class="num">' + FB.fmtPct(op.pct) + '</td>'
      + '<td class="num" style="font-weight:500">' + FB.fmt(FB.calcSinIva(op)) + '</td>'
      + '<td class="num" style="width:90px"><span class="fb-row-actions">'
      + '<button class="fb-btn fb-btn-sm" onclick="App.editOp(' + op.id + ')">editar</button>'
      + '<button class="fb-btn fb-btn-sm fb-btn-danger" onclick="App.delOp(' + op.id + ')">×</button>'
      + '</span></td></tr>';
  }

  function renderOpEditRow(op) {
    const typeOpts = FB.TYPES.map(t => '<option value="' + t + '"' + (op.type === t ? ' selected' : '') + '>' + FB.TYPE_LABELS[t] + '</option>').join('');
    const escOpts = FB.MONTHS_ESCRITURA.map(m => '<option value="' + m + '"' + (op.escritura === m ? ' selected' : '') + '>' + m + '</option>').join('');

    return '<tr class="fb-edit-row">'
      + '<td><select class="fb-select" id="op-type-' + op.id + '" style="min-width:110px">' + typeOpts + '</select></td>'
      + '<td><input class="fb-input" id="op-qty-' + op.id + '" type="number" value="' + op.qty + '" style="width:55px;text-align:center"></td>'
      + '<td><input class="fb-input" id="op-hon-' + op.id + '" type="number" step="0.01" value="' + op.honorarios + '" style="width:90px;text-align:right"></td>'
      + '<td><select class="fb-select" id="op-esc-' + op.id + '" style="min-width:95px">' + escOpts + '</select></td>'
      + '<td><input class="fb-input" id="op-pct-' + op.id + '" type="number" step="0.05" value="' + op.pct + '" style="width:55px;text-align:right"></td>'
      + '<td class="num" style="color:var(--kimi-color-text-secondary)">' + FB.fmt(FB.calcSinIva(op)) + '</td>'
      + '<td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveOp(' + op.id + ')">guardar</button> '
      + '<button class="fb-btn fb-btn-sm" onclick="App.cancelEdit()">cancelar</button></td>'
      + '</tr>';
  }

  // ===== RESUMEN =====
  function renderResumen() {
    const t = FB.getTotals(state.ops);
    const cumpl = state.goals.ingresos ? (t.total / state.goals.ingresos) : 0;

    const kpiContainer = document.getElementById('resumen-kpis');
    if (kpiContainer) {
      const pctP = state.goals.pisos ? Math.min(100, t.pisos / state.goals.pisos * 100) : 0;
      const pctL = state.goals.locales ? Math.min(100, t.locales / state.goals.locales * 100) : 0;
      const pctA = state.goals.alquileres ? Math.min(100, t.alquileres / state.goals.alquileres * 100) : 0;

      kpiContainer.innerHTML =
        '<div class="fb-card">'
        + '<div class="fb-card-title">cumplimiento de objetivos</div>'
        + '<div class="fb-metric-value" style="font-size:42px;margin:8px 0">' + (cumpl * 100).toFixed(1) + '%</div>'
        + '<div class="fb-progress"><div class="fb-progress-fill" style="width:' + Math.min(100, cumpl * 100) + '%"></div></div>'
        + '<div class="fb-small fb-mt-sm">real: ' + FB.fmt(t.total) + ' · objetivo: ' + FB.fmt(state.goals.ingresos) + '</div>'
        + '</div>'
        + '<div class="fb-card">'
        + '<div class="fb-card-title">desglose por tipo</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">'
        + '<div class="fb-flex fb-flex-between"><span class="fb-small">pisos vendidos</span><span>' + FB.fmt0(t.pisos) + ' / ' + FB.fmt0(state.goals.pisos) + '</span></div>'
        + '<div class="fb-progress"><div class="fb-progress-fill" style="width:' + pctP + '%;background:var(--kimi-chart-1)"></div></div>'
        + '<div class="fb-flex fb-flex-between"><span class="fb-small">locales vendidos</span><span>' + FB.fmt0(t.locales) + ' / ' + FB.fmt0(state.goals.locales) + '</span></div>'
        + '<div class="fb-progress"><div class="fb-progress-fill" style="width:' + pctL + '%;background:var(--kimi-chart-2)"></div></div>'
        + '<div class="fb-flex fb-flex-between"><span class="fb-small">alquileres</span><span>' + FB.fmt0(t.alquileres) + ' / ' + FB.fmt0(state.goals.alquileres) + '</span></div>'
        + '<div class="fb-progress"><div class="fb-progress-fill" style="width:' + pctA + '%;background:var(--kimi-chart-3)"></div></div>'
        + '</div></div>';
    }

    // Tabla de inmuebles vendidos (derivada de operaciones VENTA)
    const soldTable = document.getElementById('dir-vendidas');
    if (soldTable) {
      const ventas = state.ops.filter(o => o.type === 'VENTA PISO' || o.type === 'VENTA LOCAL' || o.type === 'VENTA PARKING');
      let tbody = '';
      if (ventas.length === 0) {
        tbody = '<tr><td colspan="5" class="fb-muted fb-center" style="padding:24px">sin operaciones de venta. añádelas en la pestaña "operaciones".</td></tr>';
      } else {
        ventas.forEach(op => {
          const addrData = state.opAddresses[op.id] || {};
          const isEditing = state.editingAddressOpId === op.id;
          if (isEditing) {
            tbody += renderAddressEditRow(op, addrData);
          } else {
            tbody += renderSoldRow(op, addrData);
          }
        });
      }
      soldTable.innerHTML = '<thead><tr><th>fecha</th><th>dirección</th><th>tipo</th><th class="num">importe</th><th></th></tr></thead><tbody>' + tbody + '</tbody>';
    }

    // Tabla de inmuebles alquilados (derivada de operaciones ALQUILER)
    const rentTable = document.getElementById('dir-alquiladas');
    if (rentTable) {
      const alquileres = state.ops.filter(o => o.type === 'ALQUILER');
      let tbody = '';
      if (alquileres.length === 0) {
        tbody = '<tr><td colspan="5" class="fb-muted fb-center" style="padding:24px">sin operaciones de alquiler. añádelas en la pestaña "operaciones".</td></tr>';
      } else {
        alquileres.forEach(op => {
          const addrData = state.opAddresses[op.id] || {};
          const isEditing = state.editingAddressOpId === op.id;
          if (isEditing) {
            tbody += renderAddressEditRow(op, addrData);
          } else {
            tbody += renderRentRow(op, addrData);
          }
        });
      }
      rentTable.innerHTML = '<thead><tr><th>fecha</th><th>dirección</th><th>tipo</th><th class="num">importe</th><th></th></tr></thead><tbody>' + tbody + '</tbody>';
    }
  }

  function renderSoldRow(op, addrData) {
    const addr = addrData.addr || '<span class="fb-muted">— sin dirección —</span>';
    const date = addrData.date ? FB.fmtDateEU(addrData.date) : '<span class="fb-muted">—</span>';
    const badgeClass = {
      'VENTA PISO': 'fb-badge-piso',
      'VENTA LOCAL': 'fb-badge-local',
      'VENTA PARKING': 'fb-badge-parking'
    }[op.type] || 'fb-badge-piso';
    return '<tr>'
      + '<td>' + date + '</td>'
      + '<td>' + addr + '</td>'
      + '<td><span class="fb-badge ' + badgeClass + '">' + (FB.TYPE_LABELS[op.type] || op.type.toLowerCase()) + '</span></td>'
      + '<td class="num">' + FB.fmt(FB.calcSinIva(op)) + '</td>'
      + '<td class="num" style="width:80px"><span class="fb-row-actions">'
      + '<button class="fb-btn fb-btn-sm" onclick="App.editAddress(' + op.id + ')">editar</button>'
      + '</span></td></tr>';
  }

  function renderRentRow(op, addrData) {
    const addr = addrData.addr || '<span class="fb-muted">— sin dirección —</span>';
    const date = addrData.date ? FB.fmtDateEU(addrData.date) : '<span class="fb-muted">—</span>';
    return '<tr>'
      + '<td>' + date + '</td>'
      + '<td>' + addr + '</td>'
      + '<td><span class="fb-badge fb-badge-alq">alquiler</span></td>'
      + '<td class="num">' + FB.fmt(FB.calcSinIva(op)) + '</td>'
      + '<td class="num" style="width:80px"><span class="fb-row-actions">'
      + '<button class="fb-btn fb-btn-sm" onclick="App.editAddress(' + op.id + ')">editar</button>'
      + '</span></td></tr>';
  }

  function renderAddressEditRow(op, addrData) {
    const dateVal = addrData.date ? FB.fmtDateEU(addrData.date) : '';
    const isRent = op.type === 'ALQUILER';
    return '<tr class="fb-edit-row">'
      + '<td><input class="fb-input" id="addr-date-' + op.id + '" type="text" value="' + dateVal + '" placeholder="DD-MM-AAAA" style="min-width:110px"></td>'
      + '<td><input class="fb-input" id="addr-addr-' + op.id + '" type="text" value="' + (addrData.addr || '') + '" placeholder="dirección"></td>'
      + '<td>' + (FB.TYPE_LABELS[op.type] || op.type.toLowerCase()) + '</td>'
      + '<td class="num">' + FB.fmt(FB.calcSinIva(op)) + '</td>'
      + '<td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveAddress(' + op.id + ')">guardar</button> '
      + '<button class="fb-btn fb-btn-sm" onclick="App.cancelAddrEdit()">cancelar</button></td>'
      + '</tr>';
  }

  // ===== CONFIG =====
  function renderConfig() {
    const form = document.getElementById('config-form');
    if (!form) return;
    form.innerHTML =
      '<div style="display:flex;flex-direction:column;gap:14px">'
      + '<div class="fb-form-group"><label class="fb-form-label">objetivo pisos vendidos</label><input class="fb-input" type="number" id="cfg-pisos" value="' + state.goals.pisos + '"></div>'
      + '<div class="fb-form-group"><label class="fb-form-label">objetivo locales vendidos</label><input class="fb-input" type="number" id="cfg-locales" value="' + state.goals.locales + '"></div>'
      + '<div class="fb-form-group"><label class="fb-form-label">objetivo alquileres</label><input class="fb-input" type="number" id="cfg-alq" value="' + state.goals.alquileres + '"></div>'
      + '<div class="fb-form-group"><label class="fb-form-label">objetivo ingresos anual</label><input class="fb-input" type="number" id="cfg-ing" value="' + state.goals.ingresos + '"></div>'
      + '<div class="fb-form-group"><label class="fb-form-label">mínimo trimestral para bono</label><input class="fb-input" type="number" id="cfg-trim" value="' + state.goals.trimestre + '"></div>'
      + '<div class="fb-form-group"><label class="fb-form-label">valor estimado por piso</label><input class="fb-input" type="number" id="cfg-pval" value="' + state.goals.pisoValor + '"></div>'
      + '<div class="fb-flex fb-gap-sm fb-mt-sm">'
      + '<button class="fb-btn fb-btn-primary" onclick="App.saveConfig()">guardar objetivos</button>'
      + '<button class="fb-btn" onclick="App.exportExcel()">exportar a csv</button>'
      + '</div></div>';
  }

  // ===== GRÁFICOS =====
  function renderGraficos() {
    const esc = FB.getEscrituraByMonth(state.ops);
    const meses = FB.MONTHS_ESCRITURA;

    const actualCumul = [];
    const targetCumul = [];
    let acc = 0;
    const monthlyTarget = state.goals.ingresos / 12;
    meses.forEach((m, i) => {
      acc += esc[m] || 0;
      actualCumul.push(acc);
      targetCumul.push(monthlyTarget * (i + 1));
    });

    FBCharts.renderLineChart('chart-line', actualCumul, targetCumul, meses.map(m => m.slice(0, 3)));

    const t = FB.getTotals(state.ops);
    FBCharts.renderDonut('chart-donut', [t.pisos, t.locales, t.alquileres], ['pisos', 'locales', 'alquileres']);

    const escValues = meses.map(m => esc[m] || 0);
    FBCharts.renderBarChart('chart-escritura', escValues, meses.map(m => m.slice(0, 3)), ['var(--kimi-chart-2)']);
  }

  // ===== ACCIONES =====
  const App = {};

  App.newOp = function () {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    let monthIndex = currentYear === 2025 ? currentMonth - 10 : currentMonth + 2;
    if (monthIndex < 0) monthIndex = 0;
    if (monthIndex > 13) monthIndex = 13;

    state.editingOp = {
      id: 0,
      month: monthIndex,
      type: 'VENTA PISO',
      qty: 1,
      honorarios: 0,
      escritura: FB.MONTHS_ESCRITURA[currentMonth] || 'enero',
      pct: 1
    };
    switchTab('operaciones');
    setTimeout(() => {
      renderOperaciones();
      const headers = document.querySelectorAll('.fb-month-header');
      for (let i = 0; i < headers.length; i++) {
        if (parseInt(headers[i].dataset.month, 10) === monthIndex) {
          headers[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }, 60);
  };

  App.editOp = function (id) {
    const op = state.ops.find(o => o.id === id);
    if (op) {
      state.editingOp = JSON.parse(JSON.stringify(op));
      renderOperaciones();
    }
  };

  App.delOp = function (id) {
    if (confirm('¿eliminar esta operación?')) {
      state.ops = state.ops.filter(o => o.id !== id);
      delete state.opAddresses[id];
      saveState();
      renderAll();
      showToast('operación eliminada');
    }
  };

  App.saveOp = function (id) {
    const typeEl = document.getElementById('op-type-' + id);
    const qtyEl = document.getElementById('op-qty-' + id);
    const honEl = document.getElementById('op-hon-' + id);
    const escEl = document.getElementById('op-esc-' + id);
    const pctEl = document.getElementById('op-pct-' + id);

    if (!typeEl || !qtyEl || !honEl || !escEl || !pctEl) {
      showToast('error: no se encontraron los campos');
      return;
    }

    const payload = {
      type: typeEl.value,
      qty: parseFloat(qtyEl.value) || 0,
      honorarios: parseFloat(honEl.value) || 0,
      escritura: escEl.value,
      pct: parseFloat(pctEl.value) || 0
    };

    if (id === 0) {
      state.ops.push(Object.assign({ id: state.nextId++, month: state.editingOp.month }, payload));
    } else {
      const op = state.ops.find(o => o.id === id);
      if (op) Object.assign(op, payload);
    }
    state.editingOp = null;
    saveState();
    renderAll();
    showToast('operación guardada');
  };

  App.cancelEdit = function () {
    state.editingOp = null;
    renderOperaciones();
  };

  // ===== DIRECCIONES (vinculadas a operaciones) =====
  App.editAddress = function (opId) {
    state.editingAddressOpId = opId;
    renderResumen();
  };

  App.cancelAddrEdit = function () {
    state.editingAddressOpId = null;
    renderResumen();
  };

  App.saveAddress = function (opId) {
    const dateEl = document.getElementById('addr-date-' + opId);
    const addrEl = document.getElementById('addr-addr-' + opId);
    if (!dateEl || !addrEl) { showToast('error: campos no encontrados'); return; }

    const dateISO = FB.parseDateEU(dateEl.value);
    state.opAddresses[opId] = {
      date: dateISO || dateEl.value,
      addr: addrEl.value
    };

    state.editingAddressOpId = null;
    saveState();
    renderAll();
    showToast('dirección guardada');
  };

  // ===== CONFIG =====
  App.saveConfig = function () {
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

  // ===== EXPORTAR CSV =====
  App.exportExcel = function () {
    const t = FB.getTotals(state.ops);
    const esc = FB.getEscrituraByMonth(state.ops);
    const trimData = FB.getTrimestreData(esc, state.goals.trimestre, state.goals.pisoValor);
    const pys = FB.getPysByMonth(state.ops);
    const NL = '\r\n';
    const num = (v) => FB.fmt(v).replace(' €', '').replace(/\./g, '').replace(',', '.');

    const lines = [];
    lines.push('FINCAS BLANCO ' + state.year);
    lines.push('');
    lines.push('INGRESOS POR PYS');
    lines.push('Mes,Importe');
    FB.MONTHS.forEach((m, i) => lines.push(m + ',' + num(pys[i])));
    lines.push('TOTAL,' + num(t.total));
    lines.push('');
    lines.push('INGRESOS POR ESCRITURA');
    lines.push('Mes,Importe');
    FB.MONTHS_ESCRITURA.forEach(m => lines.push(m + ',' + num(esc[m] || 0)));
    lines.push('TOTAL,' + num(Object.keys(esc).reduce((a, k) => a + esc[k], 0)));
    lines.push('');
    lines.push('FALTA PARA BONO (TRIMESTRAL)');
    lines.push('Trimestre,Ingresos,Falta,Pisos');
    trimData.forEach(td => lines.push(td.trimestre + 'º,' + num(td.ingresos) + ',' + num(td.falta) + ',' + td.pisos.toFixed(2)));
    lines.push('');
    lines.push('RESUMEN DE OBJETIVOS');
    lines.push('Concepto,Real,Objetivo');
    lines.push('Pisos vendidos,' + t.pisos + ',' + state.goals.pisos);
    lines.push('Locales vendidos,' + t.locales + ',' + state.goals.locales);
    lines.push('Alquileres,' + t.alquileres + ',' + state.goals.alquileres);
    lines.push('Ingresos totales,' + num(t.total) + ',' + num(state.goals.ingresos));
    lines.push('');
    lines.push('OPERACIONES');
    lines.push('Mes,Tipo,Cantidad,Honorarios,Escritura,%,Sin IVA');
    state.ops.forEach(op => {
      lines.push([
        FB.getMonthLabel(op.month),
        op.type,
        op.qty,
        num(op.honorarios),
        op.escritura,
        op.pct,
        num(FB.calcSinIva(op))
      ].join(','));
    });

    const csv = '\uFEFF' + lines.join(NL) + NL;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fincas_blanco_' + state.year + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('archivo csv exportado');
  };

  // ===== MODAL AÑO =====
  function showYearModal() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];
    content.innerHTML =
      '<div class="fb-modal-header">'
      + '<div class="fb-modal-title">seleccionar año</div>'
      + '<button class="fb-btn fb-btn-icon" onclick="App.closeModal()">✕</button>'
      + '</div>'
      + '<div class="fb-year-grid">'
      + years.map(y => '<div class="fb-year-option ' + (y === state.year ? 'active' : '') + '" onclick="App.selectYear(' + y + ')">' + y + '</div>').join('')
      + '</div>';
    overlay.classList.add('show');
  }

  App.selectYear = function (year) {
    saveState();
    loadYear(year);
    renderAll();
    closeModal();
    showToast('año cambiado a ' + year);
  };

  App.closeModal = function () { closeModal(); };

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  // ===== TOAST =====
  function showToast(msg) {
    const toast = document.getElementById('fb-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  window.App = App;

  // ===== INIT =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
