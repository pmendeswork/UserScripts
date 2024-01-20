// ==UserScript==
// @name         Google Calendar - Hide Event Titles
// @namespace    https://github.com/pmendeswork
// @version      0.1
// @description  Hide Event Titles from Google Calendar
// @author       Pedro Mendes
// @match        *://calendar.google.com/*
// @downloadURL  https://github.com/pmendeswork/UserScripts/blob/master/Google/gcalendar_hide_event_titles.js
// @updateURL    https://github.com/pmendeswork/UserScripts/blob/master/Google/gcalendar_hide_event_titles.js
// ==/UserScript==

(function () {
    'use strict';

    console.log("Google Calendar - Hide Event Titles script loaded");

    // Function to clear event titles
    function clearEventTitles() {
        var gridDiv = document.querySelectorAll('div[role="grid"]')[1];
        if (gridDiv) {
            var buttons = gridDiv.querySelectorAll('div[role="presentation"] div[role="button"]');
            buttons.forEach(function (button) {
                button.textContent = '';
            });
        }
    }

    // Function to add the 'Hide Event Titles' menu option
    function addHideEventTitlesOption() {
        var templateMenuItem = Array.from(document.querySelectorAll('li')).find(li => li.textContent.includes('Lixo'));
        if (templateMenuItem) {
            var hideTitlesMenuItem = templateMenuItem.cloneNode(true);
            hideTitlesMenuItem.removeAttribute('jsaction');

            var span = hideTitlesMenuItem.querySelector('span[jsname="K4r5Ff"]');
            if (span) {
                span.textContent = 'Hide Event Titles';
            }

            hideTitlesMenuItem.addEventListener('click', clearEventTitles);
            templateMenuItem.parentNode.insertBefore(hideTitlesMenuItem, templateMenuItem.nextSibling);
            console.log("Hide Event Titles option added");
        } else {
            // Retry once more if the menu item is not found
            setTimeout(addHideEventTitlesOption, 1000);
        }
    }

    // Delay initial execution to ensure the page has loaded
    setTimeout(addHideEventTitlesOption, 2 * 1000);
})();
