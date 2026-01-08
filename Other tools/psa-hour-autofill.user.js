// ==UserScript==
// @name        Auto Fill Time Fields
// @namespace   http://tampermonkey.net/
// @version     0.2
// @description Automatically fills time fields with 8.00 on PeopleSoft-like pages
// @author      Your Name
// @match       *://psa-fs.ent.cgi.com/*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    const valueToSet = "8.00";
    const dayFields = [
        "TIME2$0",
        "TIME3$0",
        "TIME4$0",
        "TIME5$0",
        "TIME6$0"
    ];
    // ID do elemento que valida se estamos na página correta
    const pageTitleId = "EX_ICLIENT_WRK_TRANSACTION_TITLE";
    const expectedPageTitleText = "Create Time Report";

    let fieldsFilled = false; // Flag para garantir que só preenchemos uma vez

     function isValidPage() {
        const titleElement = document.getElementById(pageTitleId);
        return titleElement && titleElement.textContent.trim() === expectedPageTitleText;
    }

    function fillFields() {
        if (fieldsFilled) return; // Se já preencheu, sai

         // Validação adicional: só tenta preencher se for a página correta
        if (!isValidPage()) {
            // console.log("Auto Fill Time Fields: Não é a página de 'Create Time Report'.");
            return;
        }

        let allFieldsFound = true;
        dayFields.forEach(fieldId => {
            const inputElement = document.getElementById(fieldId);
            if (!inputElement) {
                allFieldsFound = false; // Se um campo não for encontrado, ainda não estão todos lá
            }
        });

        if (allFieldsFound) {
            dayFields.forEach(fieldId => {
                const inputElement = document.getElementById(fieldId);
                // Já verificamos se existe, mas é boa prática voltar a verificar
                if (inputElement) {
                    inputElement.value = valueToSet;
                    // Tentar simular o evento 'change'
                    if (typeof inputElement.onchange === 'function') {
                        inputElement.onchange.apply(inputElement);
                    }
                    // Considerar também chamar addchg_win0(inputElement); se a função estiver disponível
                    // e for seguro para o comportamento da página.
                    // Exemplo:
                    // if (typeof window.addchg_win0 === 'function') {
                    //     window.addchg_win0(inputElement);
                    // }
                }
            });
            console.log(`Células dos dias da semana preenchidas com '${valueToSet}'.`);
            fieldsFilled = true; // Marca como preenchido para não repetir
            // Se necessário, desconecta o observador após preencher
            // observer.disconnect();
        }
    }

    // Cria um observador para monitorizar as mudanças no DOM
    const observer = new MutationObserver((mutationsList, observer) => {
        // Para cada mudança no DOM
        for (const mutation of mutationsList) {
            // Se nodos foram adicionados ou atributos foram alterados (pode ser útil para elementos que mudam visibilidade/display)
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                fillFields(); // Tenta preencher os campos
                if (fieldsFilled) {
                    // Se já preencheu e quer que o script pare de observar, descomente a linha abaixo
                    // observer.disconnect();
                    break; // Sai do loop para não processar mais mutações desnecessariamente
                }
            }
        }
    });

    // Configura o observador para observar o body (ou outro elemento pai mais específico, se souber)
    // com opções para observar mudanças nos filhos e nos atributos (se achar que os campos são inicialmente ocultos)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Tenta preencher uma vez logo no início caso os elementos já estejam presentes (pouco provável para este caso, mas boa prática)
    fillFields();

})();