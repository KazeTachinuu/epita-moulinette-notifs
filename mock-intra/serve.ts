const TAG_CHEVRON_SVG = `<svg style="width: 20px; height: 20px" width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.06243 15.4375C0.867986 15.2431 0.770764 15.0139 0.770764 14.75C0.770764 14.4861 0.867986 14.2569 1.06243 14.0625L7.12493 8L1.0416 1.91667C0.847153 1.72222 0.753542 1.49306 0.760764 1.22917C0.767431 0.965278 0.867986 0.736111 1.06243 0.541667C1.25688 0.347222 1.48604 0.25 1.74993 0.25C2.01382 0.25 2.24299 0.347222 2.43743 0.541667L9.3541 7.45833C9.42354 7.54167 9.47576 7.62833 9.51076 7.71833C9.54521 7.80889 9.56243 7.90278 9.56243 8C9.56243 8.09722 9.54521 8.19083 9.51076 8.28083C9.47576 8.37139 9.42354 8.45833 9.3541 8.54167L2.4166 15.4583C2.23604 15.6528 2.01382 15.7467 1.74993 15.74C1.48604 15.7328 1.25688 15.6319 1.06243 15.4375Z" fill="currentColor"/></svg>`;

interface Tag {
  name: string;
  percent: string;
  status: string;
  date: string;
}

const tags: Tag[] = [];

let tagCounter = 0;

function renderTagHTML(tag: Tag): string {
  return `<a class="list__item" href="#">
    <div class="list__item__left">
        <div class="list__item__name">${tag.name}</div>
        <div class="list__item__subname" style="font-size: 11px;">Submitted on ${tag.date}</div>
    </div>
    <div class="list__item__right">
        <trace-symbol successPercent="${tag.percent}" validated="${tag.status === "SUCCEEDED" && tag.percent === "100"}" errorStatus="" status="${tag.status}"></trace-symbol>
        <div style="height: 40px; width: 2px; background-color: var(--card-separator)"></div>
        ${TAG_CHEVRON_SVG}
    </div>
</a>`;
}

function renderTagList(): string {
  return [...tags].reverse().map(renderTagHTML).join("\n");
}

function injectTags(html: string): string {
  // Replace the static tag list content with dynamic tags
  const tagListStart = html.indexOf('<!-- TAG_LIST_START -->');
  const tagListEnd = html.indexOf('<!-- TAG_LIST_END -->');
  if (tagListStart === -1 || tagListEnd === -1) return html;
  return html.slice(0, tagListStart + '<!-- TAG_LIST_START -->'.length)
    + "\n" + renderTagList() + "\n"
    + html.slice(tagListEnd);
}

const indexHTML = await Bun.file(`${import.meta.dir}/index.html`).text();

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // API: Add a new tag
    if (url.pathname === "/api/add-tag" && req.method === "POST") {
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
    if (url.pathname === "/api/tags") {
      return Response.json(tags);
    }

    // API: Reset tags
    if (url.pathname === "/api/reset" && req.method === "POST") {
      tags.length = 0;
      tagCounter = 0;
      return Response.json({ ok: true });
    }

    // Main page - inject dynamic tags
    let path = url.pathname === "/" ? "/index.html" : url.pathname;

    if (path === "/index.html") {
      return new Response(injectTags(indexHTML), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Catch-all for unknown API/asset routes — return empty JSON or 204 to avoid console errors
    if (url.pathname.startsWith("/api/") && url.pathname !== "/api/add-tag" && url.pathname !== "/api/tags" && url.pathname !== "/api/reset") {
      return Response.json([]);
    }

    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }

    // Serve the userscript from parent directory
    if (path === "/epita-moulinette-notifs.user.js") {
      const file = Bun.file(`${import.meta.dir}/../epita-moulinette-notifs.user.js`);
      if (await file.exists()) return new Response(file);
    }

    const file = Bun.file(`${import.meta.dir}${path}`);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response("Not found", { status: 404 });
  },
});

console.log("Mock intra running at http://localhost:3000");
console.log("API:");
console.log("  POST /api/add-tag  { name?, percent?, status? }");
console.log("  GET  /api/tags");
console.log("  POST /api/reset");
