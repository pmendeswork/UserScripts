// ==UserScript==
// @name         PSA TimeSheet AutoFiller ⏰
// @namespace    https://github.com/pmendeswork
// @downloadURL  https://github.com/pmendeswork/UserScripts/raw/refs/heads/master/Other%20tools/psa-hour-autofill-chrome.user.js
// @updateURL    https://github.com/pmendeswork/UserScripts/raw/refs/heads/master/Other%20tools/psa-hour-autofill-chrome.user.js
// @version      1.1
// @description  Porque a vida é curta demais para preencher timesheets manualmente! ⏰
// @author       Pedro Mendes [pm.mendes.work@gmail.com]
// @match        *://psa-fs.ent.cgi.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ⚙️ Configuração
    const CONFIG = {
        value: "8.00",
        dayFields: ["TIME2$0", "TIME3$0", "TIME4$0", "TIME5$0", "TIME6$0"],
        pageTitleId: "EX_ICLIENT_WRK_TRANSACTION_TITLE",
        expectedTitle: "Create Time Report",
        delayMs: 500 // Delay para Chrome
    };

    let fieldsFilled = false;

    // ✅ Verifica se estamos na página correta
    function isValidPage() {
        const titleElement = document.getElementById(CONFIG.pageTitleId);
        return titleElement && titleElement.textContent.trim() === CONFIG.expectedTitle;
    }

    // 🎯 Preenche um campo individual com retry
    function fillField(input, retries = 3) {
        if (!input || input.value) return false;

        try {
            // Foca no campo primeiro (importante para PeopleSoft!)
            input.focus();
            
            // Define o valor
            input.value = CONFIG.value;
            
            // Dispara eventos na ordem correta
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Chama a função do PeopleSoft se existir
            if (typeof window.addchg_win0 === 'function') {
                window.addchg_win0(input);
            }
            
            // Remove o foco
            input.blur();
            
            return true;
        } catch (e) {
            console.warn(`⚠️ Erro ao preencher ${input.id}:`, e);
            
            // Retry se falhar
            if (retries > 0) {
                setTimeout(() => fillField(input, retries - 1), 200);
            }
            return false;
        }
    }

    // 📝 Preenche todos os campos
    function fillFields() {
        if (fieldsFilled || !isValidPage()) return;

        // Verifica se todos os campos existem E estão visíveis
        const fields = CONFIG.dayFields
            .map(id => document.getElementById(id))
            .filter(field => field && !field.disabled && field.offsetParent !== null);
        
        if (fields.length !== CONFIG.dayFields.length) return;

        let filledCount = 0;
        
        // Preenche com pequeno delay entre cada campo
        fields.forEach((input, index) => {
            setTimeout(() => {
                if (fillField(input)) {
                    filledCount++;
                    
                    // Quando todos estiverem preenchidos
                    if (filledCount === fields.length) {
                        console.log(`✨ PSA AutoFiller: ${filledCount} dia(s) preenchido(s) com ${CONFIG.value}h cada. Bom trabalho! 🎉`);
                        fieldsFilled = true;
                        observer.disconnect();
                    }
                }
            }, index * 100); // 100ms entre cada campo
        });
    }

    // 👀 Observador de mudanças no DOM
    const observer = new MutationObserver(() => {
        if (!fieldsFilled) {
            // Adiciona delay para dar tempo ao PeopleSoft inicializar
            setTimeout(fillFields, CONFIG.delayMs);
        }
    });

    // 🚀 Inicialização
    function init() {
        const body = document.body;
        if (!body) {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        observer.observe(body, { 
            childList: true, 
            subtree: true 
        });

        // Primeira tentativa com delay extra para Chrome
        setTimeout(fillFields, CONFIG.delayMs * 2);
    }

    init();

})();