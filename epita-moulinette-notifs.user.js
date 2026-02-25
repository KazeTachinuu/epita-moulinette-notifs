// ==UserScript==
// @name         Epita Moulinette Notifs
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Desktop notifications when moulinette tags are processed on the EPITA Forge intranet.
// @author       KazeTachinuu
// @match        https://intra.forge.epita.fr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=epita.fr
// @grant        GM_notification
// ==/UserScript==

(function () {
    "use strict";

    const STORAGE_STATUS = "moulinette-notifs:status";
    const STORAGE_PROCESSED = "moulinette-notifs:processed";
    const REFRESH_INTERVAL_MS = 30_000;

    const pathname = normalizePathname(window.location.pathname);

    // --- Storage helpers ---

    function getStore(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || {};
        } catch {
            return {};
        }
    }

    function setStore(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function normalizePathname(p) {
        return p.endsWith("/") ? p : p + "/";
    }

    function isWatching() {
        return !!getStore(STORAGE_STATUS)[pathname];
    }

    function setWatching(active) {
        const store = getStore(STORAGE_STATUS);
        store[pathname] = active;
        setStore(STORAGE_STATUS, store);
    }

    function getProcessedTags() {
        return getStore(STORAGE_PROCESSED)[pathname] || [];
    }

    function markTagProcessed(tagName) {
        const store = getStore(STORAGE_PROCESSED);
        if (!store[pathname]) store[pathname] = [];
        store[pathname].push(tagName);
        setStore(STORAGE_PROCESSED, store);
    }

    // --- UI ---

    function createWatchButton(active) {
        const button = document.createElement("button");
        button.style.cssText =
            "margin-left: 8px; padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; color: white;";
        updateButtonState(button, active);
        button.addEventListener("click", toggleWatch);
        return button;
    }

    function updateButtonState(button, active) {
        button.textContent = active ? "Watching" : "Watch";
        button.style.backgroundColor = active ? "#16a34a" : "#6b7280";
    }

    function toggleWatch() {
        if (isWatching()) {
            setWatching(false);
        } else {
            setWatching(true);
        }
        window.location.reload();
    }

    // --- Tag polling ---

    function pollTags() {
        const list = document.querySelector(
            "body > main > div.body > div > div:nth-child(2) > div.list"
        );
        if (!list) return;

        list.scrollIntoView();

        const projectName =
            document.querySelector("body > main > header > h1")?.textContent ??
            "Unknown project";
        const processed = getProcessedTags();

        for (const tag of list.children) {
            const href = tag.getAttribute("href");
            if (!href?.startsWith("/") || tag.classList.contains("list__item__disabled"))
                continue;

            const tagName = tag.querySelector(".list__item__name")?.textContent;
            if (!tagName || processed.includes(tagName)) continue;

            const percent =
                tag.querySelector("trace-symbol")?.getAttribute("successpercent") ?? "?";

            GM_notification({
                text: `${projectName}: ${tagName} (${percent}%)`,
                title: "Moulinette tag processed",
            });

            markTagProcessed(tagName);
            setWatching(false);
            window.location.reload();
            return;
        }

        // No new tag found — schedule a refresh
        setTimeout(() => window.location.reload(), REFRESH_INTERVAL_MS);
    }

    // --- Init ---

    const listHeader = document.querySelector(
        "body > main > div.body > div > div:nth-child(2) > div:nth-child(5)"
    );

    if (!listHeader?.textContent.includes("Tags")) return;

    const active = isWatching();
    listHeader.appendChild(createWatchButton(active));

    if (active) pollTags();
})();
