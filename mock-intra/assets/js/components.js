/**
 * A copy button element
 */

class CopyButton extends HTMLElement {
    constructor() {
        super();

        this.value = this.getAttribute('value');
        this.style.width = '100%';

        this.innerHTML = `<div class="gitUrl copy-button">
    <div>${this.value}</div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M408 480H184a72 72 0 01-72-72V184a72 72 0 0172-72h224a72 72 0 0172 72v224a72 72 0 01-72 72z" fill="currentColor"/>
            <path d="M160 80h235.88A72.12 72.12 0 00328 32H104a72 72 0 00-72 72v224a72.12 72.12 0 0048 67.88V160a80 80 0 0180-80z" fill="currentColor"/>
        </svg>
</div>`;

        this.querySelector("svg").addEventListener('click', () => {
            copyToClipboard(this.value);
        })
    }
}

const copyToClipboard = str => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
        return navigator.clipboard.writeText(str);
    return Promise.reject('The Clipboard API is not available.');
};

class TraceEcologicalGrade extends HTMLElement {
    constructor() {
        super();

        this.traceId = this.getAttribute('traceId');
        this.getGrade();
    }

    async getGrade() {
        const response = await fetch(`https://srvc-stats.api.forge.epita.fr/metrics/execution/` + this.traceId);

        if (response.status !== 200) {
            this.innerHTML = `<span class="badge badge-danger">Error</span>`;
            return;
        }

        const {rank, time, percentile} = await response.json();
        const colorGrade = this.getColorFromGrade(rank);

        this.innerHTML = `<div class="ecological-grade">
            <div class="ecological-grade-letter " style="background-color: ${colorGrade}">${rank}</div>
            <div class="ecological-grade-time">${this.getFormattedTime(time)} processing time</div>
        </div>`
    }

    getFormattedTime(time) {
        if (time > 1000 * 60) {
            return `${Math.floor(time / 1000 / 60)}m${Math.floor(time / 1000 % 60)}s`;
        }

        if (time > 1000) {
            return `${Math.floor(time / 1000)}s`;
        }

        return `${time}ms`;
    }

    getColorFromGrade(grade) {
        if (grade === 'A') {
            return "#019F4D";
        } else if (grade === 'B') {
            return "#5DA658";
        } else if (grade === 'C') {
            return "#A0B712";
        } else if (grade === 'D') {
            return "#C7A323";
        } else if (grade === 'E') {
            return "#C27418";
        } else if (grade === 'F') {
            return "#CD3615";
        }

        return "#ee1c25";
    }
}

class ThemeSwitcher extends HTMLElement {
    constructor() {
        super();

        this.theme = this.getAttribute('theme');
        this.body = document.querySelector('body');
        this.onclick = () => this.switchTheme();
        this.render();
    }

    switchTheme() {
        if (this.theme === 'dark') {
            this.theme = 'light';
            this.body.classList.remove('dark');
            this.body.classList.add('light');
        } else {
            this.theme = 'dark';
            this.body.classList.remove('light');
            this.body.classList.add('dark');
        }

        document.cookie = `theme=${this.theme};max-age=31536000;path=/`;

        this.render();
    }

