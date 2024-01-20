// ==UserScript==
// @name         Google Calendar - Hide Event Titles
// @namespace   
// @version      0.1
// @description  Hide Event Titles from Google Calendar 
// @author       Pedro Mendes
// @match        *://calendar.google.com/*
// @downloadURL 
// @updateURL 
// @run-at document-idle
// ==/UserScript==

(function() {
    'use strict';
  
  
  
  function clearEventTitles() {
      var gridDiv = document.querySelectorAll('div[role="grid"]')[1];
      var buttons = gridDiv.querySelectorAll('div[role="presentation"] div[role="button"]');
      buttons.forEach(function (button) {
          button.textContent = '';
      });
  }
  
  
  // Find the li element that contains the "Lixo" span
  var lixoLi = Array.from(document.querySelectorAll('li')).find(li => li.textContent.includes('Lixo'));
  
  if (lixoLi) {
      // Clone the li element
      var newLi = lixoLi.cloneNode(true);
  
      // Remove the 'jsaction' attribute from the cloned li
      newLi.removeAttribute('jsaction');
  
      // Find the span inside the cloned li and change its text
      var span = newLi.querySelector('span[jsname="K4r5Ff"]');
      if (span) {
          span.textContent = 'Hide Labels';
      }
  
      // Add a click event listener to the new li
      newLi.addEventListener('click', clearEventTitles);
  
      // Insert the new li into the DOM, for example, after the original li
      lixoLi.parentNode.insertBefore(newLi, lixoLi.nextSibling);
  }
  
  })();