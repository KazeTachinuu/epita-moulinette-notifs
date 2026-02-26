function getSandboxIframe() {
    const iframe = document.createElement('iframe');

    iframe.sandbox.add('allow-same-origin', 'allow-popups', 'allow-scripts');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '60vh';

    return iframe;
}

function getCssLinkFor(path) {
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = path;

    return link;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop().split(';').shift();
}

class ClassWatcher {
    constructor(targetNode, classToWatch, classAddedCallback, classRemovedCallback) {
        this.targetNode = targetNode
        this.classToWatch = classToWatch
        this.classAddedCallback = classAddedCallback
        this.classRemovedCallback = classRemovedCallback
        this.observer = null
        this.lastClassState = targetNode.classList.contains(this.classToWatch)

        this.init()
    }

    init() {
        this.observer = new MutationObserver(this.mutationCallback)
        this.observe()
    }

    observe() {
        this.observer.observe(this.targetNode, {attributes: true})
    }

    disconnect() {
        this.observer.disconnect()
    }

    mutationCallback = mutationsList => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                let currentClassState = mutation.target.classList.contains(this.classToWatch)
                if (this.lastClassState !== currentClassState) {
                    this.lastClassState = currentClassState
                    if (currentClassState) {
                        this.classAddedCallback()
                    } else {
                        this.classRemovedCallback()
                    }
                }
            }
        }
    }
}

class SubjectLoader extends HTMLElement {
    constructor() {
        super();

        this._root = this.attachShadow({mode: 'open'});
        const domain = window.location.protocol + '//' + location.host + '/';
        const basePath = domain + this.getAttribute('path');
        const tenantSlug = window.location.pathname.split("/")[1];

        fetch(basePath).then(async (res) => {
            if (res.status !== 200) {
                this._root.innerHTML = `<div class="subject" style="font-size: 0.8em">Failed to load the document</div>`;
                return;
            }

            let html = await res.text();
            const iframe = getSandboxIframe();

            if (html.indexOf('<html') !== -1) {
                iframe.src = basePath;
            } else {
                iframe.onload = () => {
                    iframe.contentDocument.head.appendChild(getCssLinkFor('/assets/css/style.css'));
                    iframe.contentDocument.head.appendChild(getCssLinkFor('/assets/css/subject.css'));
                    iframe.contentDocument.head.appendChild(getCssLinkFor(`/${tenantSlug}/css`));

                    const base = document.createElement('base');
                    base.target = '_blank';
                    iframe.contentDocument.head.appendChild(base);

                    iframe.contentDocument.body.classList.add(
                        getCookie('theme') ?? 'dark',
                        'sandbox-embedded'
                    );

                    iframe.contentDocument.body.innerHTML = html;
                }
            }

            new ClassWatcher(
                document.body,
                'dark',
                () => {
                    iframe.contentDocument.body.classList.add('dark');
                    iframe.contentDocument.body.classList.remove('light');
                },
                () => {
                    iframe.contentDocument.body.classList.add('light');
                    iframe.contentDocument.body.classList.remove('dark');
                }
            );


            this._root.appendChild(iframe);
        });
    }
}


