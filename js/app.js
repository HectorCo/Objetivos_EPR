// Fincas Blanco - Aplicación principal (v13 - fix ops fantasma)
(function () {
  'use strict';

  // ===== ESTADO =====
  const state = {
    year: 2026,
    ops: [],
    contracts: [],
    allYears: {},
    goals: {},
    editingOp: null,
    editingAddressOpId: null,
    nextId: 1,
    activeTab: 'dashboard',
    user: null,
    canWrite: false
  };

  // ===== HELPERS CROSS-YEAR =====
  function collectOpsForYear(year) {
    const result = [];
    const all = state.allYears || {};
    Object.keys(all).forEach(yStr => {
      const y = parseInt(yStr, 10);
      const block = all[yStr] || {};
      const ops = block.ops || [];
      ops.forEach(raw => {
        const op = FB.normalizeOp(raw, y);
        const cy = op.captureYear;
        const ey = op.escrituraYear;
        if (cy === year && ey === year) {
          result.push(Object.assign({}, op, { _role: 'both', _fromYear: y }));
        } else if (cy === year && ey !== year) {
          result.push(Object.assign({}, op, { _role: 'capture', _fromYear: y }));
        } else if (cy !== year && ey === year) {
          result.push(Object.assign({}, op, { _role: 'escritura', _fromYear: y }));
        }
      });
    });
    return result;
  }

  function collectContractsForYear(year) {
    const seen = {};
    const result = [];
    const all = state.allYears || {};
    Object.keys(all).forEach(yStr => {
      const block = all[yStr] || {};
      const contracts = block.contracts || [];
      contracts.forEach(c => {
        const key = String(c.opId);
        if (seen[key]) return;
        seen[key] = true;
        result.push(Object.assign({}, c));
      });
    });
    return result;
  }

  function buildDefaultData(year) {
    if (year === 2026) {
      return {
        ops: JSON.parse(JSON.stringify(FB.DEFAULT_OPS)).map(o => FB.normalizeOp(o, 2026)),
        contracts: JSON.parse(JSON.stringify(FB.DEFAULT_RENT)).concat(JSON.parse(JSON.stringify(FB.DEFAULT_SOLD))),
        goals: Object.assign({}, FB.DEFAULT_GOALS),
        nextId: 31
      };
    }
    return {
      ops: [],
      contracts: [],
      goals: Object.assign({}, FB.DEFAULT_GOALS),
      nextId: 1
    };
  }

  function loadYear(year) {
    state.year = year;
    if (!state.allYears[year]) {
      state.allYears[year] = buildDefaultData(year);
    }
    const block = state.allYears[year];
    state.ops = collectOpsForYear(year);
    state.contracts = collectContractsForYear(year);
    state.goals = block.goals || Object.assign({}, FB.DEFAULT_GOALS);
    state.nextId = block.nextId || 1;
  }

  // ===== saveState() quirúrgico =====
  function saveState() {
    if (!state.canWrite) {
      showToast('modo solo lectura: no puedes guardar cambios');
      return;
    }

    const affectedYears = new Set();

    state.ops.forEach(op => {
      const fromYear = op._fromYear != null ? op._fromYear : state.year;
      affectedYears.add(fromYear);

      if (!state.allYears[fromYear]) {
        state.allYears[fromYear] = { ops: [], contracts: [], goals: {}, nextId: 1 };
      }

      const block = state.allYears[fromYear];
      const clean = Object.assign({}, op);
      delete clean._role;
      delete clean._fromYear;

      const idx = block.ops.findIndex(o => o.id === op.id);
      if (idx >= 0) {
        block.ops[idx] = clean;
      } else {
        block.ops.push(clean);
      }
    });

    state.contracts.forEach(c => {
      const op = state.ops.find(o => o.id === c.opId);
      if (!op) return;

      const fromYear = op._fromYear != null ? op._fromYear : state.year;
      affectedYears.add(fromYear);

      if (!state.allYears[fromYear]) {
        state.allYears[fromYear] = { ops: [], contracts: [], goals: {}, nextId: 1 };
      }

      const block = state.allYears[fromYear];
      const idx = block.contracts.findIndex(x => x.opId === c.opId);
      const clean = Object.assign({}, c);

      if (idx >= 0) {
        block.contracts[idx] = clean;
      } else {
        block.contracts.push(clean);
      }
    });

    state.allYears[state.year].goals = state.goals;
    state.allYears[state.year].nextId = state.nextId;
    affectedYears.add(state.year);

    affectedYears.forEach(y => {
      if (!state.allYears[y]) return;
      FB.saveYear(y, state.allYears[y]);
    });
  }

  // ===== AUTENTICACIÓN =====
  function initAuth() {
    const F = window.FB_FIREBASE;
    if (!F) {
      console.error('Firebase no está disponible');
      document.getElementById('fb-auth-status').textContent = 'Error: Firebase no cargó.';
      return;
    }

    const { auth, onAuthStateChanged, signInWithPopup, provider, signOut } = F;

    const btn = document.getElementById('fb-auth-btn');
    const status = document.getElementById('fb-auth-status');
    btn.style.display = 'inline-flex';
    status.style.display = 'none';

    btn.addEventListener('click', () => {
      status.style.display = 'block';
      status.textContent = 'Iniciando sesión…';
      btn.style.display = 'none';
      signInWithPopup(auth, provider).catch((err) => {
        console.error('Error al iniciar sesión:', err);
        status.textContent = 'Error: ' + (err.message || 'no se pudo iniciar sesión');
        btn.style.display = 'inline-flex';
      });
    });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        state.user = user;
        FB.initFirestore(user);
        state.canWrite = FB.isWriter();
        console.log('[Fincas Blanco] Usuario:', user.email, '- Escritor:', state.canWrite);

        showApp();
        applyRoleUI();

        state.allYears = FB.loadAllLocal();
        if (!Object.keys(state.allYears).length) {
          state.allYears[2026] = buildDefaultData(2026);
        }

        loadYear(state.year);
        init();

        FB.loadAllFromCloud().then((all) => {
          if (all) {
            console.log('[Fincas Blanco] Datos cargados de Firestore');
            state.allYears = all;
            loadYear(state.year);
            renderAll();
          }
        });

        FB.subscribeToCloud((all) => {
          state.allYears = all;
          loadYear(state.year);
          renderAll();
        });
      } else {
        state.user = null;
        state.canWrite = false;
        showLogin();
      }
    });

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        signOut(auth).then(() => location.reload());
      });
    }
  }

  function showLogin() {
    document.getElementById('fb-auth-screen').style.display = 'flex';
    document.getElementById('fb-main').style.display = 'none';
  }

  function showApp() {
    document.getElementById('fb-auth-screen').style.display = 'none';
    document.getElementById('fb-main').style.display = 'block';
  }

  function applyRoleUI() {
    let badge = document.getElementById('fb-readonly-badge');
    if (!state.canWrite) {
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'fb-readonly-badge';
        badge.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:9999px;border:1px solid #dc2626;color:#dc2626;font-size:12px;font-weight:500;';
        badge.textContent = 'solo lectura';
        const header = document.querySelector('.fb-header > div:last-child');
        if (header) header.insertBefore(badge, header.firstChild);
      }
    } else if (badge) {
      badge.remove();
    }

    const fab = document.getElementById('btn-new-op');
    if (fab) fab.style.display = state.canWrite ? '' : 'none';

    const btnImport = document.getElementById('btn-import');
    if (btnImport) btnImport.style.display = state.canWrite ? '' : 'none';
  }

  // ===== INICIALIZACIÓN =====
  function init() {
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
        state.allYears = FB.loadAllLocal();
        loadYear(state.year);
        saveState();
        renderAll();
        showToast('backup importado y subido a la nube');
      });
      e.target.value = '';
    });

    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') closeModal();
    });

    let _resizeTimer = null;
    window.addEventListener('resize', () => {
      if (state.activeTab !== 'graficos' && state.activeTab !== 'dashboard') return;
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(() => {
        if (state.activeTab === 'graficos') renderGraficos();
        if (state.activeTab === 'dashboard') renderDashboard();
      }, 150);
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.fb-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    document.querySelectorAll('.fb-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tabName));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (tabName === 'dashboard') renderDashboard();
      if (tabName === 'graficos') renderGraficos();
      if (tabName === 'resumen') renderResumen();
    }));
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
    applyRoleUI();
  }

  function updateYearDisplay() {
    const el = document.getElementById('year-display');
    if (el) el.textContent = state.year;
  }

  // ===== DASHBOARD =====
  function renderDashboard() {
    const t = FB.getTotals(state.ops, state.year, state.contracts);
    const esc = FB.getEscrituraByMonth(state.ops, state.year, state.contracts);
    const trimData = FB.getTrimestreData(esc, state.goals.trimestre, state.goals.pisoValor);
    const pys = FB.getPysByMonth(state.ops, state.year, state.contracts);

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

    const escValues = FB.MONTHS_ESCRITURA.map(m => esc[m] || 0);
    FBCharts.renderBarChart('chart-escritura-dashboard', escValues, FB.MONTHS_ESCRITURA.map(m => m.slice(0, 3)), ['var(--kimi-chart-2)']);

    const bonoTable = document.getElementById('bono-table');
    if (bonoTable) {
      let tbody = '';
      trimData.forEach(td => {
        const faltaClass = td.falta > 0 ? 'fb-negative' : 'fb-positive';
        tbody += '<tr>'
              + '<td>' + td.trimestre + 'º</td>'
              + '<td class="num">' + FB.fmt(td.ingresos) + '</td>'
              + '<td class="num ' + faltaClass + '">' + FB.fmt(td.falta) + '</td>'
              + '<td class="num">' + td.pisos + '</td>'
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
            + '<th>escritura</th><th class="center">año escr.</th><th class="num">%</th><th class="num">sin iva</th>'
            + (state.canWrite ? '<th></th>' : '')
            + '</tr></thead><tbody>';

      ops.forEach(op => {
        if (state.editingOp && state.editingOp.id === op.id && state.editingOp._fromYear === op._fromYear) {
          html += renderOpEditRow(op);
        } else {
          html += renderOpRow(op);
        }
      });

      if (isEditingNew) html += renderOpEditRow(state.editingOp);

      html += '</tbody></table></div>';
    }

    container.innerHTML = html || '<div class="fb-muted fb-center" style="padding:60px 20px">no hay operaciones registradas.</div>';
  }

  function getEscrituraCell(op) {
    const ey = FB.getEscrituraYear(op, state.year);
    const cy = FB.getCaptureYear(op, state.year);
    const mes = String(op.escritura || '').toLowerCase();

    if (ey === cy) {
      return '<td style="text-transform:capitalize">' + mes + '</td>'
           + '<td class="center fb-muted">—</td>';
    }
    if (ey > cy) {
      return '<td style="text-transform:capitalize">' + mes + '</td>'
           + '<td class="center"><strong style="color:#dc2626">' + ey + '</strong></td>';
    }
    return '<td style="text-transform:capitalize">' + mes + '</td>'
         + '<td class="center"><span class="fb-muted" style="font-size:11px">(capt. ' + cy + ')</span></td>';
  }

  function renderOpRow(op) {
    const badgeClass = {
      'VENTA PISO': 'fb-badge-piso',
      'VENTA LOCAL': 'fb-badge-local',
      'ALQUILER': 'fb-badge-alq',
      'VENTA PARKING': 'fb-badge-parking',
      'TASACIÓN': 'fb-badge-tas'
    }[op.type] || 'fb-badge-piso';

    const id = op.id;
    const fromYear = op._fromYear;

    return '<tr>'
      + '<td><span class="fb-badge ' + badgeClass + '">' + (FB.TYPE_LABELS[op.type] || op.type.toLowerCase()) + '</span></td>'
      + '<td class="center">' + FB.fmt0(op.qty) + '</td>'
      + '<td class="num">' + FB.fmt(op.honorarios) + '</td>'
      + getEscrituraCell(op)
      + '<td class="num">' + FB.fmtPct(op.pct) + '</td>'
      + '<td class="num" style="font-weight:500">' + FB.fmt(FB.calcSinIva(op)) + '</td>'
      + (state.canWrite
          ? '<td class="num" style="width:90px"><span class="fb-row-actions">'
            + '<button class="fb-btn fb-btn-sm" onclick="App.editOp(' + id + ',' + fromYear + ')">editar</button>'
            + '<button class="fb-btn fb-btn-sm fb-btn-danger" onclick="App.delOp(' + id + ',' + fromYear + ')">×</button>'
            + '</span></td>'
          : '')
      + '</tr>';
  }

  function renderOpEditRow(op) {
    const typeOpts = FB.TYPES.map(t => '<option value="' + t + '"' + (op.type === t ? ' selected' : '') + '>' + FB.TYPE_LABELS[t] + '</option>').join('');
    const escOpts = FB.MONTHS_ESCRITURA.map(m => '<option value="' + m + '"' + (op.escritura === m ? ' selected' : '') + '>' + m + '</option>').join('');

    const cy = op.captureYear != null ? op.captureYear : state.year;
    const eySel = op.escrituraYear != null ? op.escrituraYear : cy;
    const years = [];
    for (let y = cy - 1; y <= cy + 3; y++) years.push(y);
    const yearOpts = years.map(y => '<option value="' + y + '"' + (y === eySel ? ' selected' : '') + '>' + y + '</option>').join('');

    const key = op.id + '-' + (op._fromYear != null ? op._fromYear : state.year);

    return '<tr class="fb-edit-row">'
      + '<td><select class="fb-select" id="op-type-' + key + '" style="min-width:110px">' + typeOpts + '</select></td>'
      + '<td><input class="fb-input" id="op-qty-' + key + '" type="number" value="' + (op.qty != null ? op.qty : 1) + '" style="width:55px;text-align:center"></td>'
      + '<td><input class="fb-input" id="op-hon-' + key + '" type="number" step="0.01" value="' + (op.honorarios != null ? op.honorarios : 0) + '" style="width:90px;text-align:right"></td>'
      + '<td><select class="fb-select" id="op-esc-' + key + '" style="min-width:95px">' + escOpts + '</select></td>'
      + '<td><select class="fb-select" id="op-escyear-' + key + '" style="min-width:70px">' + yearOpts + '</select></td>'
      + '<td><input class="fb-input" id="op-pct-' + key + '" type="number" step="0.05" value="' + (op.pct != null ? op.pct : 1) + '" style="width:55px;text-align:right"></td>'
      + '<td class="num" style="color:var(--kimi-color-text-secondary)">' + FB.fmt(FB.calcSinIva(op)) + '</td>'
      + '<td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveOp(' + op.id + ',' + (op._fromYear != null ? op._fromYear : 'null') + ')">guardar</button> '
      + '<button class="fb-btn fb-btn-sm" onclick="App.cancelEdit()">cancelar</button></td>'
      + '</tr>';
  }

  // ===== RESUMEN =====
  function renderResumen() {
    const t = FB.getTotals(state.ops, state.year, state.contracts);
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

    const soldTable = document.getElementById('dir-vendidas');
    if (soldTable) {
      // ⚠️ NUEVO: filtrar qty > 0 para excluir ops fantasma
      const ventas = state.ops.filter(o =>
        (o.type === 'VENTA PISO' || o.type === 'VENTA LOCAL' || o.type === 'VENTA PARKING')
        && Number(o.qty) > 0
      );
      let tbody = '';
      if (ventas.length === 0) {
        tbody = '<tr><td colspan="5" class="fb-muted fb-center" style="padding:24px">sin operaciones de venta.</td></tr>';
      } else {
        ventas.forEach(op => {
          const linked = state.contracts.find(c => c.opId === op.id) || {};
          const isEditing = state.editingAddressOpId === op.id;
          if (isEditing) {
            tbody += renderAddressEditRow(op, linked);
          } else {
            tbody += renderSoldRow(op, linked);
          }
        });
      }
      soldTable.innerHTML = '<thead><tr><th>fecha</th><th>dirección</th><th>tipo</th><th class="num">importe</th>'
        + (state.canWrite ? '<th></th>' : '')
        + '</tr></thead><tbody>' + tbody + '</tbody>';
    }

    const rentTable = document.getElementById('dir-alquiladas');
    if (rentTable) {
      // ⚠️ NUEVO: filtrar qty > 0
      const alquileres = state.ops.filter(o => o.type === 'ALQUILER' && Number(o.qty) > 0);
      let tbody = '';
      if (alquileres.length === 0) {
        tbody = '<tr><td colspan="6" class="fb-muted fb-center" style="padding:24px">sin operaciones de alquiler.</td></tr>';
      } else {
        alquileres.forEach(op => {
          const linked = state.contracts.find(c => c.opId === op.id) || {};
          const isEditing = state.editingAddressOpId === op.id;
          if (isEditing) {
            tbody += renderAddressEditRow(op, linked);
          } else {
            tbody += renderRentRow(op, linked);
          }
        });
      }
      rentTable.innerHTML = '<thead><tr><th>fecha</th><th>dirección</th><th>tipo</th><th class="num">contrato</th><th class="num">importe</th>'
        + (state.canWrite ? '<th></th>' : '')
        + '</tr></thead><tbody>' + tbody + '</tbody>';
    }
  }

  function renderSoldRow(op, linked) {
    const addr = linked.addr || '<span class="fb-muted">— sin dirección —</span>';
    const date = linked.date ? FB.fmtDateEU(linked.date) : '<span class="fb-muted">—</span>';
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
      + (state.canWrite
          ? '<td class="num" style="width:80px"><span class="fb-row-actions">'
            + '<button class="fb-btn fb-btn-sm" onclick="App.editAddress(' + op.id + ')">editar</button>'
            + '</span></td>'
          : '')
      + '</tr>';
  }

  function renderRentRow(op, linked) {
    const addr = linked.addr || '<span class="fb-muted">— sin dirección —</span>';
    const date = linked.date ? FB.fmtDateEU(linked.date) : '<span class="fb-muted">—</span>';
    const contract = linked.contract !== undefined ? linked.contract : 0;
    const val = linked.val !== undefined ? linked.val : FB.calcSinIva(op);
    return '<tr>'
      + '<td>' + date + '</td>'
      + '<td>' + addr + '</td>'
      + '<td><span class="fb-badge fb-badge-alq">alquiler</span></td>'
      + '<td class="num">' + FB.fmt(contract) + '</td>'
      + '<td class="num">' + FB.fmt(val) + '</td>'
      + (state.canWrite
          ? '<td class="num" style="width:80px"><span class="fb-row-actions">'
            + '<button class="fb-btn fb-btn-sm" onclick="App.editAddress(' + op.id + ')">editar</button>'
            + '</span></td>'
          : '')
      + '</tr>';
  }

  function renderAddressEditRow(op, linked) {
    const dateVal = linked.date ? FB.fmtDateEU(linked.date) : '';
    const isRent = op.type === 'ALQUILER';
    const contractVal = linked.contract !== undefined ? linked.contract : (isRent ? 550 : 0);
    const valVal = linked.val !== undefined ? linked.val : FB.calcSinIva(op);

    return '<tr class="fb-edit-row">'
      + '<td><input class="fb-input" id="addr-date-' + op.id + '" type="text" value="' + dateVal + '" placeholder="DD-MM-AAAA" style="min-width:110px"></td>'
      + '<td><input class="fb-input" id="addr-addr-' + op.id + '" type="text" value="' + (linked.addr || '') + '" placeholder="dirección"></td>'
      + '<td>' + (FB.TYPE_LABELS[op.type] || op.type.toLowerCase()) + '</td>'
      + (isRent
          ? '<td><input class="fb-input" id="addr-contract-' + op.id + '" type="number" step="0.01" value="' + contractVal + '" style="width:90px;text-align:right" placeholder="contrato"></td>'
          : '')
      + '<td><input class="fb-input" id="addr-val-' + op.id + '" type="number" step="0.01" value="' + valVal + '" style="width:90px;text-align:right"></td>'
      + '<td class="num"><button class="fb-btn fb-btn-sm fb-btn-primary" onclick="App.saveAddress(' + op.id + ')">guardar</button> '
      + '<button class="fb-btn fb-btn-sm" onclick="App.cancelAddrEdit()">cancelar</button></td>'
      + '</tr>';
  }

  // ===== CONFIG =====
  function renderConfig() {
    const form = document.getElementById('config-form');
    if (!form) return;

    if (!state.canWrite) {
      form.innerHTML = '<div class="fb-muted fb-center" style="padding:24px">modo solo lectura: no puedes modificar los objetivos.</div>';
      return;
    }

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
      + '<button class="fb-btn fb-btn-danger" onclick="App.rescueData()">⚠️ reparar datos</button>'
      + '</div></div>';
  }

  // ===== GRÁFICOS =====
  function renderGraficos() {
    const esc = FB.getEscrituraByMonth(state.ops, state.year, state.contracts);
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

    const t = FB.getTotals(state.ops, state.year, state.contracts);
    FBCharts.renderDonut('chart-donut', [t.pisos, t.locales, t.alquileres], ['pisos', 'locales', 'alquileres']);

    const escValues = meses.map(m => esc[m] || 0);
    FBCharts.renderBarChart('chart-escritura', escValues, meses.map(m => m.slice(0, 3)), ['var(--kimi-chart-2)']);
  }

  // ===== ACCIONES =====
  const App = {};

  App.newOp = function () {
    if (!state.canWrite) { showToast('modo solo lectura'); return; }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    let monthIndex = currentYear === 2025 ? currentMonth - 10 : currentMonth + 2;
    if (monthIndex < 0) monthIndex = 0;
    if (monthIndex > 13) monthIndex = 13;

    state.editingOp = {
      id: 0,
      month: monthIndex,
      captureYear: state.year,
      escrituraYear: state.year,
      type: 'VENTA PISO',
      qty: 1,
      honorarios: 0,
      escritura: FB.MONTHS_ESCRITURA[currentMonth] || 'enero',
      pct: 1,
      _fromYear: state.year
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

  App.editOp = function (id, fromYear) {
    if (!state.canWrite) { showToast('modo solo lectura'); return; }
    const op = state.ops.find(o => o.id === id && o._fromYear === fromYear);
    if (op) {
      state.editingOp = JSON.parse(JSON.stringify(op));
      renderOperaciones();
    }
  };

  App.delOp = function (id, fromYear) {
    if (!state.canWrite) { showToast('modo solo lectura'); return; }
    if (!confirm('¿eliminar esta operación?')) return;

    const op = state.ops.find(o => o.id === id && o._fromYear === fromYear);
    if (!op) return;

    state.ops = state.ops.filter(o => !(o.id === id && o._fromYear === fromYear));
    state.contracts = state.contracts.filter(c => c.opId !== id);

    const block = state.allYears[fromYear];
    if (block) {
      block.ops = block.ops.filter(o => o.id !== id);
      block.contracts = block.contracts.filter(c => c.opId !== id);
    }

    FB.saveYear(fromYear, block);
    loadYear(state.year);
    renderAll();
    showToast('operación eliminada');
  };

  App.saveOp = function (id, fromYear) {
    if (!state.canWrite) { showToast('modo solo lectura'); return; }

    const key = id + '-' + (fromYear != null ? fromYear : state.year);
    const typeEl = document.getElementById('op-type-' + key);
    const qtyEl = document.getElementById('op-qty-' + key);
    const honEl = document.getElementById('op-hon-' + key);
    const escEl = document.getElementById('op-esc-' + key);
    const escyEl = document.getElementById('op-escyear-' + key);
    const pctEl = document.getElementById('op-pct-' + key);

    if (!typeEl || !qtyEl || !honEl || !escEl || !escyEl || !pctEl) {
      showToast('error: no se encontraron los campos');
      return;
    }

    const ey = parseInt(escyEl.value, 10) || state.year;
    const payload = {
      type: typeEl.value,
      qty: parseFloat(qtyEl.value) || 0,
      honorarios: parseFloat(honEl.value) || 0,
      escritura: escEl.value,
      escrituraYear: ey,
      pct: parseFloat(pctEl.value) || 0
    };

    if (id === 0) {
      const newId = state.nextId++;
      const newOp = Object.assign({
        id: newId,
        month: state.editingOp.month,
        captureYear: state.year
      }, payload);

      if (!state.allYears[state.year]) {
        state.allYears[state.year] = { ops: [], contracts: [], goals: state.goals, nextId: state.nextId };
      }
      state.allYears[state.year].ops.push(newOp);
      state.allYears[state.year].nextId = state.nextId;
      FB.saveYear(state.year, state.allYears[state.year]);
    } else {
      const block = state.allYears[fromYear];
      if (!block) return;
      const op = block.ops.find(o => o.id === id);
      if (op) {
        Object.assign(op, payload);
        FB.saveYear(fromYear, block);
      }
    }

    state.editingOp = null;
    loadYear(state.year);
    renderAll();
    showToast('operación guardada');
  };

  App.cancelEdit = function () {
    state.editingOp = null;
    renderOperaciones();
  };

  App.editAddress = function (opId) {
    if (!state.canWrite) { showToast('modo solo lectura'); return; }
    state.editingAddressOpId = opId;
    renderResumen();
  };

  App.cancelAddrEdit = function () {
    state.editingAddressOpId = null;
    renderResumen();
  };

  App.saveAddress = function (opId) {
    if (!state.canWrite) { showToast('modo solo lectura'); return; }
    const dateEl = document.getElementById('addr-date-' + opId);
    const addrEl = document.getElementById('addr-addr-' + opId);
    const valEl = document.getElementById('addr-val-' + opId);
    if (!dateEl || !addrEl || !valEl) { showToast('error: campos no encontrados'); return; }

    const op = state.ops.find(o => o.id === opId);
    if (!op) return;
    const fromYear = op._fromYear != null ? op._fromYear : state.year;
    const isRent = op.type === 'ALQUILER';

    const dateISO = FB.parseDateEU(dateEl.value);
    const entry = {
      date: dateISO || dateEl.value,
      addr: addrEl.value,
      val: parseFloat(valEl.value) || 0,
      opId: opId
    };

    if (isRent) {
      const contractEl = document.getElementById('addr-contract-' + opId);
      entry.contract = contractEl ? (parseFloat(contractEl.value) || 0) : 0;
    }

    if (!state.allYears[fromYear]) {
      state.allYears[fromYear] = { ops: [], contracts: [], goals: {}, nextId: 1 };
    }
    const block = state.allYears[fromYear];
    const idx = block.contracts.findIndex(c => c.opId === opId);
    if (idx >= 0) block.contracts[idx] = entry;
    else block.contracts.push(entry);

    FB.saveYear(fromYear, block);

    state.editingAddressOpId = null;
    loadYear(state.year);
    renderAll();
    showToast('dirección guardada');
  };

  App.saveConfig = function () {
    if (!state.canWrite) { showToast('modo solo lectura'); return; }
    state.goals.pisos = parseFloat(document.getElementById('cfg-pisos').value) || 0;
    state.goals.locales = parseFloat(document.getElementById('cfg-locales').value) || 0;
    state.goals.alquileres = parseFloat(document.getElementById('cfg-alq').value) || 0;
    state.goals.ingresos = parseFloat(document.getElementById('cfg-ing').value) || 0;
    state.goals.trimestre = parseFloat(document.getElementById('cfg-trim').value) || 0;
    state.goals.pisoValor = parseFloat(document.getElementById('cfg-pval').value) || 0;

    state.allYears[state.year].goals = state.goals;
    FB.saveYear(state.year, state.allYears[state.year]);
    renderAll();
    showToast('objetivos guardados');
  };

  // ===== RESCATE =====
  App.rescueData = function () {
    if (!state.canWrite) { showToast('modo solo lectura'); return; }
    if (!confirm('⚠️ Esto va a:\n\n1. Eliminar operaciones con cantidad 0 (ops fantasma)\n2. Eliminar contratos duplicados\n3. Eliminar contratos huérfanos\n4. NO restaurar ops borradas por error\n\n¿Continuar?')) return;

    const cleaned = FB.cleanupAllYears(state.allYears);
    state.allYears = cleaned;

    Object.keys(cleaned).forEach(yStr => {
      FB.saveYear(parseInt(yStr, 10), cleaned[yStr]);
    });

    loadYear(state.year);
    renderAll();
    showToast('✅ datos reparados');
    console.log('[Rescue] Años limpios:', Object.keys(cleaned).map(y => y + ': ' + cleaned[y].ops.length + ' ops, ' + cleaned[y].contracts.length + ' contratos'));
  };

  App.exportExcel = function () {
    const t = FB.getTotals(state.ops, state.year, state.contracts);
    const esc = FB.getEscrituraByMonth(state.ops, state.year, state.contracts);
    const trimData = FB.getTrimestreData(esc, state.goals.trimestre, state.goals.pisoValor);
    const pys = FB.getPysByMonth(state.ops, state.year, state.contracts);
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
    trimData.forEach(td => lines.push(td.trimestre + 'º,' + num(td.ingresos) + ',' + num(td.falta) + ',' + td.pisos));
    lines.push('');
    lines.push('RESUMEN DE OBJETIVOS');
    lines.push('Concepto,Real,Objetivo');
    lines.push('Pisos vendidos,' + t.pisos + ',' + state.goals.pisos);
    lines.push('Locales vendidos,' + t.locales + ',' + state.goals.locales);
    lines.push('Alquileres,' + t.alquileres + ',' + state.goals.alquileres);
    lines.push('Ingresos totales,' + num(t.total) + ',' + num(state.goals.ingresos));
    lines.push('');
    lines.push('OPERACIONES');
    lines.push('Mes,Año escr.,Tipo,Cantidad,Honorarios,Escritura,%,Sin IVA');
    state.ops.forEach(op => {
      lines.push([
        FB.getMonthLabel(op.month),
        FB.getEscrituraYear(op, state.year),
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

  function showToast(msg) {
    const toast = document.getElementById('fb-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  window.App = App;

  // ===== ARRANQUE =====
  function boot() {
    if (window.FB_FIREBASE) {
      initAuth();
    } else {
      window.addEventListener('firebase-ready', initAuth, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
