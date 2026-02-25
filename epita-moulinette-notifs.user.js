// ==UserScript==
// @name         Epita Moulinette Notifs
// @namespace    http://tampermonkey.net/
// @version      2.0
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

    const POLL_INTERVAL = 30_000;
    const STORE_KEY = "moulinette-notifs";

    const path = location.pathname.replace(/\/?$/, "/");
    const projectName = document.querySelector("main header h1")?.textContent?.trim() ?? "Unknown";

    // --- Storage ---

    function load() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {}; }
        catch { return {}; }
    }

    function save(data) {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    }

    function getState() {
        const data = load();
        return data[path] ?? { watching: false, seen: [] };
    }

    function setState(patch) {
        const data = load();
        data[path] = { ...getState(), ...patch };
        save(data);
    }

    // --- DOM helpers ---

    function findTagsTitle() {
        for (const el of document.querySelectorAll(".body .title")) {
            if (el.textContent.includes("Tags")) return el;
        }
        return null;
    }

    function findTagList(tagsTitle) {
        return tagsTitle?.nextElementSibling?.classList.contains("list")
            ? tagsTitle.nextElementSibling
            : null;
    }

    function parseTags(list) {
        return [...list.querySelectorAll("a.list__item:not(.list__item__disabled)")].map((el) => ({
            name: el.querySelector(".list__item__name")?.textContent?.trim(),
            percent: el.querySelector("trace-symbol")?.getAttribute("successpercent"),
            status: el.querySelector("trace-symbol")?.getAttribute("status"),
        })).filter((t) => t.name);
    }

    // --- Polling ---

    let timer = null;

    async function poll(button) {
        const state = getState();
        if (!state.watching) return;

        try {
            const html = await fetch(location.href).then((r) => r.text());
            const doc = new DOMParser().parseFromString(html, "text/html");

            const title = [...doc.querySelectorAll(".body .title")].find((el) =>
                el.textContent.includes("Tags")
            );
            const list = title?.nextElementSibling;
            if (!list) return schedule(button);

            const tags = [...list.querySelectorAll("a.list__item:not(.list__item__disabled)")].map((el) => ({
                name: el.querySelector(".list__item__name")?.textContent?.trim(),
                percent: el.querySelector("trace-symbol")?.getAttribute("successpercent"),
                status: el.querySelector("trace-symbol")?.getAttribute("status"),
            })).filter((t) => t.name);

            // Also update the live DOM tag list
            const liveList = findTagList(findTagsTitle());
            if (liveList && list) liveList.innerHTML = list.innerHTML;

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

        schedule(button);
    }

    function schedule(button) {
        if (!getState().watching) return;
        updateCountdown(button, POLL_INTERVAL);
        timer = setTimeout(() => poll(button), POLL_INTERVAL);
    }

    function updateCountdown(button, remaining) {
        if (!getState().watching) return;
        const sec = Math.ceil(remaining / 1000);
        button.textContent = `Watching (${sec}s)`;
        if (remaining > 0) {
            setTimeout(() => updateCountdown(button, remaining - 1000), 1000);
        }
    }

    // --- UI ---

    function createButton(active) {
        const btn = document.createElement("button");
        btn.style.cssText = `
            margin-left: 8px; padding: 4px 14px; border: none; border-radius: 6px;
            cursor: pointer; font-size: 13px; font-weight: 500; color: white;
            transition: background-color 0.2s;
        `.replace(/\n\s*/g, " ");
        styleButton(btn, active);
        btn.addEventListener("click", () => toggle(btn));
        return btn;
    }

    function styleButton(btn, active) {
        btn.textContent = active ? "Watching" : "Watch";
        btn.style.backgroundColor = active ? "#16a34a" : "#6b7280";
    }

    function toggle(btn) {
        const watching = !getState().watching;
        setState({ watching });
        styleButton(btn, watching);

        if (watching) {
            poll(btn);
        } else {
            clearTimeout(timer);
            timer = null;
        }
    }

    // --- Init ---

    const tagsTitle = findTagsTitle();
    if (!tagsTitle) return;

    const state = getState();

    // Seed already-visible tags as seen on first watch
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

    if (state.watching) poll(btn);
})();
