// Fincas Blanco 2026 - Datos y utilidades

const FB = {
  MONTHS: ['noviembre','diciembre','enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
  MONTHS_SHORT: ['nov','dic','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
  MONTHS_ESCRITURA: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
  TYPES: ['VENTA PISO','VENTA LOCAL','ALQUILER','VENTA PARKING','TASACIÓN'],
  TYPE_LABELS: {
    'VENTA PISO': 'venta piso',
    'VENTA LOCAL': 'venta local',
    'ALQUILER': 'alquiler',
    'VENTA PARKING': 'venta parking',
    'TASACIÓN': 'tasación'
  },

  DEFAULT_GOALS: {
    pisos: 22,
    locales: 2,
    alquileres: 4,
    ingresos: 258000,
    trimestre: 64500,
    pisoValor: 10550
  },

  DEFAULT_COMISIONES: [
    {sin:16528.93,con:20000},{sin:15702.48,con:19000},{sin:14876.03,con:18000},
    {sin:14049.59,con:17000},{sin:13223.14,con:16000},{sin:12396.69,con:15000},
    {sin:11570.25,con:14000},{sin:10743.80,con:13000},{sin:9917.36,con:12000},
    {sin:9090.91,con:11000},{sin:8264.46,con:10000},{sin:7438.02,con:9000},
    {sin:6611.57,con:8000},{sin:5785.12,con:7000},{sin:4958.68,con:6000},
    {sin:4132.23,con:5000},{sin:0,con:0}
  ],

  DEFAULT_COEFS: [
    {type:'VENTA PISO',coef:1.0,month:'enero'},
    {type:'VENTA PARKING',coef:0.8,month:'febrero'},
    {type:'VENTA LOCAL',coef:0.6,month:'marzo'},
    {type:'TASACIÓN',coef:0.4,month:'abril'},
    {type:'ALQUILER',coef:0.2,month:'mayo'},
  ],

  getDefaultOps(year) {
    const base = [
      {id:1,month:0,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'febrero',pct:0.8,extraPct:0,extraConcept:''},
      {id:2,month:0,type:'VENTA PISO',qty:1,honorarios:19500,escritura:'enero',pct:0.4,extraPct:0.2,extraConcept:'EXCLUSIVA'},
      {id:3,month:0,type:'VENTA PISO',qty:0,honorarios:10000,escritura:'enero',pct:0.8,extraPct:0.2,extraConcept:'CAPTACIÓN'},
      {id:4,month:0,type:'VENTA PISO',qty:1,honorarios:12000,escritura:'febrero',pct:1.0,extraPct:0.2,extraConcept:'ZONA'},
      {id:5,month:0,type:'VENTA PISO',qty:1,honorarios:12000,escritura:'marzo',pct:0.8,extraPct:0,extraConcept:''},
      {id:6,month:0,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'enero',pct:0.8,extraPct:0.4,extraConcept:'COMPRADOR'},
      {id:7,month:2,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'agosto',pct:0.4,extraPct:0.2,extraConcept:'EXCLUSIVA'},
      {id:8,month:2,type:'VENTA LOCAL',qty:1,honorarios:10000,escritura:'abril',pct:0.8,extraPct:0.2,extraConcept:'CAPTACIÓN'},
      {id:9,month:2,type:'VENTA LOCAL',qty:1,honorarios:39000,escritura:'abril',pct:1.0,extraPct:0.2,extraConcept:'ZONA'},
      {id:10,month:3,type:'ALQUILER',qty:1,honorarios:1058,escritura:'febrero',pct:1.0,extraPct:0,extraConcept:''},
      {id:11,month:3,type:'ALQUILER',qty:1,honorarios:948,escritura:'febrero',pct:1.0,extraPct:0,extraConcept:''},
      {id:12,month:3,type:'VENTA PISO',qty:1,honorarios:6000,escritura:'junio',pct:1.0,extraPct:0,extraConcept:''},
      {id:13,month:3,type:'VENTA LOCAL',qty:1,honorarios:48400,escritura:'julio',pct:1.0,extraPct:0,extraConcept:''},
      {id:14,month:3,type:'VENTA PISO',qty:1,honorarios:12000,escritura:'febrero',pct:0.3,extraPct:0,extraConcept:''},
      {id:15,month:4,type:'VENTA PISO',qty:1,honorarios:12000,escritura:'junio',pct:1.0,extraPct:0.2,extraConcept:'EXCLUSIVA'},
      {id:16,month:5,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'noviembre',pct:0.8,extraPct:0,extraConcept:''},
      {id:17,month:5,type:'ALQUILER',qty:1,honorarios:1508.25,escritura:'abril',pct:1.0,extraPct:0,extraConcept:''},
      {id:18,month:5,type:'VENTA LOCAL',qty:1,honorarios:10000,escritura:'mayo',pct:0.4,extraPct:0,extraConcept:''},
      {id:19,month:5,type:'ALQUILER',qty:1,honorarios:1084.16,escritura:'abril',pct:1.0,extraPct:0,extraConcept:''},
      {id:20,month:5,type:'VENTA LOCAL',qty:1,honorarios:30000,escritura:'septiembre',pct:1.0,extraPct:0,extraConcept:''},
      {id:21,month:6,type:'ALQUILER',qty:1,honorarios:985.77,escritura:'mayo',pct:1.0,extraPct:0.2,extraConcept:'EXCLUSIVA'},
      {id:22,month:6,type:'ALQUILER',qty:1,honorarios:1480.57,escritura:'mayo',pct:1.0,extraPct:0.2,extraConcept:'CAPTACIÓN'},
      {id:23,month:6,type:'VENTA PISO',qty:0,honorarios:22000,escritura:'septiembre',pct:0.2,extraPct:0.2,extraConcept:'ZONA'},
      {id:24,month:6,type:'ALQUILER',qty:1,honorarios:1270.5,escritura:'mayo',pct:1.0,extraPct:0.4,extraConcept:'COMPRADOR'},
      {id:25,month:7,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'septiembre',pct:1.0,extraPct:0,extraConcept:''},
      {id:26,month:7,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'julio',pct:1.0,extraPct:0,extraConcept:''},
      {id:27,month:7,type:'VENTA PISO',qty:0,honorarios:10000,escritura:'septiembre',pct:0.4,extraPct:0,extraConcept:''},
      {id:28,month:7,type:'VENTA PISO',qty:1,honorarios:5000,escritura:'septiembre',pct:0.4,extraPct:0,extraConcept:''},
      {id:29,month:7,type:'VENTA PISO',qty:1,honorarios:10000,escritura:'octubre',pct:1.0,extraPct:0,extraConcept:''},
      {id:30,month:8,type:'VENTA LOCAL',qty:1,honorarios:5500,escritura:'julio',pct:1.0,extraPct:0,extraConcept:''},
    ];
    return base;
  },

  getDefaultSold() {
    return [
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
  },

  getDefaultRent() {
    return [
      {date:'2025-11-01',addr:'Av/ Isabel la católica, 14, 3º 8ª',contract:550,val:1424.38},
      {date:'2026-02-01',addr:'C/ Santa Rosa, 12, 3º 2ª',contract:550,val:1333.47},
      {date:'2026-03-01',addr:'Carretera de Hospitalet, 238 ESC B 1º 3ª',contract:550,val:1796.49},
      {date:'2026-05-01',addr:'Av/ Fabregada, 70, 5º 2ª',contract:550,val:1364.69},
      {date:'2025-11-01',addr:'Av/ Isabel la católica, 34, 5º 6ª',contract:550,val:550},
      {date:'2026-06-01',addr:'C/ Santiago de Compostela, 2-4, At 2ª',contract:0,val:896},
      {date:'2026-04-01',addr:'Rambla Marina 528, 1-4',contract:550,val:1773.61},
      {date:'2026-04-01',addr:'Av/ Carrilet, 220, At 3ª',contract:0,val:1050},
    ];
  },

  // Formatting
  fmt(n) {
    if (n === undefined || n === null || isNaN(n)) return '-';
    return n.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  },

  fmt0(n) {
    if (n === undefined || n === null || isNaN(n)) return '-';
    return n.toLocaleString('es-ES', {maximumFractionDigits: 0});
  },

  fmtPct(n) {
    if (n === undefined || n === null || isNaN(n)) return '-';
    return (n * 100).toFixed(0) + '%';
  },

  // Calculations
  calcSinIva(op) {
    return op.qty * (op.honorarios * op.pct) / 1.21;
  },

  getPysByMonth(ops) {
    const arr = new Array(14).fill(0);
    ops.forEach(op => { if (op.month >= 0 && op.month < 14) arr[op.month] += this.calcSinIva(op); });
    return arr;
  },

  getEscrituraByMonth(ops) {
    const map = {};
    this.MONTHS_ESCRITURA.forEach(m => map[m] = 0);
    ops.forEach(op => {
      const m = op.escritura.toLowerCase();
      if (map[m] !== undefined) map[m] += this.calcSinIva(op);
    });
    return map;
  },

  getTotals(ops) {
    let pisos = 0, locales = 0, alquileres = 0, total = 0;
    ops.forEach(op => {
      const v = this.calcSinIva(op);
      total += v;
      if (op.type === 'VENTA PISO') pisos += op.qty;
      if (op.type === 'VENTA LOCAL') locales += op.qty;
      if (op.type === 'ALQUILER') alquileres += op.qty;
    });
    return { pisos, locales, alquileres, total };
  },

  getTrimestreData(escrituraMap, trimestreGoal, pisoValor) {
    const meses = this.MONTHS_ESCRITURA;
    const result = [];
    for (let t = 0; t < 4; t++) {
      const sum = meses.slice(t * 3, (t + 1) * 3).reduce((a, m) => a + (escrituraMap[m] || 0), 0);
      const falta = sum - trimestreGoal;
      const pisos = Math.abs(falta / pisoValor);
      result.push({ trimestre: t + 1, ingresos: sum, falta, pisos });
    }
    return result;
  },

  // Storage
  STORAGE_KEY: 'fincas_blanco_data',

  load(year) {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const all = JSON.parse(raw);
      return all[year] || null;
    } catch (e) { return null; }
  },

  save(year, data) {
    try {
      let all = {};
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) all = JSON.parse(raw);
      all[year] = data;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (e) { return false; }
  },

  exportJSON() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fincas_blanco_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    return true;
  },

  importJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        callback(null, data);
      } catch (err) { callback(err); }
    };
    reader.readAsText(file);
  },

  getYearFromMonthIndex(idx) {
    return idx < 2 ? 2025 : 2026;
  },

  getMonthLabel(idx) {
    return FB.MONTHS[idx] + ' ' + this.getYearFromMonthIndex(idx);
  }
};