const timerSvg = `<svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg" style="height: 12px; width: 12px;">
<path d="M0.708293 10.9167C0.55482 10.9167 0.426084 10.8647 0.322084 10.7607C0.218446 10.657 0.166626 10.5285 0.166626 10.375C0.166626 10.2215 0.218446 10.093 0.322084 9.98933C0.426084 9.88533 0.55482 9.83333 0.708293 9.83333H1.24996V8.20833C1.24996 7.65763 1.3787 7.1407 1.63617 6.65754C1.89328 6.17473 2.25204 5.78888 2.71246 5.49999C2.25204 5.21111 1.89328 4.82508 1.63617 4.34191C1.3787 3.85911 1.24996 3.34236 1.24996 2.79166V1.16666H0.708293C0.55482 1.16666 0.426084 1.11466 0.322084 1.01066C0.218446 0.907023 0.166626 0.778467 0.166626 0.624995C0.166626 0.471523 0.218446 0.342787 0.322084 0.238787C0.426084 0.135148 0.55482 0.0833282 0.708293 0.0833282H8.29163C8.4451 0.0833282 8.57365 0.135148 8.67729 0.238787C8.78129 0.342787 8.83329 0.471523 8.83329 0.624995C8.83329 0.778467 8.78129 0.907023 8.67729 1.01066C8.57365 1.11466 8.4451 1.16666 8.29163 1.16666H7.74996V2.79166C7.74996 3.34236 7.6214 3.85911 7.36429 4.34191C7.10682 4.82508 6.74788 5.21111 6.28746 5.49999C6.74788 5.78888 7.10682 6.17473 7.36429 6.65754C7.6214 7.1407 7.74996 7.65763 7.74996 8.20833V9.83333H8.29163C8.4451 9.83333 8.57365 9.88533 8.67729 9.98933C8.78129 10.093 8.83329 10.2215 8.83329 10.375C8.83329 10.5285 8.78129 10.657 8.67729 10.7607C8.57365 10.8647 8.4451 10.9167 8.29163 10.9167H0.708293Z" fill="currentColor"/>
</svg>`

class ProjectTimer extends HTMLElement {
    constructor() {
        super();

        this._root = this.attachShadow({mode: 'open'});

        const openingAt = this.getAttribute('openingAt');
        const closingAt = this.getAttribute('closingAt');

        this.opening = new Date(openingAt);
        this.closing = new Date(closingAt);

        this.colored = this.getAttribute('colored') === 'true';

        this.render();
    }

    render() {
        const now = new Date();
        const beginString = `<div style="display: flex; align-items: center; gap: 8px">${timerSvg}`;
        const date = now < this.opening ? this.opening : this.closing;

        const diff = new Date() - date;
        let result = this.timeSince(date)

        if (diff > 0) {
            result += ' ago';
        } else if (date === this.opening) {
            result = 'In ' + result;
        } else {
            result += ' left';
        }

        this._root.innerHTML = `${beginString}${result}</div>`;
        if (this.colored) {
            this.style.color = this.getColor(date);
        }
    }

    getColor(date) {
        const diff = Math.abs(Math.floor((new Date() - date) / 1000));

        let interval = 60 * 60 * 24;
        if (diff < interval) return '#C93622';

        interval = interval * 7;
        if (diff < interval) return '#DA8017';

        interval = interval * 2;
        if (diff < interval) return '#DAC617';

        return '#61BE28';

    }

    timeSince(date) {
        const diff = new Date() - date;
        const seconds = Math.abs(Math.floor(diff / 1000));
        let interval = seconds / 31536000;

        if (interval > 1) return Math.floor(interval) + ` year${interval >= 2 ? 's' : ''}`;
        interval = seconds / 2592000;

        if (interval > 1) return Math.floor(interval) + ` month${interval >= 2 ? 's' : ''}`;
        interval = seconds / 86400;

        if (interval > 1) return Math.floor(interval) + ` day${interval >= 2 ? 's' : ''}`;
        interval = seconds / 3600;

        if (interval > 1) return Math.floor(interval) + ` hour${interval >= 2 ? 's' : ''}`;
        interval = seconds / 60;

        if (interval > 1) return Math.floor(interval) + ` minute${interval >= 2 ? 's' : ''}`;

        return Math.floor(seconds) + ` second${interval >= 2 ? 's' : ''}`;
    }

}

