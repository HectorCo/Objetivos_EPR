// Fincas Blanco 2026 - Aplicación Principal

(function() {
  'use strict';

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

  // ===== INICIALIZACIÓN =====
  function init() {
    loadYear(2026);
    bindEvents();
    renderAll();
    setupServiceWorker();
  }

  function loadYear(year) {
    state.year = year;
    const saved = FB.load(year);
    if (saved) {
      state.ops = saved.ops || [];
      state.sold = saved.sold || [];
      state.rent = saved.rent || [];
      state.goals = saved.goals || { ...FB.DEFAULT_GOALS };
      state.comisiones = saved.comisiones || JSON.parse(JSON.stringify(FB.DEFAULT_COMISIONES));
      state.coefs = saved.coefs || JSON.parse(JSON.stringify(FB.DEFAULT_COEFS));
      state.nextId = saved.nextId || 1;
      state.nextAddrId = saved.nextAddrId || 1;
    } else {
      // Primera vez: cargar datos por defecto solo para 2026
      if (year === 2026) {
        state.ops = JSON.parse(JSON.stringify(FB.getDefaultOps()));
        state.sold = JSON.parse(JSON.stringify(FB.getDefaultSold()));
        state.rent = JSON.parse(JSON.stringify(FB.getDefaultRent()));
      } else {
        state.ops = [];
        state.sold = [];
        state.rent = [];
      }
      state.goals = { ...FB.DEFAULT_GOALS };
      state.comisiones = JSON.parse(JSON.stringify(FB.DEFAULT_COMISIONES));
      state.coefs = JSON.parse(JSON.stringify(FB.DEFAULT_COEFS));
      state.nextId = year === 2026 ? 31 : 1;
      state.nextAddrId = year === 2026 ? 22 : 1;
    }
    updateYearDisplay();
  }

  function saveState() {
    FB.save(state.year, {
      ops: state.ops,
      sold: state.sold,
      rent: state.rent,
      goals: state.goals,
      comisiones: state.comisiones,
      coefs: state.coefs,
      nextId: state.nextId,
      nextAddrId: state.nextAddrId
    });
  }

  function updateYearDisplay() {
    const el = document.getElementById('year-display');
    if (el) el.textContent = state.year;
  }

  // ===== EVENTOS =====
  function bindEvents() {
    // Tabs
    document.querySelectorAll('.fb-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Year selector
    document.getElementById('year-display')?.addEventListener('click', showYearModal);

    // Export/Import
    document.getElementById('btn-export')?.addEventListener('click', () => {
      FB.exportJSON();
      showToast('backup exportado');
    });

    document.getElementById('btn-import')?.addEventListener('click', () => {
      document.getElementById('import-file').click();
    });

    document.getElementById('import-file')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      FB.importJSON(file, (err, data) => {
        if (err) { showToast('error al importar'); return; }
        // Recargar el año actual
        loadYear(state.year);
        renderAll();
        showToast('backup importado correctamente');
      });
      e.target.value = '';
    });

    // Modal close
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') closeModal();
    });

    document.getElementById('modal-close')?.addEventListener('click', closeModal);
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.fb-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    document.querySelectorAll('.fb-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tabName));
    // Re-render para gráficos que necesitan tamaño del contenedor
    if (tabName === 'dashboard') { setTimeout(renderDashboard, 50); }
    if (tabName === 'graficos') { setTimeout(renderGraficos, 50); }
  }

  // ===== RENDER =====
  function renderAll() {
    renderDashboard();
    renderOperaciones();
    renderResumen();
    renderListas();
    renderConfig();
    renderGraficos();
  }

  // --- DASHBOARD ---
  function renderDashboard() {
    const t = FB.getTotals(state.ops);
    const esc = FB.getEscrituraByMonth(state.ops);
    const trimData = FB.getTrimestreData(esc, state.goals.trimestre, state.goals.pisoValor);
    const pys = FB.getPysByMonth(state.ops);

    // KPIs
    const kpiContainer = document.getElementById('kpi-cards');
    if (kpiContainer) {
      kpiContainer.innerHTML = `
        <div class="fb-card">
          <div class="fb-metric-label">pisos vendidos</div>
          <div class="fb-metric-value">${FB.fmt0(t.pisos)}<span class="fb-metric-suffix">/ ${FB.fmt0(state.goals.pisos)}</span></div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.pisos/state.goals.pisos*100)}%;background:var(--kimi-chart-1)"></div></div>
        </div>
        <div class="fb-card">
          <div class="fb-metric-label">locales vendidos</div>
          <div class="fb-metric-value">${FB.fmt0(t.locales)}<span class="fb-metric-suffix">/ ${FB.fmt0(state.goals.locales)}</span></div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.locales/state.goals.locales*100)}%;background:var(--kimi-chart-2)"></div></div>
        </div>
        <div class="fb-card">
          <div class="fb-metric-label">alquileres</div>
          <div class="fb-metric-value">${FB.fmt0(t.alquileres)}<span class="fb-metric-suffix">/ ${FB.fmt0(state.goals.alquileres)}</span></div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.alquileres/state.goals.alquileres*100)}%;background:var(--kimi-chart-3)"></div></div>
        </div>
        <div class="fb-card">
          <div class="fb-metric-label">ingresos totales</div>
          <div class="fb-metric-value">${FB.fmt(t.total)}<span class="fb-metric-suffix">/ ${FB.fmt(state.goals.ingresos)}</span></div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.total/state.goals.ingresos*100)}%"></div></div>
        </div>
      `;
    }

    // Bar chart PYS
    FBCharts.renderBarChart('pys-chart', pys, FB.MONTHS_SHORT);

    // Escritura table
    const escTable = document.getElementById('escritura-table');
    if (escTable) {
      let tbody = '';
      FB.MONTHS_ESCRITURA.forEach((m, i) => {
        const v = esc[m] || 0;
        const trimIdx = Math.floor(i / 3);
        const isTrimEnd = (i + 1) % 3 === 0;
        tbody += `<tr><td style="text-transform:capitalize">${m}</td><td class="num">${FB.fmt(v)}</td></tr>`;
        if (isTrimEnd && trimData[trimIdx]) {
          const td = trimData[trimIdx];
          tbody += `<tr style="background:color-mix(in srgb,var(--kimi-color-bg-hover) 40%,transparent)">
            <td colspan="2" style="text-align:right;font-size:12px;color:var(--kimi-color-text-secondary);padding:6px 10px">
              ${td.trimestre}º trimestre: falta <span class="${td.falta < 0 ? 'fb-negative' : 'fb-positive'}">${FB.fmt(td.falta)}</span> · ${FB.fmt(td.pisos)} pisos
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
          <td class="num">${FB.fmt(td.ingresos)}</td>
          <td class="num ${td.falta < 0 ? 'fb-negative' : 'fb-positive'}">${FB.fmt(td.falta)}</td>
          <td class="num">${FB.fmt(td.pisos)}</td>
        </tr>`;
      });
      bonoTable.innerHTML = `<thead><tr><th>trimestre</th><th class="num">ingresos</th><th class="num">falta</th><th class="num">pisos</th></tr></thead><tbody>${tbody}</tbody>`;
    }
  }

  // --- OPERACIONES ---
  function renderOperaciones() {
    const container = document.getElementById('ops-container');
    if (!container) return;

    let html = '';
    for (let m = 0; m < 14; m++) {
      const ops = state.ops.filter(o => o.month === m);
      const isEditingNew = state.editingOp && state.editingOp.id === 0 && state.editingOp.month === m;

      if (ops.length === 0 && !isEditingNew) continue;

      html += `<div class="fb-month-header">${FB.getMonthLabel(m)}</div>`;
      html += `<div class="fb-table-wrap"><table class="fb-table"><thead><tr><th>tipo</th><th class="center">cant</th><th class="num">honorarios</th><th>escritura</th><th class="num">%</th><th class="num">sin iva</th><th>extra</th><th></th></tr></thead><tbody>`;

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

    const extraText = op.extraConcept ? `${FB.fmtPct(op.extraPct)} ${op.extraConcept.toLowerCase()}` : '';

    return `<tr>
      <td><span class="fb-badge ${badgeClass}">${FB.TYPE_LABELS[op.type] || op.type.toLowerCase()}</span></td>
      <td class="center">${FB.fmt0(op.qty)}</td>
      <td class="num">${FB.fmt(op.honorarios)}</td>
      <td style="text-transform:capitalize">${op.escritura}</td>
      <td class="num">${FB.fmtPct(op.pct)}</td>
      <td class="num" style="font-weight:500">${FB.fmt(FB.calcSinIva(op))}</td>
      <td style="font-size:12px;color:var(--kimi-color-text-secondary)">${extraText}</td>
      <td class="num" style="width:90px"><span class="fb-row-actions">
        <button class="fb-btn fb-btn-sm" onclick="App.editOp(${op.id})">editar</button>
        <button class="fb-btn fb-btn-sm fb-btn-danger" onclick="App.delOp(${op.id})">×</button>
      </span></td>
    </tr>`;
  }

  function renderOpEditRow(op) {
    const typeOpts = FB.TYPES.map(t => `<option value="${t}" ${op.type === t ? 'selected' : ''}>${FB.TYPE_LABELS[t]}</option>`).join('');
    const escOpts = FB.MONTHS_ESCRITURA.map(m => `<option value="${m}" ${op.escritura === m ? 'selected' : ''}>${m}</option>`).join('');
    const extraOpts = ['', 'EXCLUSIVA', 'CAPTACIÓN', 'ZONA', 'COMPRADOR'].map(c => `<option value="${c}" ${op.extraConcept === c ? 'selected' : ''}>${c.toLowerCase()}</option>`).join('');

    return `<tr class="fb-edit-row">
      <td><select class="fb-select" id="op-type-${op.id}" style="min-width:110px">${typeOpts}</select></td>
      <td><input class="fb-input" id="op-qty-${op.id}" type="number" value="${op.qty}" style="width:55px;text-align:center"></td>
      <td><input class="fb-input" id="op-hon-${op.id}" type="number" value="${op.honorarios}" style="width:85px;text-align:right"></td>
      <td><select class="fb-select" id="op-esc-${op.id}" style="min-width:95px">${escOpts}</select></td>
      <td><input class="fb-input" id="op-pct-${op.id}" type="number" step="0.05" value="${op.pct}" style="width:55px;text-align:right"></td>
      <td class="num" style="color:var(--kimi-color-text-secondary)">${FB.fmt(FB.calcSinIva(op))}</td>
      <td><select class="fb-select" id="op-extra-${op.id}" style="min-width:90px"><option value="">-</option>${extraOpts}</select></td>
      <td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveOp(${op.id})">guardar</button> <button class="fb-btn fb-btn-sm" onclick="App.cancelEdit()">cancelar</button></td>
    </tr>`;
  }

  // --- RESUMEN ---
  function renderResumen() {
    const t = FB.getTotals(state.ops);
    const cumpl = t.total / state.goals.ingresos;

    const kpiContainer = document.getElementById('resumen-kpis');
    if (kpiContainer) {
      kpiContainer.innerHTML = `
        <div class="fb-card">
          <div class="fb-card-title">cumplimiento de objetivos</div>
          <div class="fb-metric-value" style="font-size:42px;margin:8px 0">${FB.fmt(cumpl * 100)}%</div>
          <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, cumpl * 100)}%"></div></div>
          <div class="fb-small fb-mt-sm">real: ${FB.fmt(t.total)} · objetivo: ${FB.fmt(state.goals.ingresos)}</div>
        </div>
        <div class="fb-card">
          <div class="fb-card-title">desglose por tipo</div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
            <div class="fb-flex fb-flex-between"><span class="fb-small">pisos vendidos</span><span class="fb-mid">${FB.fmt0(t.pisos)} / ${FB.fmt0(state.goals.pisos)}</span></div>
            <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.pisos/state.goals.pisos*100)}%;background:var(--kimi-chart-1)"></div></div>
            <div class="fb-flex fb-flex-between"><span class="fb-small">locales vendidos</span><span class="fb-mid">${FB.fmt0(t.locales)} / ${FB.fmt0(state.goals.locales)}</span></div>
            <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.locales/state.goals.locales*100)}%;background:var(--kimi-chart-2)"></div></div>
            <div class="fb-flex fb-flex-between"><span class="fb-small">alquileres</span><span class="fb-mid">${FB.fmt0(t.alquileres)} / ${FB.fmt0(state.goals.alquileres)}</span></div>
            <div class="fb-progress"><div class="fb-progress-fill" style="width:${Math.min(100, t.alquileres/state.goals.alquileres*100)}%;background:var(--kimi-chart-3)"></div></div>
          </div>
        </div>
      `;
    }

    // Direcciones vendidas
    const soldTable = document.getElementById('dir-vendidas');
    if (soldTable) {
      let tbody = state.sold.map((s, i) => `<tr>
        <td>${s.date}</td>
        <td>${s.addr}</td>
        <td class="num">${FB.fmt(s.val)}</td>
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
        <td>${r.date}</td>
        <td>${r.addr}</td>
        <td class="num">${FB.fmt(r.contract)}</td>
        <td class="num">${FB.fmt(r.val)}</td>
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
    return `<tr class="fb-edit-row">
      <td><input class="fb-input" id="addr-date-${type}-${index}" type="date" value="${data.date}" style="min-width:120px"></td>
      <td><input class="fb-input" id="addr-addr-${type}-${index}" type="text" value="${data.addr}" placeholder="dirección"></td>
      ${isRent ? `<td><input class="fb-input" id="addr-contract-${type}-${index}" type="number" value="${data.contract}" style="width:80px;text-align:right"></td>` : ''}
      <td><input class="fb-input" id="addr-val-${type}-${index}" type="number" value="${data.val}" style="width:90px;text-align:right"></td>
      <td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveAddress('${type}',${index})">guardar</button> <button class="fb-btn fb-btn-sm" onclick="App.cancelAddrEdit()">cancelar</button></td>
    </tr>`;
  }

  // --- LISTAS ---
  function renderListas() {
    // Comisiones
    const comTable = document.getElementById('comisiones-table');
    if (comTable) {
      let tbody = state.comisiones.map((c, i) => `<tr>
        <td class="num">${FB.fmt(c.sin)}</td>
        <td class="num">${FB.fmt(c.con)}</td>
        <td class="num" style="width:70px"><span class="fb-row-actions">
          <button class="fb-btn fb-btn-sm" onclick="App.editComision(${i})">editar</button>
          <button class="fb-btn fb-btn-sm fb-btn-danger" onclick="App.delComision(${i})">×</button>
        </span></td>
      </tr>`).join('');
      if (state.editingOp && state.editingOp._type === 'comision' && state.editingOp.index === -1) {
        tbody += `<tr class="fb-edit-row"><td><input class="fb-input" id="com-sin--1" type="number" value="0" style="text-align:right"></td><td><input class="fb-input" id="com-con--1" type="number" value="0" style="text-align:right"></td><td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveComision(-1)">guardar</button> <button class="fb-btn fb-btn-sm" onclick="App.cancelEdit()">cancelar</button></td></tr>`;
      }
      comTable.innerHTML = `<thead><tr><th class="num">sin iva</th><th class="num">con iva</th><th></th></tr></thead><tbody>${tbody}</tbody>`;
    }

    // Coeficientes
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

  // --- CONFIG ---
  function renderConfig() {
    const form = document.getElementById('config-form');
    if (!form) return;
    form.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="fb-form-group">
          <label class="fb-form-label">objetivo pisos vendidos</label>
          <input class="fb-input" type="number" id="cfg-pisos" value="${state.goals.pisos}">
        </div>
        <div class="fb-form-group">
          <label class="fb-form-label">objetivo locales vendidos</label>
          <input class="fb-input" type="number" id="cfg-locales" value="${state.goals.locales}">
        </div>
        <div class="fb-form-group">
          <label class="fb-form-label">objetivo alquileres</label>
          <input class="fb-input" type="number" id="cfg-alq" value="${state.goals.alquileres}">
        </div>
        <div class="fb-form-group">
          <label class="fb-form-label">objetivo ingresos anual</label>
          <input class="fb-input" type="number" id="cfg-ing" value="${state.goals.ingresos}">
        </div>
        <div class="fb-form-group">
          <label class="fb-form-label">mínimo trimestral para bono</label>
          <input class="fb-input" type="number" id="cfg-trim" value="${state.goals.trimestre}">
        </div>
        <div class="fb-form-group">
          <label class="fb-form-label">valor estimado por piso</label>
          <input class="fb-input" type="number" id="cfg-pval" value="${state.goals.pisoValor}">
        </div>
        <div class="fb-flex fb-gap-sm fb-mt-sm">
          <button class="fb-btn fb-btn-primary" onclick="App.saveConfig()">guardar objetivos</button>
          <button class="fb-btn" onclick="App.exportExcel()">exportar a excel</button>
        </div>
      </div>
    `;
  }

  // --- GRÁFICOS ---
  function renderGraficos() {
    const pys = FB.getPysByMonth(state.ops);
    const esc = FB.getEscrituraByMonth(state.ops);
    const meses = FB.MONTHS_ESCRITURA;

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

    FBCharts.renderLineChart('chart-line', actualCumul, targetCumul, meses.map(m => m.slice(0, 3)));

    // Donut por tipo
    const t = FB.getTotals(state.ops);
    FBCharts.renderDonut('chart-donut', [t.pisos, t.locales, t.alquileres], ['pisos', 'locales', 'alquileres']);

    // Bar chart escritura
    const escValues = meses.map(m => esc[m] || 0);
    FBCharts.renderBarChart('chart-escritura', escValues, meses.map(m => m.slice(0, 3)), ['var(--kimi-chart-2)']);
  }

  // ===== ACCIONES: OPERACIONES =====
  window.App = window.App || {};

  App.newOp = function() {
    state.editingOp = { id: 0, month: 2, type: 'VENTA PISO', qty: 1, honorarios: 0, escritura: 'enero', pct: 1, extraPct: 0, extraConcept: '' };
    renderOperaciones();
  };

  App.editOp = function(id) {
    const op = state.ops.find(o => o.id === id);
    if (op) { state.editingOp = { ...op }; renderOperaciones(); }
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
    const type = document.getElementById(`op-type-${id}`).value;
    const qty = parseFloat(document.getElementById(`op-qty-${id}`).value) || 0;
    const honorarios = parseFloat(document.getElementById(`op-hon-${id}`).value) || 0;
    const escritura = document.getElementById(`op-esc-${id}`).value;
    const pct = parseFloat(document.getElementById(`op-pct-${id}`).value) || 0;
    const extraConcept = document.getElementById(`op-extra-${id}`)?.value || '';
    const extraPct = extraConcept ? (extraConcept === 'COMPRADOR' ? 0.4 : 0.2) : 0;

    if (id === 0) {
      state.ops.push({ id: state.nextId++, month: state.editingOp.month, type, qty, honorarios, escritura, pct, extraPct, extraConcept });
    } else {
      const op = state.ops.find(o => o.id === id);
      if (op) { Object.assign(op, { type, qty, honorarios, escritura, pct, extraPct, extraConcept }); }
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
    state.editingAddress = { type: 'sold', index };
    renderResumen();
  };

  App.editRent = function(index) {
    state.editingAddress = { type: 'rent', index };
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
    const date = document.getElementById(`addr-date-${type}-${index}`).value;
    const addr = document.getElementById(`addr-addr-${type}-${index}`).value;
    const val = parseFloat(document.getElementById(`addr-val-${type}-${index}`).value) || 0;

    const item = { date, addr, val };
    if (type === 'rent') {
      item.contract = parseFloat(document.getElementById(`addr-contract-${type}-${index}`).value) || 0;
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
    state.editingOp = { _type: 'comision', index };
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
    const sin = parseFloat(document.getElementById(`com-sin-${index}`).value) || 0;
    const con = parseFloat(document.getElementById(`com-con-${index}`).value) || 0;
    if (index === -1) {
      state.comisiones.push({ sin, con });
    } else {
      state.comisiones[index] = { sin, con };
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

  // ===== EXPORTAR A EXCEL =====
  App.exportExcel = function() {
    const t = FB.getTotals(state.ops);
    const esc = FB.getEscrituraByMonth(state.ops);
    const trimData = FB.getTrimestreData(esc, state.goals.trimestre, state.goals.pisoValor);
    const pys = FB.getPysByMonth(state.ops);

    let csv = '\ufeff'; // BOM para Excel
    csv += 'FINCAS BLANCO ' + state.year + '\n\n';
    csv += 'INGRESOS POR PYS\n';
    csv += 'Mes,Importe\n';
    FB.MONTHS.forEach((m, i) => { csv += `${m},${FB.fmt(pys[i])}\n`; });
    csv += `TOTAL,${FB.fmt(t.total)}\n\n`;

    csv += 'INGRESOS POR ESCRITURA\n';
    csv += 'Mes,Importe\n';
    FB.MONTHS_ESCRITURA.forEach(m => { csv += `${m},${FB.fmt(esc[m] || 0)}\n`; });
    csv += `TOTAL,${FB.fmt(Object.values(esc).reduce((a,b)=>a+b,0))}\n\n`;

    csv += 'FALTA PARA BONO (TRIMESTRAL)\n';
    csv += 'Trimestre,Ingresos,Falta,Pisos\n';
    trimData.forEach(td => { csv += `${td.trimestre}º,${FB.fmt(td.ingresos)},${FB.fmt(td.falta)},${FB.fmt(td.pisos)}\n`; });
    csv += '\n';

    csv += 'RESUMEN DE OBJETIVOS\n';
    csv += 'Concepto,Real,Objetivo\n';
    csv += `Pisos vendidos,${t.pisos},${state.goals.pisos}\n`;
    csv += `Locales vendidos,${t.locales},${state.goals.locales}\n`;
    csv += `Alquileres,${t.alquileres},${state.goals.alquileres}\n`;
    csv += `Ingresos totales,${FB.fmt(t.total)},${FB.fmt(state.goals.ingresos)}\n\n`;

    csv += 'OPERACIONES\n';
    csv += 'Mes,Tipo,Cantidad,Honorarios,Escritura,%,Sin IVA,Extra\n';
    state.ops.forEach(op => {
      const extra = op.extraConcept ? `${op.extraPct} ${op.extraConcept}` : '';
      csv += `${FB.getMonthLabel(op.month)},${op.type},${op.qty},${op.honorarios},${op.escritura},${op.pct},${FB.fmt(FB.calcSinIva(op))},${extra}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fincas_blanco_${state.year}.csv`;
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
        <button class="fb-btn fb-btn-icon" id="modal-close" onclick="App.closeModal()">✕</button>
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

  // ===== SERVICE WORKER =====
  function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', init);
})();