    render() {
        if (this.theme === 'light') {
            this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M256 144C194.1 144 144 194.1 144 256c0 61.86 50.14 112 112 112s112-50.14 112-112C368 194.1 317.9 144 256 144zM256 320c-35.29 0-64-28.71-64-64c0-35.29 28.71-64 64-64s64 28.71 64 64C320 291.3 291.3 320 256 320zM256 112c13.25 0 24-10.75 24-24v-64C280 10.75 269.3 0 256 0S232 10.75 232 24v64C232 101.3 242.8 112 256 112zM256 400c-13.25 0-24 10.75-24 24v64C232 501.3 242.8 512 256 512s24-10.75 24-24v-64C280 410.8 269.3 400 256 400zM488 232h-64c-13.25 0-24 10.75-24 24s10.75 24 24 24h64C501.3 280 512 269.3 512 256S501.3 232 488 232zM112 256c0-13.25-10.75-24-24-24h-64C10.75 232 0 242.8 0 256s10.75 24 24 24h64C101.3 280 112 269.3 112 256zM391.8 357.8c-9.344-9.375-24.56-9.372-33.94 .0031s-9.375 24.56 0 33.93l45.25 45.28c4.672 4.688 10.83 7.031 16.97 7.031s12.28-2.344 16.97-7.031c9.375-9.375 9.375-24.56 0-33.94L391.8 357.8zM120.2 154.2c4.672 4.688 10.83 7.031 16.97 7.031S149.5 158.9 154.2 154.2c9.375-9.375 9.375-24.56 0-33.93L108.9 74.97c-9.344-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94L120.2 154.2zM374.8 161.2c6.141 0 12.3-2.344 16.97-7.031l45.25-45.28c9.375-9.375 9.375-24.56 0-33.94s-24.59-9.375-33.94 0l-45.25 45.28c-9.375 9.375-9.375 24.56 0 33.93C362.5 158.9 368.7 161.2 374.8 161.2zM120.2 357.8l-45.25 45.28c-9.375 9.375-9.375 24.56 0 33.94c4.688 4.688 10.83 7.031 16.97 7.031s12.3-2.344 16.97-7.031l45.25-45.28c9.375-9.375 9.375-24.56 0-33.93S129.6 348.4 120.2 357.8z"
                      fill="currentColor"/>
            </svg>`;
        }

        if (this.theme === 'dark') {
            this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"
                fill="currentColor"/>
            </svg>`;
        }
    }
}