const groupSvg = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.99959 4.01042C3.55515 4.01042 3.17487 3.85236 2.85876 3.53625C2.54293 3.22042 2.38501 2.84028 2.38501 2.39583C2.38501 1.94444 2.54293 1.5625 2.85876 1.25C3.17487 0.9375 3.55515 0.78125 3.99959 0.78125C4.45098 0.78125 4.83293 0.9375 5.14543 1.25C5.45793 1.5625 5.61418 1.94444 5.61418 2.39583C5.61418 2.84028 5.45793 3.22042 5.14543 3.53625C4.83293 3.85236 4.45098 4.01042 3.99959 4.01042ZM0.76001 7.19792V6.09375C0.76001 5.86458 0.819038 5.65444 0.937093 5.46333C1.05515 5.2725 1.2114 5.12847 1.40584 5.03125C1.82945 4.82292 2.25834 4.66486 2.69251 4.55708C3.1264 4.44958 3.56209 4.39583 3.99959 4.39583C4.44404 4.39583 4.88154 4.44958 5.31209 4.55708C5.74265 4.66486 6.16973 4.82292 6.59334 5.03125C6.79473 5.12847 6.95279 5.2725 7.06751 5.46333C7.18195 5.65444 7.23918 5.86458 7.23918 6.09375V7.19792H0.76001Z" fill="var(--background)"/>
</svg>`

class GroupSize extends HTMLElement {
    constructor() {
        super();

        this._root = this.attachShadow({mode: 'open'});

        const size = parseInt(this.getAttribute('size'));

        let str = `${size === 1 ? 'Solo' : size}<span style="background: var(--primary-text); padding: 4px 4px; border-radius: 50px; display: flex">`;
        for (let i = 0; i < size; i++) {
            str += groupSvg;
        }
        str += '</span>';

        this._root.innerHTML = `<div style="display: flex; align-items: center; gap: 10px">${str}</div>`;
    }
}

class ProgressBar extends HTMLElement {
    constructor() {
        super();
        this._root = this.attachShadow({mode: 'open'});

        let points = parseInt(this.getAttribute('points'));
        let threshold = parseInt(this.getAttribute('threshold'));

        if (points > threshold) points = threshold;

        let width = threshold !== 0 ? points / threshold * 100 : 100;

        this._root.innerHTML = `<div style="position:relative;">
<div style="position: absolute; width: 100%; height: 5px; background-color: var(--background); border-radius: 5px"></div>
<div style="position: absolute; width: ${width}%; height: 5px; background-color: ${this.getColor(width)}; border-radius: 5px"></div>
</div>`;
    }

    getColor(value) {
        if (value === 100) {
            return '#61BE28';
        }

        value /= 10;


        const min = [201, 54, 34];
        const max = [218, 198, 23];


        let result = '#';
        for (let i = 0; i < 3; i++) {
            result += Math.round(min[i] + (max[i] - min[i]) * (value / 10)).toString(16).padStart(2, '0');
        }
        return result;
    }
}

class TraceSymbol extends HTMLElement {
    constructor() {
        super();
        this._root = this.attachShadow({mode: 'open'});

        let status = this.getAttribute("status");
        let errorStatus = this.getAttribute("errorStatus");
        let validated = this.getAttribute("validated") === "true";
        let successPercent = parseInt(this.getAttribute("successPercent"));


        if (status === "IDLE") {
            this._root.innerHTML = `<svg style="width: 25px; height: 25px" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.708293 10.9167C0.55482 10.9167 0.426084 10.8647 0.322084 10.7607C0.218446 10.657 0.166626 10.5285 0.166626 10.375C0.166626 10.2215 0.218446 10.093 0.322084 9.98933C0.426084 9.88533 0.55482 9.83333 0.708293 9.83333H1.24996V8.20833C1.24996 7.65763 1.3787 7.1407 1.63617 6.65754C1.89328 6.17473 2.25204 5.78888 2.71246 5.49999C2.25204 5.21111 1.89328 4.82508 1.63617 4.34191C1.3787 3.85911 1.24996 3.34236 1.24996 2.79166V1.16666H0.708293C0.55482 1.16666 0.426084 1.11466 0.322084 1.01066C0.218446 0.907023 0.166626 0.778467 0.166626 0.624995C0.166626 0.471523 0.218446 0.342787 0.322084 0.238787C0.426084 0.135148 0.55482 0.0833282 0.708293 0.0833282H8.29163C8.4451 0.0833282 8.57365 0.135148 8.67729 0.238787C8.78129 0.342787 8.83329 0.471523 8.83329 0.624995C8.83329 0.778467 8.78129 0.907023 8.67729 1.01066C8.57365 1.11466 8.4451 1.16666 8.29163 1.16666H7.74996V2.79166C7.74996 3.34236 7.6214 3.85911 7.36429 4.34191C7.10682 4.82508 6.74788 5.21111 6.28746 5.49999C6.74788 5.78888 7.10682 6.17473 7.36429 6.65754C7.6214 7.1407 7.74996 7.65763 7.74996 8.20833V9.83333H8.29163C8.4451 9.83333 8.57365 9.88533 8.67729 9.98933C8.78129 10.093 8.83329 10.2215 8.83329 10.375C8.83329 10.5285 8.78129 10.657 8.67729 10.7607C8.57365 10.8647 8.4451 10.9167 8.29163 10.9167H0.708293Z" fill="currentColor"/>
