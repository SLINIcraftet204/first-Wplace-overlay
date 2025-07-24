// ==UserScript==
// @name         wplace.live Overlay Tool mit Lock, Enter, Position merken
// @namespace    https://ttt-games.at/
// @version      1.3
// @description  Overlay mit Bild-URL, Q/W-Steuerung, Sperre, Position merken und Enter zum Einfügen per Linkfeld
// @author       SLINIcraftet204
// @match        *://wplace.live/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let overlayImg = null;
    let locked = false;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let lastPosition = { top: '200px', left: '200px' };
    let currentUrl = '';

    // === UI ===
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '140px';
    container.style.left = '10px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    container.style.padding = '10px';
    container.style.borderRadius = '8px';
    container.style.zIndex = 1000000;
    container.style.color = '#fff';
    container.style.fontFamily = 'sans-serif';
    container.style.fontSize = '14px';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Overlay Bild-URL';
    input.style.width = '250px';
    input.style.marginRight = '10px';

    const button = document.createElement('button');
    button.textContent = 'Bild aus Link einfügen';
    button.style.cursor = 'pointer';
    button.style.marginRight = '10px';

    const lockButton = document.createElement('button');
    lockButton.textContent = '🔒';
    lockButton.title = 'Overlay sperren/entsperren';
    lockButton.style.cursor = 'pointer';

    const helpButton = document.createElement('span');
    helpButton.textContent = '❔';
    helpButton.title = 'Q = Overlay einblenden\nW = Overlay ausblenden\n🔒 = Overlay fixieren (Sperrt das Bild auf dem Bworsertab-Level)\n🔓 = Overlay verschiebbar';
    helpButton.style.marginLeft = '8px';
    helpButton.style.cursor = 'help';

    container.appendChild(input);
    container.appendChild(button);
    container.appendChild(lockButton);
    container.appendChild(helpButton);
    document.body.appendChild(container);

    // === Bild erzeugen ===
    function createOverlay(url) {
    if (overlayImg) overlayImg.remove();

    overlayImg = document.createElement('img');
    overlayImg.src = url;
    overlayImg.style.position = 'absolute';
    overlayImg.style.top = lastPosition.top;
    overlayImg.style.left = lastPosition.left;
    overlayImg.style.opacity = '0.5';
    overlayImg.style.pointerEvents = locked ? 'none' : 'auto';
    overlayImg.style.zIndex = 100; // ausreichend hoch, aber unter UI
    overlayImg.style.cursor = locked ? 'default' : 'move';
    overlayImg.id = 'wplace-overlay';

    if (!locked) enableDrag(overlayImg);

    // In die Map einhängen statt in body
    const map = document.getElementById('map');
    if (map) {
        map.style.position = 'relative'; // sicherstellen, dass Elternposition relativ ist
        map.appendChild(overlayImg);
    } else {
        console.warn('Konnte #map nicht finden – Overlay wird im body angezeigt.');
        document.body.appendChild(overlayImg);
    }
}


    // === Bild entfernen ===
    function removeOverlay() {
        if (overlayImg) {
            lastPosition.top = overlayImg.style.top;
            lastPosition.left = overlayImg.style.left;
            overlayImg.remove();
            overlayImg = null;
        }
    }

    // === Sperren/Entsperren ===
    lockButton.addEventListener('click', () => {
        locked = !locked;
        if (overlayImg) {
            overlayImg.style.pointerEvents = locked ? 'none' : 'auto';
            overlayImg.style.cursor = locked ? 'default' : 'move';
        }
        lockButton.textContent = locked ? '🔒' : '🔓';
    });

    // === Drag & Drop ===
    function enableDrag(element) {
        element.addEventListener('mousedown', (e) => {
            if (locked) return;
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging && !locked && overlayImg) {
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;
                overlayImg.style.left = `${x}px`;
                overlayImg.style.top = `${y}px`;
                lastPosition.left = `${x}px`;
                lastPosition.top = `${y}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // === Bild einfügen aus Linkfeld ===
    function insertImageFromInput() {
        const url = input.value.trim();
        if (!url) return alert('Bitte eine Bild-URL eingeben');
        currentUrl = url;
        createOverlay(url);
    }

    // === Button + Enter-Eingabe ===
    button.addEventListener('click', insertImageFromInput);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            insertImageFromInput();
        }
    });

    // === Tastatursteuerung Q/W ===
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'q' && currentUrl) {
            createOverlay(currentUrl);
        }
        if (e.key.toLowerCase() === 'w') {
            removeOverlay();
        }
    });
})();