const errorSvg = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.0386 14.0385C13.8029 14.2742 13.5122 14.3921 13.1665 14.3921C12.8208 14.3921 12.5223 14.2664 12.2708 14.0149L7.62751 9.37161L2.96061 14.0385C2.7249 14.2742 2.4342 14.3921 2.08851 14.3921C1.74281 14.3921 1.44426 14.2664 1.19284 14.0149C0.957138 13.7792 0.839287 13.4885 0.839286 13.1428C0.839286 12.7971 0.957138 12.5065 1.19284 12.2707L5.85974 7.60384L1.19284 2.93694C0.957137 2.70124 0.839287 2.41054 0.839286 2.06484C0.839287 1.71914 0.957138 1.42844 1.19284 1.19274C1.44426 0.941326 1.74281 0.815618 2.08851 0.815618C2.43421 0.815618 2.7249 0.933469 2.96061 1.16917L7.62751 5.83608L12.2708 1.19274C12.5223 0.941326 12.8208 0.815619 13.1665 0.815619C13.5122 0.815618 13.8029 0.933469 14.0386 1.16917C14.29 1.42059 14.4157 1.71914 14.4157 2.06484C14.4157 2.41054 14.29 2.70909 14.0386 2.96051L9.39528 7.60384L14.0386 12.2472C14.29 12.4986 14.4157 12.7971 14.4157 13.1428C14.4157 13.4885 14.29 13.7871 14.0386 14.0385Z" fill="#A93E10"/>
</svg>`;
const successSvg = `<svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.92432 8.30849C2.45957 7.79801 1.66898 7.76093 1.15849 8.22568C0.648006 8.69043 0.610929 9.48102 1.07568 9.99151L2.92432 8.30849ZM6.54739 14.1449L5.62307 14.9864L5.62307 14.9864L6.54739 14.1449ZM8.0597 14.1063L7.09363 13.313L7.09363 13.3131L8.0597 14.1063ZM18.9661 2.79323C19.4042 2.25968 19.3268 1.47202 18.7932 1.03393C18.2597 0.595843 17.472 0.673227 17.0339 1.20677L18.9661 2.79323ZM1.07568 9.99151L5.62307 14.9864L7.47171 13.3034L2.92432 8.30849L1.07568 9.99151ZM9.02577 14.8995L18.9661 2.79323L17.0339 1.20677L7.09363 13.313L9.02577 14.8995ZM5.62307 14.9864C6.54661 16.0008 8.15521 15.9598 9.02577 14.8995L7.09363 13.3131C7.19036 13.1952 7.36909 13.1907 7.47171 13.3034L5.62307 14.9864Z" fill="#61BE28"/>
</svg>`

/**
 * @type {HTMLDivElement}
 */
let currentTestElement = null;

class TraceTree {
    /** @type {TraceTree[]} */
    nodes = [];

    testCount = 0;
    successTestCount = 0;

    constructor(testName, failures) {
        this.testName = testName;
        this.failures = failures;
    }

    /**
     * Add a new node to the tree
     * @param testName {string}
     * @param path {string[]}
     * @param failures {{message: string, text: string}[]}
     */
    addNode(testName, path, failures) {
        this.successTestCount += !failures?.length;
        this.testCount++;

        if (path.length === 0) {
            this.nodes.push(new TraceTree(testName, failures));
        } else {
            let node = this.findNode(path[0]);
            node.addNode(testName, path.slice(1), failures);
        }
    }

    /**
     * Find a node or return a new one
     * @param nodeName {string}
     */
    findNode(nodeName) {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].testName === nodeName) {
                return this.nodes[i];
            }
        }

        let node = new TraceTree(nodeName, null);
        this.nodes.push(node);
        return node;
    }

    /**
     * Format the index to be 2 digits to prevent index overlap
     * @param index {number} index to format
     * @returns {string} formatted index
     */
    formatIndex(index) {
        return '-' + index.toString();
    }

    render(parent) {
        if (this.nodes.length === 0) {
            return `<div class="test__item__name" id="test-${parent}">${this.testName} ${this.failures?.length ? errorSvg : successSvg}</div>`;
        } else {
            let html = `<div>`;
            if (this.testName !== undefined) {
                html = `<div class="test__category__name" id="category-${parent}">
                            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.9998 6.97498C5.86647 6.97498 5.73747 6.94998 5.6128 6.89998C5.48747 6.84998 5.38314 6.78332 5.2998 6.69998L0.699804 2.09998C0.516471 1.91665 0.424805 1.68332 0.424805 1.39998C0.424805 1.11665 0.516471 0.883317 0.699804 0.699984C0.883138 0.51665 1.11647 0.424984 1.3998 0.424984C1.68314 0.424984 1.91647 0.51665 2.0998 0.699984L5.9998 4.59998L9.8998 0.699984C10.0831 0.51665 10.3165 0.424984 10.5998 0.424984C10.8831 0.424984 11.1165 0.51665 11.2998 0.699984C11.4831 0.883317 11.5748 1.11665 11.5748 1.39998C11.5748 1.68332 11.4831 1.91665 11.2998 2.09998L6.6998 6.69998C6.5998 6.79998 6.49147 6.87065 6.3748 6.91198C6.25814 6.95398 6.13314 6.97498 5.9998 6.97498Z"
                            fill="currentColor"/>
                            </svg>
                          ${this.testName}
                          ${this.testCount !== this.successTestCount ? errorSvg : successSvg}
                          <span> - ${this.successTestCount} / ${this.testCount}</span>
                        </div>
                        <div class="test__category">`;
            }

            html += `<div>`;
            if (this.testName !== undefined) {
                for (let i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].nodes.length !== 0 && i !== 0) continue;

                    html += `<div class="test__delimiter" style="${i === 0 ? 'height: 12px' : ''}"></div>`;
                }
            }
            html += `</div><div>`;

            for (let i = 0; i < this.nodes.length; i++) {
                html += this.nodes[i].render(parent + this.formatIndex(i));
            }

            html += '</div></div>';
            return html;
        }
    }

    registerClickListener(parent, failuresElement) {
        if (this.nodes.length === 0) {
            document.querySelector("#test-" + parent).addEventListener('click', (ev) => {
                if (currentTestElement !== null) {
                    currentTestElement.classList.toggle('test__item--active');
                }

                ev.target.classList.add("test__item--active");
                currentTestElement = ev.target;

                if (this.failures?.length) {
                    failuresElement.style.display = 'flex';

                    const content = failuresElement.querySelector('#trace-failures__content');
                    content.replaceChildren(...this.failures.map((f, i) => {
                        const failure = document.createElement('div');
                        failure.classList.add('trace-failure');
                        failure.innerHTML = `
                            <div class="trace-failure__message"></div>
                            <pre class="trace-failure__text"></pre>
                        `;
                        failure.querySelector('.trace-failure__message').innerText = f.message || 'Failure #' + i;

                        const text = failure.querySelector('.trace-failure__text');
                        text.innerText = f.text;
                        text.innerHTML = escapeAnsi(text.innerHTML);

                        return failure;
                    }));
                } else {
                    failuresElement.style.display = 'none';
                }
            });
        } else {
            for (let i = 0; i < this.nodes.length; i++) {
                this.nodes[i].registerClickListener(parent + this.formatIndex(i), failuresElement);
            }

            if (parent !== '') {
                const category = document.querySelector("#category-" + parent);
                category.addEventListener('click', () => {
                    category.classList.toggle('test__category--active');
                    /** @type {HTMLDivElement} */
                    const child = category.nextElementSibling;

                    if (child.style.display === 'none') {
                        child.style.display = 'flex';
                    } else {
                        child.style.display = 'none';
                    }
                });

                if (parent.length !== 1)
                    category.click();
            }
        }
    }
}

// Linux-like implementation
const ANSI_CODES = {
    '1': 'font-weight: bold;',
    '30': 'color: var(--ansi-black);',
    '31': 'color: var(--ansi-red);',
    '32': 'color: var(--ansi-green);',
    '33': 'color: var(--ansi-yellow);',
    '34': 'color: var(--ansi-blue);',
    '35': 'color: var(--ansi-magenta);',
    '36': 'color: var(--ansi-cyan);',
    '37': 'color: var(--ansi-white);',
    '40': 'background-color: var(--ansi-black);',
    '41': 'background-color: var(--ansi-red);',
    '42': 'background-color: var(--ansi-green);',
    '43': 'background-color: var(--ansi-yellow);',
    '44': 'background-color: var(--ansi-blue);',
    '45': 'background-color: var(--ansi-magenta);',
    '46': 'background-color: var(--ansi-cyan);',
    '47': 'background-color: var(--ansi-white);'
};

function escapeAnsi(html) {
    let match;
    let openedSpans = 0;
    while ((match = html.match(/[\ufffd\u001b]\[([0-9;]*)m/)) !== null) {
        const { index } = match;
        const [full, codes] = match;

        let toInsert = '';
        if (codes === '0') {
            for (; openedSpans > 0; openedSpans--) {
                toInsert += '</span>';
            }
        } else {
            let style = '';
            for (const code of codes.split(';')) {
                style += ANSI_CODES[code];
            }

            toInsert = `<span style="${style}">`;
            openedSpans++;
        }

        html = html.substring(0, index) + toInsert + html.substring(index + full.length);
    }

    for (; openedSpans > 0; openedSpans--) {
        html += '</span>';
    }

    return html;
}

class TraceViewer extends HTMLElement {
    constructor() {
        super();

        this._root = this.attachShadow({mode: 'open'});

        this.traceUrl = this.getAttribute('url');
        this.loadTrace();

        // listen to the upload event
        document.addEventListener('upload-trace', (ev) => {
            this.buildTraceFromXml(ev.detail.xml);
        });
    }

    async loadTrace() {
        if (this.traceUrl === null || this.traceUrl === undefined)
            return;

        const res = await window.fetch(this.traceUrl, {
            headers: {
                'Accept': 'application/json'
            },
            cache: "no-store"
        });
        const json = await res.json();

        await this.buildTraceFromJson(json);
    }

    async buildTraceFromJson(json) {
        this.tree = new TraceTree();

        for (const test of json['testcases']) {
            const path = test.className.split('.');
            this.tree.addNode(test.name, path, test.failures);
        }

        await this.render();
    }

    async buildTraceFromXml(xml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const testCases = xmlDoc.children[0].children[0].children;

        this.tree = new TraceTree();

        for (let i = 0; i < testCases.length; i++) {
            const testName = testCases[i].getAttribute('name');
            const path = testCases[i].getAttribute('classname').split('.');
            const failures = [...testCases[i].children].filter(c => c.tagName === 'failure').map(f => ({
                message: f.getAttribute('message'),
                text: f.textContent
            }));

            this.tree.addNode(testName, path, failures);
        }

        await this.render();
    }

    render() {
        const traceScore = document.querySelector('.trace__score');

        if (traceScore) {
            traceScore.innerHTML = `${this.tree.successTestCount}/${this.tree.testCount} tests passed`;
        }

        if (this.tree.testCount === this.tree.successTestCount) {
            const element = document.querySelector(".pyro");

            if (element) {
                element.style.display = "block";
                setTimeout(() => {
                    element.style.display = "none";
                }, 10000)
            }
        }

        document.querySelector('#test-list').innerHTML = this.tree.render('');
        const failures = document.querySelector("#trace-failures");

        this.tree.registerClickListener('', failures);
    }
}

class TraceUploader extends HTMLElement {
    constructor() {
        super();

        this.renderUploader();
    }

    renderUploader() {
        this.innerHTML = `<div class="uploader-zone">
            <div id="uploader-zone-upload" class="uploader-zone__container">
                <div class="uploader-zone__icon">
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 408c0 13.3-10.7 24-24 24s-24-10.7-24-24V305.9l-31 31c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l72-72c9.4-9.4 24.6-9.4 33.9 0l72 72c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-31-31V408z"
                        fill="currentColor"/>
                    </svg>
                </div>
            
                <div class="uploader-zone__text">Drop your XML file here</div>   
                <div class="uploader-zone__separator">or</div>
                <div id="uploader-zone__button">Upload file</div>
            </div>
            
            <div id="uploader-zone-loading" class="uploader-zone__container rotating" style="display: none">
                <svg viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Received</title>
                    <path d="M0.599902 13.575C0.449902 13.1583 0.337569 12.7373 0.262902 12.312C0.187569 11.8873 0.149902 11.4583 0.149902 11.025C0.149902 8.825 0.912569 6.96233 2.4379 5.437C3.96257 3.91233 5.8249 3.15 8.0249 3.15H8.2749L7.3249 2.175C7.14157 2.00833 7.0499 1.79167 7.0499 1.525C7.0499 1.25833 7.14157 1.03333 7.3249 0.850001C7.50824 0.666667 7.72924 0.575001 7.9879 0.575001C8.2459 0.575001 8.46657 0.666667 8.6499 0.850001L11.1999 3.45C11.2999 3.53333 11.3709 3.63333 11.4129 3.75C11.4542 3.86667 11.4749 3.98333 11.4749 4.1C11.4749 4.21667 11.4542 4.329 11.4129 4.437C11.3709 4.54567 11.2999 4.65 11.1999 4.75L8.6499 7.3C8.46657 7.48333 8.2459 7.575 7.9879 7.575C7.72924 7.575 7.50824 7.48333 7.3249 7.3C7.14157 7.11667 7.0499 6.89567 7.0499 6.637C7.0499 6.379 7.14157 6.15833 7.3249 5.975L8.2749 5.025H8.0249C6.35824 5.025 4.94157 5.604 3.7749 6.762C2.60824 7.92067 2.0249 9.34167 2.0249 11.025C2.0249 11.3583 2.05424 11.6833 2.1129 12C2.1709 12.3167 2.25824 12.6333 2.3749 12.95C2.44157 13.1 2.45824 13.2627 2.4249 13.438C2.39157 13.6127 2.31657 13.7583 2.1999 13.875C1.8999 14.1583 1.59157 14.2707 1.2749 14.212C0.958236 14.154 0.733235 13.9417 0.599902 13.575ZM7.3749 21.075L4.7999 18.5C4.71657 18.4 4.65424 18.296 4.6129 18.188C4.5709 18.0793 4.5499 17.9667 4.5499 17.85C4.5499 17.7167 4.5709 17.5957 4.6129 17.487C4.65424 17.379 4.71657 17.2833 4.7999 17.2L7.3749 14.625C7.55824 14.4417 7.77924 14.35 8.0379 14.35C8.2959 14.35 8.51657 14.4417 8.6999 14.625C8.88323 14.8083 8.9749 15.0293 8.9749 15.288C8.9749 15.546 8.88323 15.7667 8.6999 15.95L7.7249 16.925H7.9749C9.65824 16.925 11.0792 16.3417 12.2379 15.175C13.3959 14.0083 13.9749 12.5917 13.9749 10.925C13.9749 10.5917 13.9459 10.2667 13.8879 9.95C13.8292 9.63333 13.7416 9.30833 13.6249 8.975C13.5749 8.825 13.5666 8.66667 13.5999 8.5C13.6332 8.33333 13.7082 8.19167 13.8249 8.075C14.1082 7.775 14.4126 7.65833 14.7379 7.725C15.0626 7.79167 15.2832 8 15.3999 8.35C15.5499 8.76667 15.6626 9.19167 15.7379 9.625C15.8126 10.0583 15.8499 10.4917 15.8499 10.925C15.8499 13.1083 15.0916 14.9667 13.5749 16.5C12.0582 18.0333 10.1916 18.8 7.9749 18.8H7.7249L8.6999 19.75C8.86657 19.9333 8.9499 20.1583 8.9499 20.425C8.9499 20.6917 8.86657 20.9083 8.6999 21.075C8.51657 21.2583 8.2959 21.35 8.0379 21.35C7.77924 21.35 7.55824 21.2583 7.3749 21.075Z"
                        fill="currentColor"/>
                </svg>
            </div>
            
            
            <input type="file" id="uploader-zone__input" accept=".xml,.bin">     
        </div>`;


        const input = this.querySelector('#uploader-zone__input');
        const uploadContainer = this.querySelector('.uploader-zone__container');
        const loadingContainer = this.querySelector('#uploader-zone-loading');


        input.addEventListener('change', () => {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => this.renderTrace(reader.result);

            uploadContainer.style.display = 'none';
            loadingContainer.style.display = 'flex';

            reader.readAsText(file);
        });

        const button = this.querySelector('#uploader-zone__button');
        button.addEventListener('click', () => {
            input.click();
        });
    }

    renderTrace(xmlTrace) {
        this.innerHTML = `<div class="pyro">
            <div class="before"></div>
            <div class="after"></div>
        </div>

        <div class="stack">
            <div>
                <div class="title">
                    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.0004 20.2375C8.75595 20.2375 7.61339 19.9213 6.57272 19.289C5.53284 18.6575 4.7115 17.8361 4.10872 16.825H1.97956C1.66845 16.825 1.411 16.7181 1.20722 16.5042C1.00267 16.2903 0.900391 16.0278 0.900391 15.7167C0.900391 15.425 1.00734 15.1722 1.22122 14.9583C1.43511 14.7445 1.69761 14.6375 2.00872 14.6375H3.35039C3.29206 14.1903 3.25317 13.8014 3.23372 13.4708C3.21428 13.1403 3.20456 12.732 3.20456 12.2458H1.97956C1.66845 12.2458 1.411 12.1389 1.20722 11.925C1.00267 11.7111 0.900391 11.4486 0.900391 11.1375C0.900391 10.8458 1.00734 10.5931 1.22122 10.3792C1.43511 10.1653 1.69761 10.0583 2.00872 10.0583H3.20456C3.20456 9.5139 3.21428 9.06162 3.23372 8.70151C3.25317 8.34218 3.29206 7.98751 3.35039 7.63751H1.97956C1.66845 7.63751 1.411 7.53057 1.20722 7.31668C1.00267 7.10279 0.900391 6.84029 0.900391 6.52918C0.900391 6.23751 1.00734 5.98473 1.22122 5.77085C1.43511 5.55696 1.69761 5.45001 2.00872 5.45001H4.10872C4.38095 4.98335 4.69206 4.56023 5.04206 4.18068C5.39206 3.8019 5.79067 3.4764 6.23789 3.20418L5.12956 2.06668C4.91567 1.83335 4.81339 1.57085 4.82272 1.27918C4.83283 0.987512 4.93511 0.734735 5.12956 0.520846C5.34345 0.306957 5.60128 0.200012 5.90306 0.200012C6.20406 0.200012 6.4615 0.306957 6.67539 0.520846L8.36706 2.24168C8.81428 2.08612 9.35406 2.00835 9.98639 2.00835C10.6179 2.00835 11.1573 2.08612 11.6046 2.24168L13.3546 0.491679C13.5684 0.297234 13.8263 0.204679 14.1281 0.214012C14.4291 0.224123 14.6768 0.326401 14.8712 0.520846C15.0851 0.734735 15.1921 0.992179 15.1921 1.29318C15.1921 1.59496 15.0851 1.85279 14.8712 2.06668L13.7337 3.20418C14.1809 3.4764 14.5846 3.8019 14.9447 4.18068C15.3041 4.56023 15.6198 4.98335 15.8921 5.45001H18.0504C18.3421 5.45001 18.5902 5.55696 18.7947 5.77085C18.9985 5.98473 19.1004 6.23751 19.1004 6.52918C19.1004 6.84029 18.9934 7.10279 18.7796 7.31668C18.5657 7.53057 18.3129 7.63751 18.0212 7.63751H16.6504C16.7087 8.06529 16.7476 8.43979 16.7671 8.76101C16.7865 9.08146 16.7962 9.5139 16.7962 10.0583H18.0504C18.3421 10.0583 18.5902 10.1653 18.7947 10.3792C18.9985 10.5931 19.1004 10.8458 19.1004 11.1375C19.1004 11.4486 18.9934 11.7111 18.7796 11.925C18.5657 12.1389 18.3129 12.2458 18.0212 12.2458H16.7962C16.7962 12.732 16.7865 13.1403 16.7671 13.4708C16.7476 13.8014 16.7087 14.1903 16.6504 14.6375H18.0504C18.3421 14.6375 18.5902 14.7445 18.7947 14.9583C18.9985 15.1722 19.1004 15.425 19.1004 15.7167C19.1004 16.0278 18.9934 16.2903 18.7796 16.5042C18.5657 16.7181 18.3129 16.825 18.0212 16.825H15.8921C15.2893 17.8361 14.4679 18.6575 13.4281 19.289C12.3874 19.9213 11.2448 20.2375 10.0004 20.2375ZM8.83372 14.55H11.2254C11.5171 14.55 11.7652 14.4431 11.9697 14.2292C12.1735 14.0153 12.2754 13.7528 12.2754 13.4417C12.2754 13.15 12.1684 12.8972 11.9546 12.6833C11.7407 12.4695 11.4879 12.3625 11.1962 12.3625H8.80456C8.49345 12.3625 8.23561 12.4644 8.03106 12.6682C7.82728 12.8727 7.72539 13.1306 7.72539 13.4417C7.72539 13.7528 7.83233 14.0153 8.04622 14.2292C8.26011 14.4431 8.52261 14.55 8.83372 14.55ZM8.83372 9.94168H11.2254C11.5171 9.94168 11.7652 9.83473 11.9697 9.62085C12.1735 9.40696 12.2754 9.14446 12.2754 8.83335C12.2754 8.54168 12.1684 8.2889 11.9546 8.07501C11.7407 7.86112 11.4879 7.75418 11.1962 7.75418H8.80456C8.49345 7.75418 8.23561 7.85607 8.03106 8.05985C7.82728 8.2644 7.72539 8.52223 7.72539 8.83335C7.72539 9.14446 7.83233 9.40696 8.04622 9.62085C8.26011 9.83473 8.52261 9.94168 8.83372 9.94168Z"
                              fill="currentColor"/>
                    </svg>

                    Tests
                </div>

                <div id="test-list"></div>
            </div>

            <div id="trace-failures">
                <div class="title">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.99737 14.875C10.2658 14.875 10.4917 14.7842 10.675 14.6026C10.8583 14.4211 10.95 14.1961 10.95 13.9276C10.95 13.6592 10.8592 13.4333 10.6776 13.25C10.4961 13.0667 10.2711 12.975 10.0026 12.975C9.73421 12.975 9.50833 13.0658 9.325 13.2474C9.14167 13.4289 9.05 13.6539 9.05 13.9224C9.05 14.1908 9.14079 14.4167 9.32238 14.6C9.50394 14.7833 9.72894 14.875 9.99737 14.875ZM9.075 11H10.95V5.1H9.075V11ZM10 19.75C8.65155 19.75 7.38434 19.4936 6.19838 18.9809C5.01239 18.4682 3.98075 17.7724 3.10345 16.8934C2.22615 16.0145 1.53125 14.9826 1.01875 13.7978C0.50625 12.613 0.25 11.3471 0.25 10C0.25 8.65155 0.506358 7.38434 1.01908 6.19838C1.53179 5.01239 2.22762 3.98075 3.10658 3.10345C3.98553 2.22615 5.01739 1.53125 6.20218 1.01875C7.38698 0.50625 8.65292 0.25 10 0.25C11.3485 0.25 12.6157 0.506358 13.8016 1.01908C14.9876 1.53179 16.0193 2.22762 16.8966 3.10658C17.7739 3.98553 18.4688 5.01739 18.9813 6.20218C19.4938 7.38698 19.75 8.65292 19.75 10C19.75 11.3484 19.4936 12.6156 18.9809 13.8016C18.4682 14.9876 17.7724 16.0193 16.8934 16.8966C16.0145 17.7739 14.9826 18.4688 13.7978 18.9813C12.613 19.4938 11.3471 19.75 10 19.75ZM10 17.875C12.1917 17.875 14.0521 17.1104 15.5813 15.5813C17.1104 14.0521 17.875 12.1917 17.875 10C17.875 7.80833 17.1104 5.94792 15.5813 4.41875C14.0521 2.88958 12.1917 2.125 10 2.125C7.80833 2.125 5.94792 2.88958 4.41875 4.41875C2.88958 5.94792 2.125 7.80833 2.125 10C2.125 12.1917 2.88958 14.0521 4.41875 15.5813C5.94792 17.1104 7.80833 17.875 10 17.875Z" fill="currentColor"/>
                    </svg>

                    Failures
                </div>

                <div id="trace-failures__content">
                </div>
            </div>
        </div>
        <trace-viewer></trace-viewer>`;

        // dispatch event to update the trace-viewer with the current xml
        const event = new CustomEvent('upload-trace', {detail: {xml: xmlTrace}});
        document.dispatchEvent(event);
    }
}

const breadcrumbSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
    <path d="M342.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L274.7 256 105.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
        fill="currentColor"/>
</svg>`;

