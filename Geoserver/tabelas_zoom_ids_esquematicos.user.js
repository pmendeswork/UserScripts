// ==UserScript==
// @name         Tabelas de Zoom e Áreas Esquematicos
// @namespace    https://github.com/pmendeswork
// @downloadURL  https://github.com/pmendeswork/UserScripts/raw/refs/heads/master/Geoserver/tabelas_zoom_ids_esquematicos.user.js
// @updateURL    https://github.com/pmendeswork/UserScripts/raw/refs/heads/master/Geoserver/tabelas_zoom_ids_esquematicos.user.js
// @version      0.5
// @description  Adiciona uma tabela de escala WMS e uma tabela Nome/Área, ocultáveis, com botão no canto superior direito e largura automática das tabelas.
// @author       Seu Nome
// @match        https://*/*format=application/openlayers*
// @match        http://*/*format=application/openlayers*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @resource     BOOTSTRAP_CSS https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js
// ==/UserScript==
// ==/UserScript==

//
// injeta o CSS do BOOTSTRAP_CSS no page-scope
const css = GM_getResourceText("BOOTSTRAP_CSS");
GM_addStyle(css);

// (opcional) quaisquer overrides
GM_addStyle(`
  /* evita label inline-block que o Bootstrap força */
  label { display: inherit !important; }
`);

