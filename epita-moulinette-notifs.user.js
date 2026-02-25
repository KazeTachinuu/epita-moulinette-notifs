// ==UserScript==
// @name         Epita Moulinette Notifs
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Desktop notifications when moulinette tags are processed on the EPITA Forge intranet.
// @author       KazeTachinuu
// @match        https://intra.forge.epita.fr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=epita.fr
// @grant        GM_notification
// @updateURL    https://github.com/KazeTachinuu/epita-moulinette-notifs/raw/master/epita-moulinette-notifs.user.js
// @downloadURL  https://github.com/KazeTachinuu/epita-moulinette-notifs/raw/master/epita-moulinette-notifs.user.js
// ==/UserScript==

(function () {
    "use strict";

    const POLL_INTERVAL = 5_000;
    const STORE_KEY = "moulinette-notifs";

    const path = location.pathname.replace(/\/?$/, "/");
    const projectName = document.querySelector("main header h1")?.textContent?.trim() ?? "Unknown";

    // --- Storage (single-read, atomic read-modify-write) ---

    function load() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {}; }
        catch { return {}; }
    }

    function getState() {
        return load()[path] ?? { watching: false, seen: [] };
    }

    function setState(patch) {
        const data = load();
        data[path] = { ...(data[path] ?? { watching: false, seen: [] }), ...patch };
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    }

    // --- DOM helpers ---

    function findTagsTitle(root = document) {
        return [...root.querySelectorAll(".body .title")].find((el) =>
            el.textContent.includes("Tags")
        ) ?? null;
    }

    function findTagList(tagsTitle) {
        const next = tagsTitle?.nextElementSibling;
        return next?.classList.contains("list") ? next : null;
    }

    function parseTags(list) {
        return [...list.querySelectorAll("a.list__item:not(.list__item__disabled)")].map((el) => ({
            name: el.querySelector(".list__item__name")?.textContent?.trim(),
            percent: el.querySelector("trace-symbol")?.getAttribute("successpercent"),
            status: el.querySelector("trace-symbol")?.getAttribute("status"),
        })).filter((t) => t.name);
    }

    // --- Polling (generation-guarded to prevent concurrent loops) ---

    let generation = 0;
    let pollTimer = null;
    let countdownTimer = null;

    async function poll(button, gen) {
        if (gen !== generation) return;
        if (!getState().watching) return;

        try {
            const resp = await fetch(location.href);
            if (gen !== generation) return;
            const html = await resp.text();
            if (gen !== generation) return;

            const doc = new DOMParser().parseFromString(html, "text/html");
            const list = findTagList(findTagsTitle(doc));
            if (!list) return schedule(button, gen);

            const tags = parseTags(list);

            // Safely update live DOM without innerHTML
            const liveList = findTagList(findTagsTitle());
            if (liveList) {
                while (liveList.firstChild) liveList.removeChild(liveList.firstChild);
                for (const child of list.childNodes) {
                    liveList.appendChild(document.importNode(child, true));
                }
            }

            // Re-read state fresh after async work to avoid stale seen list
            const state = getState();
            let notified = false;

            for (const tag of tags) {
                if (state.seen.includes(tag.name)) continue;
                if (tag.status !== "SUCCEEDED") continue;

                GM_notification({
                    title: `${projectName}: ${tag.name}`,
                    text: `${tag.percent ?? "?"}% passed`,
                });

                state.seen.push(tag.name);
                notified = true;
            }

            if (notified) setState({ seen: state.seen });
        } catch (e) {
            console.warn("[moulinette-notifs] poll failed:", e);
        }

        schedule(button, gen);
    }

    function schedule(button, gen) {
        if (gen !== generation) return;
        if (!getState().watching) return;
        startCountdown(button, gen, POLL_INTERVAL);
        pollTimer = setTimeout(() => poll(button, gen), POLL_INTERVAL);
    }

    function startCountdown(button, gen, remaining) {
        if (gen !== generation) return;
        const sec = Math.ceil(remaining / 1000);
        button.textContent = `Watching (${sec}s)`;
        if (remaining > 0) {
            countdownTimer = setTimeout(
                () => startCountdown(button, gen, remaining - 1000),
                1000
            );
        }
    }

    function stopTimers() {
        generation++;
        clearTimeout(pollTimer);
        clearTimeout(countdownTimer);
        pollTimer = null;
        countdownTimer = null;
    }

    // --- UI ---

    function createButton(active) {
        const btn = document.createElement("button");
        btn.style.cssText =
            "margin-left: 8px; padding: 4px 14px; border: none; border-radius: 6px; " +
            "cursor: pointer; font-size: 13px; font-weight: 500; color: white; " +
            "transition: background-color 0.2s;";
        styleButton(btn, active);
        btn.addEventListener("click", () => toggle(btn));
        return btn;
    }

    function styleButton(btn, active) {
        btn.textContent = active ? "Watching" : "Watch";
        btn.style.backgroundColor = active ? "#16a34a" : "#6b7280";
    }

    function toggle(btn) {
        stopTimers();
        const watching = !getState().watching;
        setState({ watching });
        styleButton(btn, watching);
        if (watching) poll(btn, generation);
    }

    // --- Init ---

    const tagsTitle = findTagsTitle();
    if (!tagsTitle) return;

    const state = getState();

    // Seed already-visible tags as seen on first use
    if (state.seen.length === 0) {
        const list = findTagList(tagsTitle);
        if (list) {
            const existing = parseTags(list)
                .filter((t) => t.status === "SUCCEEDED")
                .map((t) => t.name);
            if (existing.length) setState({ seen: existing });
        }
    }

    const btn = createButton(state.watching);
    tagsTitle.appendChild(btn);

    if (state.watching) poll(btn, generation);
})();
