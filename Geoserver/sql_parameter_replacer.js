// ==UserScript==
// @name         SQL Parameter Replacer
// @namespace    https://github.com/pmendeswork
// @version      0.1
// @description  Replace SQL query parameters with default values from the table on the page
// @author       Pedro Mendes [pm.mendes.work@gmail.com]
// @match        https://*/geoserver/*
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    console.log(`
__________           .___                  _____                     .___
\\______   \\ ____   __| _/______  ____     /     \\   ____   ____    __| _/____   ______
 |     ___// __ \\ / __ |\\_  __ \\/  _ \\   /  \\ /  \\_/ __ \\ /    \\  / __ |/ __ \\ /  ___/
 |    |   \\  ___// /_/ | |  | \\(  <_> ) /    Y    \\  ___/|   |  \\/ /_/ \\  ___/ \\___ \\
 |____|    \\___  >____ | |__|   \\____/  \\____|__  /\\___  >___|  /\\____ |\\___  >____  >
               \\/     \\/                        \\/     \\/     \\/      \\/    \\/     \\/
`);
    var i = 0;
    var ui = {
        DOM: {
            createElementFromHTML: (htmlString) => {
                // Create a document fragment to hold the nodes
                var fragment = document.createDocumentFragment();
                // Create a temporary div element
                var tempDiv = document.createElement('div');
                // Set the innerHTML of the div to the HTML string
                tempDiv.innerHTML = htmlString.trim();
                // Move all nodes from the div to the document fragment
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                // Return the document fragment
                return fragment;
            },
            createTopFeedback: () => {
                const page_header = document.querySelector(".page-header");
                let topFeedbackHTML = `<div id="topFeedback">
                                      <ul class="feedbackPanel">
                                        <li class="feedbackPanelINFO">
                                          <span></span>
                                        </li>
                                      </ul>
                                    </div>`;
                let topFeedback = ui.DOM.createElementFromHTML(topFeedbackHTML);
                page_header.appendChild(topFeedback);
                return topFeedback.querySelector('span');
            },
            updateTopFeedbackMessage: (message) => {
                const topFeedback = document.querySelector("#topFeedback span");
                if (topFeedback) {
                    topFeedback.textContent = message;
                }
            }

        },
        success: (message) => {
            let topFeedback = ui.DOM.createTopFeedback();
            ui.DOM.updateTopFeedbackMessage(message);
        },
        parseTable: function () {
            // Start from the label and find the nearest table
            const labelForParameters = document.querySelector('label[for="parameters"]');
            if (!labelForParameters) return;

            const parametersTable = labelForParameters.closest('div').querySelector('table');
            if (!parametersTable) return;

            return parametersTable;
        }
    }

    var geoserver_sql;

    if (document.readyState == "complete" || document.readyState == "loaded" || document.readyState == "interactive") {


        // Define the Konami Code sequence
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiCodeIndex = 0;

        // Event listener for keyboard input
        document.addEventListener('keydown', function (event) {
            // Check if the pressed key matches the current position in the Konami Code sequence
            if (event.key.toLowerCase() === konamiCode[konamiCodeIndex].toLowerCase()) {
                konamiCodeIndex++;

                // If the entire sequence is entered correctly
                if (konamiCodeIndex === konamiCode.length) {
                    executeKonamiFunction(); // Call your function here
                    konamiCodeIndex = 0; // Reset the sequence
                }
            } else {
                konamiCodeIndex = 0; // Reset the sequence if a wrong key is pressed
            }
        });

        // Function to execute when the Konami Code is entered
        function executeKonamiFunction() {
            console.log('Konami Code activated!');
            // Your custom functionality goes here
        }
        //Check if sql view
        if (isSQLView()) {
            //Check if query has params
            let hasAnyParams = ui.parseTable()?.querySelectorAll('tbody tr');
            if (hasAnyParams.length > 0) {
                parseAndSaveOriginalQuery();
                addQueryLink();
                addUrlInput();
            } else {
                alert('query has no params.')
            }


        }
    } else {
        document.addEventListener("DOMContentLoaded", function (event) {
            if (isSQLView()) {
                addQueryLink();
                addUrlInput();
            }

        });
    }

    function parseAndSaveOriginalQuery() {
        const sqlTextarea = document.querySelector('[name="sql"]');
        if (!sqlTextarea) return;

        geoserver_sql = sqlTextarea.value;
        unsafeWindow.geoserver_sql = geoserver_sql;
    }

    function generateDefineStatements(parameters) {
        let defineStatements = '';
        for (const param in parameters) {
            const paramValue = parameters[param];
            if (paramValue.includes(',')) {
                // If the parameter value contains commas, enclose it in double quotes
                defineStatements += `DEFINE ${param}="${paramValue}";\n`;
            } else {
                // Otherwise, no need for quotes
                defineStatements += `DEFINE ${param}=${paramValue};\n`;
            }
        }
        return defineStatements;
    }

    function replaceParameters(sql, parameters) {
        for (const param in parameters) {
            const regex = new RegExp(`%${param}%`, 'g');
            sql = sql.replace(regex, parameters[param]);
        }
        return sql;
    }

    function replaceWithDefineVariables(sqlQuery) {
        // Define a regular expression to match variables enclosed within %...%
        const regex = /%([^%]+)%/g;

        // Replace each matched variable with && followed by the variable name
        return sqlQuery.replace(regex, (_, variable) => `&&${variable}`);
    }


    function processSQLQuery() {
        const view_params_from_url = handleUrlInput();

        const sqlTextarea = document.querySelector('[name="sql"]');
        if (!sqlTextarea) return;

        let sqlQuery = geoserver_sql;

        // Extract parameters from SQL query
        const paramsRegex = /%([\w_]+)%/g;
        let match;
        const parameters = {};
        while (match = paramsRegex.exec(geoserver_sql)) {
            parameters[match[1]] = match[1];
        }

        // Start from the label and find the nearest table
        const labelForParameters = document.querySelector('label[for="parameters"]');
        if (!labelForParameters) return;

        const parametersTable = labelForParameters.closest('div').querySelector('table');
        if (!parametersTable) return;

        const rows = parametersTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input[type="text"]');
            let paramFromUrl = undefined;

            if (inputs.length >= 2) {
                const paramName = inputs[0].value.trim();
                const paramValue = inputs[1].value.trim();
                console.debug("DEFAULT VALUE: [" + paramName + "] " + paramValue);
                if (view_params_from_url !== undefined) {
                    // Check if paramName exists in view_params_from_url
                    paramFromUrl = view_params_from_url[paramName];
                    console.debug("URL VALUE: [" + paramName + "] " + paramFromUrl);
                }

                const valueToUse = paramFromUrl !== undefined ? paramFromUrl : paramValue;
                if (parameters.hasOwnProperty(paramName)) {
                    parameters[paramName] = valueToUse;
                }
            }
        });


        generateDefineOutput(parameters);

        sqlQuery = replaceParameters(sqlQuery, parameters);

        //const fullQuery = defineStatements + '\n' + sqlQuery;

        console.log("Processed SQL Query:", sqlQuery);
        sqlTextarea.value = sqlQuery;

        ui.success('Query processada com sucesso.');
    }

    let generateDefineOutput = (parameters) => {
        console.log('----------------------  START DEFINE ----------------------');

        const defineStatements = generateDefineStatements(parameters);
        const fullDefineScript = '\n' + defineStatements + '\n' + replaceWithDefineVariables(geoserver_sql);
        console.debug(fullDefineScript);
        copyToClipboard(fullDefineScript);
        console.log('----------------------  END DEFINE ----------------------');
    }

    function handleUrlInput() {
        var textarea = document.getElementById('query_url');

        if (textarea.value.trim() !== '') {
            console.info("[PARSING PARAMS FROM URL]");
            const params = new URLSearchParams(textarea.value.trim());
            const viewParams = params.get("viewparams");

            // Assuming 'viewParams' is already extracted, decoded, and clean the decoded viewParams by removing backslashes
            const decodedViewParams = decodeURIComponent(viewParams).replace(/\\/g, '');
            const viewParamsMap = {};

            // Split into individual key-value pairs and populate the map
            decodedViewParams.split(';').forEach(kv => {
                const [key, value] = kv.split(':');
                viewParamsMap[key] = value;
            });
            return viewParamsMap;
        }
    }

    function addUrlInput() {
        const page_header = document.querySelector(".page-header");
        let url_html_text = createTextarea(60, 20, "query_url", "query_url");
        let url_text_elem = ui.DOM.createElementFromHTML(url_html_text);
        //page_header.insertAdjacentElement('afterend', url_text_elem);

        var customElement = createDivWithElement("input", "mb-3", "Url to parse parameters from:", url_text_elem);
        page_header.insertAdjacentElement('afterend', customElement);


    }

    function addQueryLink() {

        console.log("appending");
        const labelForParameters = document.querySelector('label[for="parameters"]');
        if (!labelForParameters) return;

        const link = document.createElement('a');
        link.href = "javascript:;";
        link.id = "id1d5";
        link.innerText = "Get SQL Query With Parameters Replacement";
        link.addEventListener('click', processSQLQuery);

        //const spacing = document.createTextNode("&nbsp;&nbsp;&nbsp;&nbsp;"); // equivalent to "&nbsp;&nbsp;&nbsp;&nbsp;"
        //const spacing = document.createTextNode("\u00A0\u00A0\u00A0\u00A0 ze manel"); // equivalent to "&nbsp;&nbsp;&nbsp;&nbsp;"

        labelForParameters.insertAdjacentElement('afterend', link);
        link.insertAdjacentHTML('afterend', '&nbsp;&nbsp;&nbsp;&nbsp;');
        //link.insertAdjacentText('afterend', spacing);
    }

    const copyToClipboard = str => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText)
            return navigator.clipboard.writeText(str);
        return Promise.reject('The Clipboard API is not available.');
    };



    function isSQLView() {
        return document.getElementById("header-title").textContent === 'Edit SQL view';
    }

    function createTextarea(rows, cols, name, id) {
        return `<textarea id="${id}" rows="${rows}" cols="${cols}" name="${name}" style="width: 70%; height: 200px;"></textarea>`;
    }

    function createDivWithElement(elementType, className, labelText, innerElement) {
        // Create the outer div element
        var divElement = document.createElement("div");
        divElement.classList.add(className);

        // Create the label element
        var labelElement = document.createElement("label");
        labelElement.setAttribute("for", "name");
        labelElement.textContent = labelText;

        // Append the label to the outer div
        divElement.appendChild(labelElement);

        // Append the inner element to the outer div
        divElement.appendChild(innerElement);

        return divElement;
    }
})();