</svg>`;
        } else if (status === "PROCESSING") {
            this.classList.add("rotating");
            this._root.innerHTML = `<svg style="width: 25px; height: 25px" width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Received</title>
                <path d="M0.599902 13.575C0.449902 13.1583 0.337569 12.7373 0.262902 12.312C0.187569 11.8873 0.149902 11.4583 0.149902 11.025C0.149902 8.825 0.912569 6.96233 2.4379 5.437C3.96257 3.91233 5.8249 3.15 8.0249 3.15H8.2749L7.3249 2.175C7.14157 2.00833 7.0499 1.79167 7.0499 1.525C7.0499 1.25833 7.14157 1.03333 7.3249 0.850001C7.50824 0.666667 7.72924 0.575001 7.9879 0.575001C8.2459 0.575001 8.46657 0.666667 8.6499 0.850001L11.1999 3.45C11.2999 3.53333 11.3709 3.63333 11.4129 3.75C11.4542 3.86667 11.4749 3.98333 11.4749 4.1C11.4749 4.21667 11.4542 4.329 11.4129 4.437C11.3709 4.54567 11.2999 4.65 11.1999 4.75L8.6499 7.3C8.46657 7.48333 8.2459 7.575 7.9879 7.575C7.72924 7.575 7.50824 7.48333 7.3249 7.3C7.14157 7.11667 7.0499 6.89567 7.0499 6.637C7.0499 6.379 7.14157 6.15833 7.3249 5.975L8.2749 5.025H8.0249C6.35824 5.025 4.94157 5.604 3.7749 6.762C2.60824 7.92067 2.0249 9.34167 2.0249 11.025C2.0249 11.3583 2.05424 11.6833 2.1129 12C2.1709 12.3167 2.25824 12.6333 2.3749 12.95C2.44157 13.1 2.45824 13.2627 2.4249 13.438C2.39157 13.6127 2.31657 13.7583 2.1999 13.875C1.8999 14.1583 1.59157 14.2707 1.2749 14.212C0.958236 14.154 0.733235 13.9417 0.599902 13.575ZM7.3749 21.075L4.7999 18.5C4.71657 18.4 4.65424 18.296 4.6129 18.188C4.5709 18.0793 4.5499 17.9667 4.5499 17.85C4.5499 17.7167 4.5709 17.5957 4.6129 17.487C4.65424 17.379 4.71657 17.2833 4.7999 17.2L7.3749 14.625C7.55824 14.4417 7.77924 14.35 8.0379 14.35C8.2959 14.35 8.51657 14.4417 8.6999 14.625C8.88323 14.8083 8.9749 15.0293 8.9749 15.288C8.9749 15.546 8.88323 15.7667 8.6999 15.95L7.7249 16.925H7.9749C9.65824 16.925 11.0792 16.3417 12.2379 15.175C13.3959 14.0083 13.9749 12.5917 13.9749 10.925C13.9749 10.5917 13.9459 10.2667 13.8879 9.95C13.8292 9.63333 13.7416 9.30833 13.6249 8.975C13.5749 8.825 13.5666 8.66667 13.5999 8.5C13.6332 8.33333 13.7082 8.19167 13.8249 8.075C14.1082 7.775 14.4126 7.65833 14.7379 7.725C15.0626 7.79167 15.2832 8 15.3999 8.35C15.5499 8.76667 15.6626 9.19167 15.7379 9.625C15.8126 10.0583 15.8499 10.4917 15.8499 10.925C15.8499 13.1083 15.0916 14.9667 13.5749 16.5C12.0582 18.0333 10.1916 18.8 7.9749 18.8H7.7249L8.6999 19.75C8.86657 19.9333 8.9499 20.1583 8.9499 20.425C8.9499 20.6917 8.86657 20.9083 8.6999 21.075C8.51657 21.2583 8.2959 21.35 8.0379 21.35C7.77924 21.35 7.55824 21.2583 7.3749 21.075Z"
                  fill="currentColor"/>
            </svg>`;
        } else if (status === "ERROR") {
            if (errorStatus === "QUOTA_EXCEEDED") {
                this._root.innerHTML = `<div style="color: ${this.getColor(0)}"><svg <svg style="width: 25px; height: 25px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>Quota exceeded</title>
                <circle cx="256" cy="256" r="208" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/>
                <path fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" d="M108.92 108.92l294.16 294.16"/>
            </svg></div>`;
            } else if (errorStatus === "NOT_ACCESSIBLE") {
                this._root.innerHTML = `<div style="color: ${this.getColor(0)}"><svg style="width: 25px; height: 25px" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Git Pull Request</title>
