const TAG_CHEVRON_SVG = `<svg style="width: 20px; height: 20px" width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.06243 15.4375C0.867986 15.2431 0.770764 15.0139 0.770764 14.75C0.770764 14.4861 0.867986 14.2569 1.06243 14.0625L7.12493 8L1.0416 1.91667C0.847153 1.72222 0.753542 1.49306 0.760764 1.22917C0.767431 0.965278 0.867986 0.736111 1.06243 0.541667C1.25688 0.347222 1.48604 0.25 1.74993 0.25C2.01382 0.25 2.24299 0.347222 2.43743 0.541667L9.3541 7.45833C9.42354 7.54167 9.47576 7.62833 9.51076 7.71833C9.54521 7.80889 9.56243 7.90278 9.56243 8C9.56243 8.09722 9.54521 8.19083 9.51076 8.28083C9.47576 8.37139 9.42354 8.45833 9.3541 8.54167L2.4166 15.4583C2.23604 15.6528 2.01382 15.7467 1.74993 15.74C1.48604 15.7328 1.25688 15.6319 1.06243 15.4375Z" fill="currentColor"/></svg>`;

const API_ROUTES = new Set(["/api/add-tag", "/api/tags", "/api/reset"]);

interface Tag {
  name: string;
  percent: string;
  status: string;
  date: string;
}

const tags: Tag[] = [];

let tagCounter = 0;

function renderTagHTML(tag: Tag): string {
  const validated = tag.status === "SUCCEEDED" && tag.percent === "100";
  return `<a class="list__item" href="#">
    <div class="list__item__left">
        <div class="list__item__name">${tag.name}</div>
        <div class="list__item__subname" style="font-size: 11px;">Submitted on ${tag.date}</div>
    </div>
    <div class="list__item__right">
        <trace-symbol successPercent="${tag.percent}" validated="${validated}" errorStatus="" status="${tag.status}"></trace-symbol>
        <div style="height: 40px; width: 2px; background-color: var(--card-separator)"></div>
        ${TAG_CHEVRON_SVG}
    </div>
</a>`;
}

function renderTagList(): string {
  return [...tags].reverse().map(renderTagHTML).join("\n");
}

const TAG_LIST_START = '<!-- TAG_LIST_START -->';
const TAG_LIST_END = '<!-- TAG_LIST_END -->';

function injectTags(html: string): string {
  const startIdx = html.indexOf(TAG_LIST_START);
  const endIdx = html.indexOf(TAG_LIST_END);
  if (startIdx === -1 || endIdx === -1) return html;
  return html.slice(0, startIdx + TAG_LIST_START.length)
    + "\n" + renderTagList() + "\n"
    + html.slice(endIdx);
}

const indexHTML = await Bun.file(`${import.meta.dir}/index.html`).text();

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;

    // API: Add a new tag
    if (pathname === "/api/add-tag" && req.method === "POST") {
      const body = await req.json() as Partial<Tag>;
      tagCounter++;
      const tag: Tag = {
        name: body.name ?? `apping-hello_world-v${tagCounter}`,
        percent: body.percent ?? "100",
        status: body.status ?? "SUCCEEDED",
        date: body.date ?? new Date().toLocaleString("en-US", {
          month: "long", day: "numeric", year: "numeric",
          hour: "2-digit", minute: "2-digit", hour12: false,
        }).replace(",", " -"),
      };
      tags.push(tag);
      return Response.json({ ok: true, tag, total: tags.length });
    }

    // API: List tags
    if (pathname === "/api/tags") {
      return Response.json(tags);
    }

    // API: Reset tags
    if (pathname === "/api/reset" && req.method === "POST") {
      tags.length = 0;
      tagCounter = 0;
      return Response.json({ ok: true });
    }

    // Main page - inject dynamic tags
    if (pathname === "/" || pathname === "/index.html") {
      return new Response(injectTags(indexHTML), {
        headers: { "Content-Type": "text/html", "Cache-Control": "no-store" },
      });
    }

    // Catch-all for unknown API routes
    if (pathname.startsWith("/api/") && !API_ROUTES.has(pathname)) {
      return Response.json([]);
    }

    if (pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }

    // Serve the userscript from parent directory
    const filePath = pathname === "/epita-moulinette-notifs.user.js"
      ? `${import.meta.dir}/..${pathname}`
      : `${import.meta.dir}${pathname}`;

    const file = Bun.file(filePath);
    if (await file.exists()) return new Response(file);

    return new Response("Not found", { status: 404 });
  },
});

console.log("Mock intra running at http://localhost:3000");
console.log("API:");
console.log("  POST /api/add-tag  { name?, percent?, status? }");
console.log("  GET  /api/tags");
console.log("  POST /api/reset");
