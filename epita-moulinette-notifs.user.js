// ==UserScript==
// @name         Epita Moulinette Notifs
// @namespace    http://tampermonkey.net/
// @version      2.4.1
// @description  Desktop notifications when moulinette tags are processed on the EPITA Forge intranet.
// @author       KazeTachinuu
// @match        https://intra.forge.epita.fr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=epita.fr
// @grant        GM_notification
// @updateURL    https://github.com/KazeTachinuu/epita-moulinette-notifs/raw/master/epita-moulinette-notifs.user.js
// @downloadURL  https://github.com/KazeTachinuu/epita-moulinette-notifs/raw/master/epita-moulinette-notifs.user.js
// ==/UserScript==

(function() {
    "use strict";

    const POLL_INTERVAL = 5_000;
    const STORE_KEY = "moulinette-notifs";
    const DEFAULT_STATE = { watching: false, seen: [] };

    let audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx || audioCtx.state === "closed") {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === "suspended") audioCtx.resume();
        return audioCtx;
    }

    const path = location.pathname.replace(/\/?$/, "/");
    const projectName = document.querySelector("main header h1")?.textContent?.trim() ?? "Unknown";

    function load() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {}; }
        catch { return {}; }
    }

    function getState() {
        return load()[path] ?? { ...DEFAULT_STATE };
    }

    function setState(patch) {
        const data = load();
        data[path] = { ...(data[path] ?? DEFAULT_STATE), ...patch };
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    }

    function playChime(success) {
        const ctx = getAudioCtx();
        const t = ctx.currentTime;
        if (success) {
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = "triangle";
                osc.frequency.value = freq;
                const onset = t + i * 0.08;
                gain.gain.setValueAtTime(0, onset);
                gain.gain.linearRampToValueAtTime(0.15, onset + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, onset + 0.5);
                osc.start(onset);
                osc.stop(onset + 0.5);
            });
        } else {
            [392, 370, 349, 311].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = "triangle";
                osc.frequency.value = freq;
                const onset = t + i * 0.15;
                gain.gain.setValueAtTime(0, onset);
                gain.gain.linearRampToValueAtTime(0.22, onset + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, onset + 0.4);
                osc.start(onset);
                osc.stop(onset + 0.4);
            });
        }
    }

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
            href: el.getAttribute("href"),
        })).filter((t) => t.name);
    }

    let generation = 0;
    let pollTimer = null;
    let countdownTimer = null;

    async function poll(button, gen) {
        if (gen !== generation || !getState().watching) return;

        try {
            const resp = await fetch(location.href);
            if (gen !== generation) return;
            const html = await resp.text();
            if (gen !== generation) return;

            const doc = new DOMParser().parseFromString(html, "text/html");
            const list = findTagList(findTagsTitle(doc));
            if (!list) return schedule(button, gen);

            const tags = parseTags(list);

            const liveList = findTagList(findTagsTitle());
            if (liveList) {
                liveList.replaceChildren(...[...list.childNodes].map((n) => document.importNode(n, true)));
            }

            const state = getState();
            let notified = false;
            let allPerfect = true;

            for (const tag of tags) {
                if (state.seen.includes(tag.name) || tag.status !== "SUCCEEDED") continue;

                const isPerfect = tag.percent === "100";

                GM_notification({
                    title: `${projectName}: ${tag.name}`,
                    text: `${tag.percent ?? "?"}% passed`,
                    onclick: tag.href ? () => window.open(new URL(tag.href, location.origin).href, "_blank") : undefined,
                });

                if (isPerfect) {
                    state.seen.push(tag.name);
                    setState({ seen: state.seen, watching: false });
                    playChime(true);
                    stopTimers();
                    applyButtonStyle(button, false);
                    return;
                }

                state.seen.push(tag.name);
                notified = true;
            }

            if (notified) {
                playChime(false);
            }
        } catch (e) {
            console.warn("[moulinette-notifs] poll failed:", e);
        }

        schedule(button, gen);
    }

    function schedule(button, gen) {
        if (gen !== generation || !getState().watching) return;
        startCountdown(button, gen, POLL_INTERVAL);
        pollTimer = setTimeout(() => poll(button, gen), POLL_INTERVAL);
    }

    function startCountdown(button, gen, remaining) {
        if (gen !== generation) return;
        button.textContent = `Watching (${Math.ceil(remaining / 1000)}s)`;
        if (remaining > 0) {
            countdownTimer = setTimeout(() => startCountdown(button, gen, remaining - 1000), 1000);
        }
    }

    function stopTimers() {
        generation++;
        clearTimeout(pollTimer);
        clearTimeout(countdownTimer);
        pollTimer = null;
        countdownTimer = null;
    }

    function createButton(active) {
        const btn = document.createElement("button");
        btn.style.cssText = [
            "margin-left: 8px",
            "padding: 4px 14px",
            "border: 1px solid var(--card-separator)",
            "border-radius: 6px",
            "cursor: pointer",
            "font-size: 13px",
            "font-weight: 500",
            "font-family: inherit",
            "transition: all 0.2s",
        ].join("; ");
        applyButtonStyle(btn, active);
        btn.addEventListener("click", () => toggle(btn));
        return btn;
    }

    function applyButtonStyle(btn, active) {
        btn.textContent = active ? "Watching" : "Watch";
        btn.style.backgroundColor = active ? "var(--green, #16a34a)" : "var(--background)";
        btn.style.color = active ? "white" : "var(--primary-text)";
    }

    function toggle(btn) {
        stopTimers();
        const watching = !getState().watching;
        setState({ watching });
        applyButtonStyle(btn, watching);
        if (watching) {
            getAudioCtx(); // warm up audio context during user gesture
            poll(btn, generation);
        }
    }

    const tagsTitle = findTagsTitle();
    if (!tagsTitle) return;

    const state = getState();

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
