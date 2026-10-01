// Fincas Blanco - Datos, constantes, cálculos y almacenamiento (Firebase)
(function (global) {
  'use strict';

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

    // ⚠️ Lista de correos autorizados a MODIFICAR (debe coincidir con las Reglas de Firestore)
    WRITERS: [
      'CORREO_1@gmail.com',   // ← sustituye
      'CORREO_2@gmail.com'    // ← sustituye
    ],

    DEFAULT_GOALS: {
      pisos: 22,
      locales: 2,
      alquileres: 4,
      ingresos: 258000,
      trimestre: 64500,
      pisoValor: 10550
    },

    DEFAULT_OPS: [
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
      {id:30,month:8,type:'VENTA LOCAL',qty:1,honorarios:5500,escritura:'julio',pct:1.0}
    ],

    DEFAULT_SOLD: [
      {date:'2025-11-01',addr:'C/ 8 de març, 64, 2º 1ª',val:6446.28,opId:1},
      {date:'2026-02-01',addr:'Av/ Torrente Gornal, 72',val:2975.21,opId:2},
      {date:'2026-03-01',addr:'C/ Llunàs, 2, 1º 1ª',val:9917.36,opId:4},
      {date:'2026-05-01',addr:'C/ Badalona, 14 (CASA)',val:0,opId:null},
      {date:'2025-11-01',addr:'Plaza Blocs Florida, 12 3º 4ª',val:6611.57,opId:5},
      {date:'2026-06-01',addr:'C/ Rubidi, 8, 2º 2ª',val:8264.46,opId:6},
      {date:'2026-04-01',addr:'C/ Alegria, 4 (LOCAL)',val:3305.79,opId:7},
      {date:'2025-11-01',addr:'C/ Casanova, 23 3º 1ª',val:9917.36,opId:8},
      {date:'2025-12-01',addr:'C/ Teide, 10 4º 3ª',val:6611.57,opId:9},
      {date:'2025-11-01',addr:'Rambla Marina, 528 13º 1ª',val:7933.88,opId:12},
      {date:'2026-01-01',addr:'Av/ Vilanova, 12 (LOCAL)',val:6611.57,opId:13},
      {date:'2026-01-01',addr:'C/ Vinaroz, 3 3º 1ª',val:3305.79,opId:14},
      {date:'2026-01-26',addr:'C/ Gerona, 27 (LOCAL)',val:32231.40,opId:15},
      {date:'2026-02-01',addr:'C/ CENTRE 4, plta 1, prta 2',val:4958.68,opId:18},
      {date:'2026-02-01',addr:'Av/ Fabregada, 93 (LOCAL)',val:40000,opId:20},
      {date:'2026-04-01',addr:'HIERBABUENA, DE LA, 10, prta: 1',val:6611.57,opId:25},
      {date:'2026-06-01',addr:'Ctra de Esplugues, 14, 9º 3ª',val:8264.46,opId:26},
      {date:'2026-04-01',addr:'C/ Josep Torras i Bages, 31 (LOCAL)',val:24793.39,opId:28},
      {date:'2026-06-01',addr:'Rambla Just Oliveras, 27 Entlo 2ª',val:8264.46,opId:29},
      {date:'2026-06-01',addr:'C/ Rosa de Alejandría, 85, SB 1º',val:1652.89,opId:null},
      {date:'2026-07-01',addr:'C/ Estronci, 47, LOCAL',val:4545.45,opId:30}
    ],

    DEFAULT_RENT: [
      {date:'2025-11-01',addr:'Av/ Isabel la católica, 14, 3º 8ª',contract:550,val:1424.38,opId:10},
      {date:'2026-02-01',addr:'C/ Santa Rosa, 12, 3º 2ª',contract:550,val:1333.47,opId:11},
      {date:'2026-03-01',addr:'Carretera de Hospitalet, 238 ESC B 1º 3ª',contract:550,val:1796.49,opId:17},
      {date:'2026-05-01',addr:'Av/ Fabregada, 70, 5º 2ª',contract:550,val:1364.69,opId:19},
      {date:'2025-11-01',addr:'Av/ Isabel la católica, 34, 5º 6ª',contract:550,val:550,opId:21},
      {date:'2026-06-01',addr:'C/ Santiago de Compostela, 2-4, At 2ª',contract:0,val:896,opId:22},
      {date:'2026-04-01',addr:'Rambla Marina 528, 1-4',contract:550,val:1773.61,opId:24},
      {date:'2026-04-01',addr:'Av/ Carrilet, 220, At 3ª',contract:0,val:1050,opId:null}
    ],

    // ---------- Formato ----------
    fmt(n) {
      if (n === undefined || n === null || isNaN(n)) return '-';
      return Number(n).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' €';
    },
    fmt0(n) {
      if (n === undefined || n === null || isNaN(n)) return '-';
      return Number(n).toLocaleString('es-ES', {maximumFractionDigits: 0});
    },
    fmtPct(n) {
      if (n === undefined || n === null || isNaN(n)) return '-';
      return (n * 100).toFixed(0) + '%';
    },
    fmtDateEU(isoDate) {
      if (!isoDate) return '';
      const parts = isoDate.split('-');
      if (parts.length !== 3) return isoDate;
      const [y, m, d] = parts;
      return `${d}-${m}-${y}`;
    },
    parseDateEU(euDate) {
      if (!euDate) return '';
      const parts = euDate.split('-');
      if (parts.length !== 3) return euDate;
      const [d, m, y] = parts;
      if (d.length === 4) return euDate;
      return `${y}-${m}-${d}`;
    },

    // ---------- Cálculos ----------
    calcSinIva(op) {
      const qty = Number(op.qty) || 0;
      const hon = Number(op.honorarios) || 0;
      const pct = Number(op.pct) || 0;
      return qty * hon * pct / 1.21;
    },
    getPysByMonth(ops, contracts) {
      const arr = new Array(14).fill(0);
      ops.forEach(op => {
        if (op.month >= 0 && op.month < 14) arr[op.month] += this.calcSinIva(op);
      });
      if (Array.isArray(contracts)) {
        contracts.forEach(c => {
          const op = ops.find(o => o.id === c.opId);
          if (op && op.month >= 0 && op.month < 14) {
            arr[op.month] += Number(c.contract) || 0;
          }
        });
      }
      return arr;
    },
    getEscrituraByMonth(ops, contracts) {
      const map = {};
      this.MONTHS_ESCRITURA.forEach(m => map[m] = 0);
      ops.forEach(op => {
        const m = String(op.escritura || '').toLowerCase();
        if (map[m] !== undefined) map[m] += this.calcSinIva(op);
      });
      if (Array.isArray(contracts)) {
        contracts.forEach(c => {
          const op = ops.find(o => o.id === c.opId);
          if (op) {
            const m = String(op.escritura || '').toLowerCase();
            if (map[m] !== undefined) map[m] += Number(c.contract) || 0;
          }
        });
      }
      return map;
    },
    getTotals(ops, contracts) {
      let pisos = 0, locales = 0, alquileres = 0, total = 0, totalContratos = 0;
      ops.forEach(op => {
        const v = this.calcSinIva(op);
        if (isNaN(v)) return;
        total += v;
        if (op.type === 'VENTA PISO') pisos += Number(op.qty) || 0;
        if (op.type === 'VENTA LOCAL') locales += Number(op.qty) || 0;
        if (op.type === 'ALQUILER') alquileres += Number(op.qty) || 0;
      });
      if (Array.isArray(contracts)) {
        contracts.forEach(c => {
          const v = Number(c.contract) || 0;
          if (!isNaN(v)) {
            totalContratos += v;
            total += v;
          }
        });
      }
      return { pisos, locales, alquileres, total, totalContratos };
    },
    getTrimestreData(escrituraMap, trimestreGoal, pisoValor) {
      const meses = this.MONTHS_ESCRITURA;
      const result = [];
      for (let t = 0; t < 4; t++) {
        const sum = meses.slice(t * 3, (t + 1) * 3).reduce((a, m) => a + (escrituraMap[m] || 0), 0);
        const falta = sum - trimestreGoal;
        const pisos = pisoValor > 0 ? Math.abs(falta / pisoValor) : 0;
        result.push({ trimestre: t + 1, ingresos: sum, falta, pisos });
      }
      return result;
    },
    getMonthLabel(idx) {
      return this.MONTHS[idx] + ' ' + (idx < 2 ? 2025 : 2026);
    },

    // =========================================================
    // ---------- Storage con Firestore + caché local ----------
    // =========================================================
    STORAGE_KEY: 'fincas_blanco_data_v3',

    _uid: null,
    _email: null,
    _db: null,
    _doc: null,
    _setDoc: null,
    _getDoc: null,
    _onSnapshot: null,

    // Ruta del documento compartido
    DOC_PATH: ['oficinas', 'fincas-blanco', 'data', 'main'],

    initFirestore(user) {
      const F = global.FB_FIREBASE;
      if (!F) { console.warn('Firebase no está listo'); return false; }
      this._uid = user.uid;
      this._email = (user.email || '').toLowerCase();
      this._db = F.db;
      this._doc = F.doc;
      this._setDoc = F.setDoc;
      this._getDoc = F.getDoc;
      this._onSnapshot = F.onSnapshot;
      return true;
    },

    // ¿Es este usuario escritor autorizado?
    isWriter() {
      if (!this._email) return false;
      return this.WRITERS.map(e => e.toLowerCase()).indexOf(this._email) !== -1;
    },

    loadLocal(year) {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) return null;
        const all = JSON.parse(raw);
        return all[year] || null;
      } catch (e) { return null; }
    },

    // Cargar desde Firestore (asíncrono)
    async loadFromCloud(year) {
      if (!this._db) {
        console.warn('[FB.loadFromCloud] Falta _db');
        return null;
      }
      try {
        const docRef = this._doc(this._db, ...this.DOC_PATH);
        const snap = await this._getDoc(docRef);
        // ⚠️ API COMPAT: snap.exists es PROPIEDAD, no función
        if (snap.exists) {
          const all = snap.data();
          console.log('[FB.loadFromCloud] Doc encontrado, claves:', Object.keys(all));
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
          return all[year] || null;
        }
        console.log('[FB.loadFromCloud] Doc NO existe en Firestore');
        return null;
      } catch (e) {
        console.error('[FB.loadFromCloud] Error:', e);
        return null;
      }
    },

    save(year, data) {
      // 1) Caché local
      try {
        let all = {};
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          try { all = JSON.parse(raw); } catch (e) { all = {}; }
        }
        all[year] = data;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      } catch (e) {}

      // 2) Firestore (solo si es escritor)
      if (!this.isWriter()) {
        console.warn('[FB.save] Usuario sin permisos de escritura, no se sube a Firestore');
        return;
      }
      if (this._db) {
        const docRef = this._doc(this._db, ...this.DOC_PATH);
        this._setDoc(docRef, { [year]: data }, { merge: true })
          .catch((err) => console.error('Error guardando en Firestore:', err));
      }
    },

    load(year) {
      return this.loadLocal(year);
    },

    // Suscribirse a cambios en la nube
    subscribeToCloud(onChange) {
      if (!this._db) {
        console.warn('[FB.subscribeToCloud] Falta _db');
        return;
      }
      const docRef = this._doc(this._db, ...this.DOC_PATH);
      this._onSnapshot(docRef, (snap) => {
        // ⚠️ API COMPAT: snap.exists es PROPIEDAD, no función
        if (snap.exists) {
          const all = snap.data();
          console.log('[FB.subscribeToCloud] Snapshot recibido, claves:', Object.keys(all));
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
          if (typeof onChange === 'function') onChange(all);
        } else {
          console.log('[FB.subscribeToCloud] Doc no existe todavía');
        }
      }, (err) => {
        console.error('[FB.subscribeToCloud] Error:', err);
      });
    },

    // ---------- Export / Import ----------
    exportJSON() {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) { alert('No hay datos para exportar todavía'); return; }
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fincas_blanco_backup_' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
    }
  };

  global.FB = FB;
})(window);