(function() {
    'use strict';

    // 1) Dados de escala WMS
    const tableData = [
        { zoom: 0, scale: 279541132.01 }, { zoom: 1, scale: 139770566.01 },
        { zoom: 2, scale: 69885283.00 },   { zoom: 3, scale: 34942641.50 },
        { zoom: 4, scale: 17471320.75 },   { zoom: 5, scale: 8735660.38 },
        { zoom: 6, scale: 4367830.19 },    { zoom: 7, scale: 2183915.09 },
        { zoom: 8, scale: 1091957.55 },    { zoom: 9, scale: 545978.77 },
        { zoom: 10, scale: 272989.39 },    { zoom: 11, scale: 136494.69 },
        { zoom: 12, scale: 68247.35 },     { zoom: 13, scale: 34123.67 },
        { zoom: 14, scale: 17061.84 },     { zoom: 15, scale: 8530.92 },
        { zoom: 16, scale: 4265.46 },      { zoom: 17, scale: 2132.73 },
        { zoom: 18, scale: 1066.36 },      { zoom: 19, scale: 533.182396 },
        { zoom: 20, scale: 266.591198 },   { zoom: 21, scale: 133.295599 }
    ];

    // 2) Dados Nome / Área
    const areaTableData = [
      { nome: 'DCDS Rede AT',                   area: '2_18' },
      { nome: 'DCDS Rede 10 DRCL AOLSB',        area: '2_3' },
      { nome: 'DCDN Rede 15 DRCN GMRPNF',       area: '3_1024' },
      { nome: 'DCDS Rede 30 DRCL MOSCAVIDE',    area: '3_1424' },
      { nome: 'DCDN Rede AT',                   area: '3_1496' },
      { nome: 'DCDN Rede 15/30 DRCM GRD',       area: '3_1557' },
      { nome: 'DCDN Rede 15 DRCP VNG',          area: '3_1656' },
      { nome: 'DCDN Rede 15 DRCP PRT',          area: '3_1699' },
      { nome: 'db_3_528',                       area: '3_1728' },
      { nome: 'DCDN Rede 15 DRCN BRG',          area: '3_1729' },
      { nome: 'DCDS Rede 15 DRCL AOSTB',        area: '3_1767' },
      { nome: 'DCDN Rede 15/30 DRCM VIS',       area: '3_1801' },
      { nome: 'DCDN Rede 15 DRCP AVR',          area: '3_1802' },
      { nome: 'DCDS Rede 30 DRCS ALT',          area: '3_1805' },
      { nome: 'DCDS Rede 15 DRCT AOCLD+AOLRA',  area: '3_1842' },
      { nome: 'DCDS Rede 06 DRCT AOPTG',        area: '3_1856' },
      { nome: 'DCDS Rede 10 DRCT AOCLD',        area: '3_1862' },
      { nome: 'DCDN Rede 15 DRCP BRZ',          area: '3_1871' },
      { nome: 'DCDS Rede 30 DRCT AOCLD+AOLRA',  area: '3_1874' },
      { nome: 'DCDS Rede 30 DRCT AOPTG+AOSTR',  area: '3_1875' },
      { nome: 'DCDS Rede 10 DRCL CARENQUE',     area: '3_1878' },
      { nome: 'DCDS Rede 15 DRCT AOPTG+AOSTR',  area: '3_1889' },
      { nome: 'DCDS Rede DRCL AOLRS',           area: '3_1890' },
      { nome: 'DCDN Rede 15 DRCN BRG_2',        area: '3_1914' },
      { nome: 'DCDS Rede 15 DRCS ALG NOVO',     area: '3_1945' },
      { nome: 'DCDN Rede 15/30 DRCN BGCVRL',    area: '3_33' },
      { nome: 'DCDS Rede 15 DRCS ALT',          area: '3_419' },
      { nome: 'DCDN Rede 15 DRCP MTS',          area: '3_438' },
      { nome: 'DCDS Rede 15 DRCS ALG',          area: '3_528' },
      { nome: 'DCDN Rede 15/30 DRCM CBR',       area: '3_76' },
      { nome: 'DCDN Rede 15/30 DRCM CTB',       area: '3_886' },
      { nome: 'db_at_geo',                      area: '' },
      { nome: 'db_mt_geo',                      area: '' },
      { nome: 'db_bt_geo',                      area: '' },
      { nome: 'db_internals',                   area: 'posto_secci_corte' },
      { nome: 'psc_atmt',                       area: '' },
      { nome: 'pt_pts',                         area: '' },
      { nome: 'subestacao',                     area: '' }
    ];

    // 3) Calcula zoom a partir de texto de escala
    function getZoomLevelFromScale(scaleValue) {
        const m = scaleValue.match(/1\s*:\s*([\d,.]+)(K|M|B)?/i);
        if (!m) return null;
        let n = parseFloat(m[1].replace(/[^\d\.]/g, ''));
        if (m[2]) {
            const u = m[2].toUpperCase();
            if (u==='K') n*=1e3;
            if (u==='M') n*=1e6;
            if (u==='B') n*=1e9;
        }
        return tableData.reduce((best,cur)=>
            Math.abs(cur.scale-n)<Math.abs(best.scale-n)?cur:best
        ,tableData[0]).zoom;
    }

    function updateZoomLevel() {
        const sd = document.getElementById('scale');
        if (!sd) return;
        const z = getZoomLevelFromScale(sd.textContent);
        let zd = document.getElementById('zoom');
        if (!zd) {
            zd = document.createElement('div');
            zd.id = 'zoom';
            sd.parentNode.insertBefore(zd, sd.nextSibling);
        }
        zd.textContent = `Zoom = ${z}`;
        zd.style.cssText = `font:${sd.style.fontSize} ${sd.style.fontFamily};margin-top:5px`;
    }

    // 4) Constrói tabela genérica com largura automática
    function buildTable(headers, rows) {
        const t = document.createElement('table');
        t.className = 'table table-sm table-bordered w-auto'; // w-auto para ajustar ao conteúdo
        const thead = t.createTHead();
        const hr = thead.insertRow();
        headers.forEach(h=>{
            const th= document.createElement('th');
            th.textContent = h;
            hr.appendChild(th);
        });
        const tb = t.createTBody();
        rows.forEach(r=>{
            const tr = tb.insertRow();
            headers.forEach(h=>{
                const cell = tr.insertCell();
                const value = r[h.toLowerCase()];
                cell.textContent = value ?? '';
                //cell.textContent = r[h.toLowerCase()]||'';
            });
        });
        return t;
    }

    // 5) Injeta Bootstrap 5 (CSS + JS bundle)


    // 6) Monta UI no canto superior direito
    function initUI() {
    // 1) container principal fixo no canto superior-direito
    const cont = document.createElement('div');
    Object.assign(cont.style, {
        position: 'fixed',
        top:      '10px',
        right:    '10px',
        zIndex:   '10000',
        backgroundColor: 'white',
        padding:  '8px',
        border:   '1px solid #ddd',
        boxShadow:'0 2px 5px rgba(0,0,0,0.1)',
        maxWidth: '90vw'    // impede ultrapassar a largura da viewport
    });

    // 2) botão para show/hide
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-sm mb-2';
    btn.type = 'button';
    btn.setAttribute('data-bs-toggle','collapse');
    btn.setAttribute('data-bs-target','#tbls');
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-controls','tbls');
    btn.textContent = 'Mostrar Tabelas';

    // 3) área colapsável
    const c = document.createElement('div');
    c.className = 'collapse';
    c.id = 'tbls';

    // 4) container scrollável
    const scroll = document.createElement('div');
    Object.assign(scroll.style, {
        maxHeight: '60vh',  // até 60% da altura da viewport
        overflowY: 'auto',
        paddingRight: '5px' // evita cortar o scrollbar
    });

    // 5) cria as duas tabelas lado a lado
    const tblZoom = buildTable(
        ['Zoom','Scale'],
        tableData.map(d => ({ zoom: d.zoom, scale: d.scale.toLocaleString() }))
    );
    const tblArea = buildTable(
        ['Nome','Área'],
        areaTableData.map(d => ({ nome: d.nome, área: d.area }))
    );

    // 6) row flex com gap
    const row = document.createElement('div');
    row.className = 'd-flex gap-2';
    row.append(tblZoom, tblArea);

    // 7) monta tudo
    scroll.appendChild(row);
    c.append(scroll);
    cont.append(btn, c);
    document.body.appendChild(cont);

    // 8) atualiza texto do botão conforme abrir/fechar
    c.addEventListener('show.bs.collapse', () => btn.textContent = 'Esconder Tabelas');
    c.addEventListener('hide.bs.collapse', () => btn.textContent = 'Mostrar Tabelas');
}


    // 7) Inicializações

    initUI();
    setTimeout(updateZoomLevel,1000);
    setTimeout(()=>{
        const sd = document.getElementById('scale');
        if (sd) new MutationObserver(updateZoomLevel)
            .observe(sd,{childList:true,characterData:true,subtree:true});
    },1000);

})();
