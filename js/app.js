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
      FB.saveYear(y, state.allYears[y