<circle cx="128" cy="416" r="48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M128 144v224M288 160l-64-64 64-64"/>
<circle cx="128" cy="96" r="48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
<circle cx="384" cy="416" r="48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
<path d="M240 96h84a60 60 0 0160 60v212" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
</svg></div>`;
            } else {
                this._root.innerHTML = `<div style="color: ${this.getColor(0)}"><svg style="width: 25px; height: 25px" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Failed</title>
                    <path d="M256 80c-8.66 0-16.58 7.36-16 16l8 216a8 8 0 008 8h0a8 8 0 008-8l8-216c.58-8.64-7.34-16-16-16z" fill="none" stroke="currentColor"
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
                    <circle cx="256" cy="416" r="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
                </svg></div>`;
            }
        } else if (validated) {
            this._root.innerHTML = `<div style="color: var(--checkmark); margin-top: 2px;"><svg style="width: 20px; height: 20px" width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Published</title>
                            <path d="M2.92432 8.30849C2.45957 7.79801 1.66898 7.76093 1.15849 8.22568C0.648006 8.69043 0.610929 9.48102 1.07568 9.99151L2.92432 8.30849ZM6.54739 14.1449L5.62307 14.9864L5.62307 14.9864L6.54739 14.1449ZM8.0597 14.1063L7.09363 13.313L7.09363 13.3131L8.0597 14.1063ZM18.9661 2.79323C19.4042 2.25968 19.3268 1.47202 18.7932 1.03393C18.2597 0.595843 17.472 0.673227 17.0339 1.20677L18.9661 2.79323ZM1.07568 9.99151L5.62307 14.9864L7.47171 13.3034L2.92432 8.30849L1.07568 9.99151ZM9.02577 14.8995L18.9661 2.79323L17.0339 1.20677L7.09363 13.313L9.02577 14.8995ZM5.62307 14.9864C6.54661 16.0008 8.15521 15.9598 9.02577 14.8995L7.09363 13.3131C7.19036 13.1952 7.36909 13.1907 7.47171 13.3034L5.62307 14.9864Z"
                                  fill="currentColor"/>
                    </svg></div>`;
        } else {
            this._root.innerHTML = `<div style="color: ${this.getColor(successPercent)}">${successPercent}%</div>`;
        }

    }

    getColor(value) {
        if (value === 100) {
            return '#61BE28';
        }

        value /= 10;


        const min = [201, 54, 34];
        const max = [218, 198, 23];


        let result = '#';
        for (let i = 0; i < 3; i++) {
            result += Math.round(min[i] + (max[i] - min[i]) * (value / 10)).toString(16).padStart(2, '0');
        }
        return result;
    }
}


/**
 * @property {HTMLInputElement} input
 * @property {SpotlightItem[]} items
 * @property {SpotlightItem} activeItem
 * @property {HTMLUListElement} suggestions
 */
class Spotlight extends HTMLElement {


    constructor() {
        super();
        this.shortcutHandler = this.shortcutHandler.bind(this)
        this.hide = this.hide.bind(this)
        this.onInput = this.onInput.bind(this)
        this.inputShortcutHandler = this.inputShortcutHandler.bind(this)
        this.items = [];
        this.currentIndex = -1;

        window.fetch('/api/activities', {
            cache: "no-store"
        }).then(async (res) => {
            this.activities = (await res.json())['activities'];
        })
    }

    connectedCallback() {
        this.classList.add('spotlight')
        this.innerHTML = `
      <div class="spotlight-bar">
        <input type="text" placeholder="Search an activity">
        <ul class="spotlight-suggestions" hidden>
        </ul>
      </div>
    `;

        const spotlightBar = this.querySelector('.spotlight-bar');
        this.input = this.querySelector('input');
        this.suggestions = this.querySelector('.spotlight-suggestions')

        document.addEventListener('click', ev => {
            if (!spotlightBar.contains(ev.target)) {
                this.hide()
            }
        });

        window.addEventListener('keydown', this.shortcutHandler);
        this.input.addEventListener('input', this.onInput);
        this.input.addEventListener('keydown', this.inputShortcutHandler);
    }

    disconnectedCallback() {
        window.removeEventListener('keydown', this.shortcutHandler);
    }

    shortcutHandler(e) {
        if (e.key === 'k' && this.shortcutKey(e)) {
            e.preventDefault()
            this.classList.add('active')
            this.input.value = ''
            this.onInput()
            this.input.focus()
        }
    }

    shortcutKey(e) {
        if (navigator.platform.includes('Mac')) {
            return e.metaKey;
        }

        return e.ctrlKey;
    }

    hide() {
        this.classList.remove('active')
    }

    onInput() {
        const search = this.input.value.trim()

        if (search === '') {
            this.items = [];
            this.suggestions.setAttribute('hidden', 'hidden');
            return;
        }

        // Firstly, get data & reset content
        const matchingActivities = this.activities.filter(activity => activity.name.toLowerCase().includes(search.toLowerCase()))
        this.suggestions.innerHTML = '';
        this.items = [];
        this.currentIndex = -1;

        if (matchingActivities.length === 0) {
            this.suggestions.setAttribute('hidden', 'hidden');
        } else {
            this.suggestions.removeAttribute('hidden');
            this.suggestions.innerHTML = '';
            for (let i = 0; i < matchingActivities.length; i++) {
                const item = new SpotlightItem(matchingActivities[i].name, matchingActivities[i].href);
                this.items.push(item);
                this.suggestions.appendChild(item.element);
            }
        }
    }

    setActiveIndex(n) {
        if (n >= this.items.length) {
            n = 0
        }
        if (n < 0) {
            n = this.items.length - 1
        }

        if (this.currentIndex !== -1)
            this.items[this.currentIndex].unselect();

        this.items[n].select()
        this.currentIndex = n;
    }

    /**
     * @param {KeyboardEvent} e
     */
    inputShortcutHandler(e) {
        if (e.key === 'Escape') {
            this.hide()
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            this.setActiveIndex(this.currentIndex + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.setActiveIndex(this.currentIndex - 1);
        } else if (e.key === 'Enter') {
            if (this.currentIndex !== -1)
                this.items[this.currentIndex].follow();
        }
    }
}

/**
 * @property {HTMLLIElement} element
 * @property {string} title
 * @property {string} href
 */
class SpotlightItem {
    /**
     * @param {string} title
     * @param {string} href
     */
    constructor(title, href) {
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.setAttribute('href', href)
        a.innerText = title
        li.appendChild(a)
        this.element = li
        this.title = title
        this.href = href
    }


    hide() {
        this.element.setAttribute('hidden', 'hidden')
    }

    select() {
        this.element.classList.add('active')
    }

    unselect() {
        this.element.classList.remove('active')
    }

    follow() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('login') !== null) this.href += `?login=${params.get('login')}`
        window.location.href = this.href
    }
}


class MarkdownViewer extends HTMLElement {
    constructor() {
        super();

        this._root = this.attachShadow({mode: 'open'});
        this.content = this.getAttribute('content');
    }

    connectedCallback() {
        const converter = new showdown.Converter();
        const normalizedContent = this.content.replaceAll('\\n', '\n')
        const html = converter.makeHtml(normalizedContent); // TODO should be fixed
        const normalizedHtml = html.replaceAll('h1', 'h4')
            .replaceAll('h2', 'h5')
            .replaceAll('h3', 'h6')
        this._root.innerHTML = normalizedHtml;
    }
}

window.customElements.define('subject-loader', SubjectLoader);
window.customElements.define('project-timer', ProjectTimer);
window.customElements.define('group-size', GroupSize);
window.customElements.define('progress-bar', ProgressBar);
window.customElements.define('trace-symbol', TraceSymbol);
window.customElements.define('spotlight-bar', Spotlight)
window.customElements.define('markdown-viewer', MarkdownViewer)

window.addEventListener("pageshow", function (event) {
    const historyTraversal = event.persisted || (typeof window.performance != "undefined" && window.performance.navigation.type === 2);
    if (historyTraversal) {
        window.location.reload();
    }
});

// Manage mobile
window.addEventListener('resize', onResize);

function onResize() {
    if (window.innerWidth < 500) {
        document.querySelector("body").style.height = `${window.innerHeight}px`;
        document.querySelector("main").style.height = `${window.innerHeight - 76}px`;
    }
}

onResize();

mermaid.initialize({startOnLoad: true, theme: 'dark', maxTextSize: 500000})

function initGraph() {
    const graph = document.querySelector("#graph");

    if (graph === null) return;

    if (graph.dataset['processed'] !== "true") {
        setTimeout(initGraph, 50);
        return;
    }

    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    const impersonate = params.login !== null ? `?login=${params.login}` : ""

    document.querySelectorAll(".statediagram-state").forEach(el => {

        const resource = el.id.split('\"')[1].replaceAll("~", '-');
        const nodeRequired = resource.split("/")[0].slice("_required=".length) === "true";
        const nodeValidated = resource.split("/")[1].slice("_validated=".length) === "true";
        const nodeAccessible = resource.split("/")[2].slice("_accessible=".length) === "true";

        if (nodeRequired) {
            for (let child of el.children) {
                if (child.tagName === 'rect') {
                    child.style.stroke = 'var(--required)';
                    child.style.strokeWidth = '2px';
                }
            }
        }

        if (nodeRequired && nodeValidated) {
            for (let child of el.children) {
                if (child.tagName === 'rect') {
                    child.style.stroke = 'var(--required-validated)';
                    child.style.strokeWidth = '2px';
                    child.style.fill = 'var(--required-validated)';
                }
            }
        } else if (nodeValidated) {
            for (let child of el.children) {
                if (child.tagName === 'rect') {
                    child.style.stroke = 'var(--trivial)';
                    child.style.strokeWidth = '2px';
                    child.style.fill = 'var(--trivial)';
                }
            }
        }

        const resourcePath = nodeAccessible ?
            "href=\"/" + resource.split("/").slice(3).join("/") + impersonate + "\"" :
            `style="cursor: not-allowed; opacity: 0.3;"`;

        el.innerHTML = `<a ${resourcePath}>${el.innerHTML}</a>`;
    });

}

setTimeout(initGraph, 50);

function addGraphController() {
    const svg = document.querySelector('.statediagram');

    if (document.location.pathname.split("/").length <= 2) return;

    if (svg === null) {
        setTimeout(addGraphController, 100);
        return;
    }

    svg.setAttribute('height', Math.max(svg.clientHeight, 200) + 'px')
    svg.style.maxWidth = null

    svgPanZoom('.statediagram', {
        panEnabled: true
        , controlIconsEnabled: true
        , zoomEnabled: true
        , dblClickZoomEnabled: true
        , mouseWheelZoomEnabled: true
        , preventMouseEventsDefault: false
        , zoomScaleSensitivity: 0.2
        , minZoom: 0.5
        , maxZoom: 10
        , fit: true
        , contain: true
        , center: true
        , refreshRate: 'auto'
    });
}

setTimeout(addGraphController, 100);
