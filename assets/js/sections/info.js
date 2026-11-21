// 공연 정보 채우기: HTML의 data-bind="키" 자리에 concert.json 값을 넣어요
export function renderInfo(concert, lang) {
  const pick = (v) => (v && typeof v === "object" ? v[lang] ?? v.ko : v);
  const values = {
    dateText: pick(concert.dateText),
    venue: pick(concert.venue),
    admission: pick(concert.admission),
    year: String(new Date().getFullYear()),
  };
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const v = values[el.dataset.bind];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll("[data-bind-href]").forEach((el) => {
    const href = concert[el.dataset.bindHref];
    if (href) el.href = href; else el.removeAttribute("href");
  });

  const links = document.getElementById("links");
  links.textContent = "";
  (concert.links || []).forEach(({ label, url }) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener"; a.textContent = pick(label);
    li.append(a); links.append(li);
  });
}
