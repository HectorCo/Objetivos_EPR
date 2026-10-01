// Fincas Blanco - Aplicación principal (v18 - contratos robustos)
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
      const y = parseInt(yStr, 10