class BreadCrumb extends HTMLElement {
    constructor() {
        super();

        this.render();
    }

    render() {
        const url = new URL(window.location.href);
        const paths = url.pathname.split('/').filter(path => path !== '');
        const impersonate = url.searchParams.has('login') ? '?login=' + url.searchParams.get('login') : '';

        let currentUrl = '/';
        const breadcrumbParts = [];

        if (paths.length === 0) {
            breadcrumbParts.push('<span>Tenants</span>');
        } else {
            breadcrumbParts.push( `<a href="${currentUrl}${impersonate}">Tenants</a>`);
        }

        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            currentUrl += `${paths[i]}/`;

            if (i === 1) { // skip the root assignment group
                currentUrl += `${paths[++i]}/`;
            }

            if (i === paths.length - 1) {
                breadcrumbParts.push(`<span>${path}</span>`);
                break;
            }

            breadcrumbParts.push(`<a href="${currentUrl}${impersonate}">${path}</a>`);
        }

        const breadcrumb = breadcrumbParts.join(breadcrumbSvg);
        this.innerHTML = `<div class="breadcrumb">${breadcrumb}</div>`;
    }
}

customElements.define('copy-button', CopyButton);
customElements.define('trace-ecological-grade', TraceEcologicalGrade);
customElements.define('theme-switcher', ThemeSwitcher);
customElements.define('trace-viewer', TraceViewer);
customElements.define('trace-uploader', TraceUploader);
customElements.define('bread-crumb', BreadCrumb);
