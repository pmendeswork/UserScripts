// ==UserScript==
// @name         Geoserver: Tabelas de Zoom, Áreas & SQL Helper
// @namespace    https://github.com/pmendeswork
// @downloadURL  https://github.com/pmendeswork/UserScripts/raw/refs/heads/master/Geoserver/tabelas_zoom_ids_esquematicos.user.js
// @updateURL    https://github.com/pmendeswork/UserScripts/raw/refs/heads/master/Geoserver/tabelas_zoom_ids_esquematicos.user.js
// @version      0.7
// @description  Adiciona tabelas de escala WMS e Nome/Área + SQL placeholder-helper no canto superior direito.
// @author       Pedro Mendes
// @match        https://*/*format=application/openlayers*
// @match        http://*/*format=application/openlayers*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @resource     BOOTSTRAP_CSS https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js
// ==/UserScript==

// ——————————————————————————————
// Inject Bootstrap CSS
// ——————————————————————————————
const css = GM_getResourceText("BOOTSTRAP_CSS");
GM_addStyle(css);
GM_addStyle(`label { display: inherit !important; }`);

(function() {
    'use strict';

    // ——————————————————————————————
    // SQL template & placeholder‐helper
    // ——————————————————————————————
    const template = `SELECT
    GEO_TABLE.id AS ID,
    SCH_TABLE.id AS sch_id,
    '___GEO_TABLE___' AS collection,
    'sch' AS sch_geo,
    CASE WHEN 'sch' = 'sch' THEN SCH_TABLE.se_map_posicao ELSE GEO_TABLE.posicao END AS posicao,
    CASE WHEN 'sch' = 'sch' THEN GEO_TABLE.posicao ELSE SCH_TABLE.se_map_posicao END AS counterpart
FROM
    rede.___SW_GIS_TABLE___ SW_GIS
    JOIN rede.gsa_rwo_code_table GSA_R ON SW_GIS.rwo_code = GSA_R.rwo_code
    LEFT JOIN rede.___SCH_TABLE___ SCH_TABLE
      ON SCH_TABLE.rwo_id_3 = SW_GIS.rwo_id_3
      AND SCH_TABLE.se_history_mut_batchid IS NULL
    LEFT JOIN rede.___GEO_TABLE___ GEO_TABLE
      ON GEO_TABLE.id = SCH_TABLE.___FK_GEO___
      AND GEO_TABLE.se_history_mut_batchid IS NULL
    LEFT JOIN rede.___SCH_SOMBRA___ SCH_SOMBRA
      ON SCH_SOMBRA.id = SCH_TABLE.___FK_SOMBRA___
      AND SCH_TABLE.___FK_GEO___ IS NULL
      AND SCH_SOMBRA.se_history_mut_batchid IS NULL
WHERE
    SW_GIS.universe_id = 2
    AND SW_GIS.world_id    = 18
    AND GSA_R.table_name   = '___SCH_TABLE___';`;

    function replacePlaceholders(template, SCH_SOMBRA, GEO_TABLE, SCH_TABLE, FK_SOMBRA, FK_GEO, SW_GIS_TABLE) {
        const placeholders = {
            "___SCH_SOMBRA___":        SCH_SOMBRA,
            "___GEO_TABLE___":         GEO_TABLE,
            "___SCH_TABLE___":         SCH_TABLE,
            "SCH_TABLE.___FK_SOMBRA___": FK_SOMBRA,
            "SCH_TABLE.___FK_GEO___":    FK_GEO,
            "___SW_GIS_TABLE___":      SW_GIS_TABLE
        };
        // Escape regex metachars in keys
        const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        // Build alternation, longest keys first
        const pattern = new RegExp(
            Object.keys(placeholders)
                  .sort((a,b)=>b.length-a.length)
                  .map(k=>`\\b${escapeRegex(k)}\\b`)
                  .join('|'),
            'g'
        );
        return template.replace(pattern, m => placeholders[m]);
    }

    // ——————————————————————————————
    // WMS Zoom ↔ Scale mapping
    // ——————————————————————————————
    const tableData = [
        {zoom:0, scale:279541132.01}, {zoom:1, scale:139770566.01},
        {zoom:2, scale:69885283.00},   {zoom:3, scale:34942641.50},
        {zoom:4, scale:17471320.75},   {zoom:5, scale:8735660.38},
        {zoom:6, scale:4367830.19},    {zoom:7, scale:2183915.09},
        {zoom:8, scale:1091957.55},    {zoom:9, scale:545978.77},
        {zoom:10,scale:272989.39},     {zoom:11,scale:136494.69},
        {zoom:12,scale:68247.35},      {zoom:13,scale:34123.67},
        {zoom:14,scale:17061.84},      {zoom:15,scale:8530.92},
        {zoom:16,scale:4265.46},       {zoom:17,scale:2132.73},
        {zoom:18,scale:1066.36},       {zoom:19,scale:533.182396},
        {zoom:20,scale:266.591198},    {zoom:21,scale:133.295599}
    ];
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
    function getZoomLevelFromScale(txt) {
        const m = txt.match(/1\s*:\s*([\d.,]+)(K|M|B)?/i);
        if (!m) return null;
        let num = m[1].replace(/\./g,'').replace(',','.');
        let val = parseFloat(num);
        if (m[2]) {
            const u=m[2].toUpperCase();
            if(u==='K') val*=1e3;
            if(u==='M') val*=1e6;
            if(u==='B') val*=1e9;
        }
        return tableData.reduce((best,c)=>
            Math.abs(c.scale-val)<Math.abs(best.scale-val)?c:best
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

    // ——————————————————————————————
    // UI builder
    // ——————————————————————————————
    function buildTable(headers, rows) {
        const t = document.createElement('table');
        t.className = 'table table-sm table-bordered w-auto';
        const thead = t.createTHead();
        const hr = thead.insertRow();
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            hr.appendChild(th);
        });
        const tb = t.createTBody();
        rows.forEach(r => {
            const tr = tb.insertRow();
            headers.forEach(h => {
                const td = tr.insertCell();
                td.textContent = r[h.toLowerCase()] ?? '';
            });
        });
        return t;
    }

    function initUI() {
        const cont = document.createElement('div');
        Object.assign(cont.style, {
            position:      'fixed',
            top:           '10px',
            right:         '10px',
            zIndex:        '10000',
            backgroundColor:'white',
            padding:       '8px',
            border:        '1px solid #ddd',
            boxShadow:     '0 2px 5px rgba(0,0,0,0.1)',
            maxWidth:      '90vw'
        });

        // toggle collapse button
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary btn-sm mb-2';
        btn.type = 'button';
        btn.dataset.bsToggle = 'collapse';
        btn.dataset.bsTarget = '#tbls';
        btn.textContent = 'Mostrar Tabelas';

        // collapsible wrapper
        const collapseDiv = document.createElement('div');
        collapseDiv.className = 'collapse';
        collapseDiv.id = 'tbls';

        // scroll container
        const scroll = document.createElement('div');
        Object.assign(scroll.style, {
            maxHeight:  '60vh',
            overflowY:  'auto',
            paddingRight:'5px'
        });

        // build both tables
        const tblZoom = buildTable(
            ['Zoom','Scale'],
            tableData.map(d=>({zoom:d.zoom, scale:d.scale.toLocaleString()}))
        );
        const tblArea = buildTable(
            ['Nome','Área'],
            areaTableData.map(d=>({nome:d.nome, área:d.area}))
        );

        // flex‐row wrapper
        const row = document.createElement('div');
        row.className = 'd-flex gap-2';
        row.append(tblZoom, tblArea);

        scroll.append(row);
        collapseDiv.append(scroll);
        cont.append(btn, collapseDiv);

        // placeholder‐helper button
        const phBtn = document.createElement('button');
        phBtn.className = 'btn btn-secondary btn-sm mb-2';
        phBtn.textContent = 'Substituir SQL Placeholders';
        phBtn.onclick = () => {
            /*const vals = [
                prompt('SCH_SOMBRA','sch_transformador_at_sombra'),
                prompt('GEO_TABLE','transformador_equivalente'),
                prompt('SCH_TABLE','sch_transformador_at'),
                prompt('FK_SOMBRA','SCH_TABLE.fk_transformador_at_mt_sombra_sch'),
                prompt('FK_GEO','SCH_TABLE.fk_transformador_at_mt'),
                prompt('SW_GIS_TABLE','sw_gis_point')
            ];
            const out = replacePlaceholders(template, ...vals);
            console.log('Resultado final:', out);
            alert('Concluído! Veja o console (F12).');*/
            const questions = [
    { key: 'SCH_SOMBRA',   message: 'Insira o nome da tabela SCH_SOMBRA:',    def: 'sch_transformador_at_sombra' },
    { key: 'GEO_TABLE',    message: 'Insira o nome da tabela GEO_TABLE:',     def: 'transformador_equivalente' },
    { key: 'SCH_TABLE',    message: 'Insira o nome da tabela SCH_TABLE:',     def: 'sch_transformador_at' },
    { key: 'FK_SOMBRA',    message: 'Insira o campo FK_SOMBRA:',              def: 'SCH_TABLE.fk_transformador_at_mt_sombra_sch' },
    { key: 'FK_GEO',       message: 'Insira o campo FK_GEO:',                 def: 'SCH_TABLE.fk_transformador_at_mt' },
    { key: 'SW_GIS_TABLE', message: 'Insira o nome da tabela SW_GIS_TABLE:', def: 'sw_gis_point' }
  ];

  const answers = {};
  for (const q of questions) {
    const resp = prompt(q.message, q.def);
    if (resp === null) {
      // cancelou um prompt → sair sem fazer nada
      return;
    }
    answers[q.key] = resp;
  }

  // se chegar aqui, o utilizador respondeu a todos
  const result = replacePlaceholders(
    template,
    answers.SCH_SOMBRA,
    answers.GEO_TABLE,
    answers.SCH_TABLE,
    answers.FK_SOMBRA,
    answers.FK_GEO,
    answers.SW_GIS_TABLE
  );
  console.log('Resultado final:', result);
  alert('Substituição concluída! Veja o console (F12).');
        };
        cont.append(phBtn);

        // toggle button text
        collapseDiv.addEventListener('show.bs.collapse', () => btn.textContent = 'Esconder Tabelas');
        collapseDiv.addEventListener('hide.bs.collapse', () => btn.textContent = 'Mostrar Tabelas');

        document.body.append(cont);
    }

    // ——————————————————————————————
    // bootstrap
    // ——————————————————————————————
    initUI();
    setTimeout(updateZoomLevel,1000);
    setTimeout(()=>{
        const sd = document.getElementById('scale');
        if(sd) new MutationObserver(updateZoomLevel)
            .observe(sd, {childList:true, characterData:true, subtree:true});
    },1000);

})();
