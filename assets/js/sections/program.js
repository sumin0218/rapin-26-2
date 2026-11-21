// 순서표 그리기: data/setlist.json → #setlist
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

export function renderProgram(setlist, lang, t) {
  const root = document.getElementById("setlist");
  root.textContent = "";
  let no = 0;

  setlist.parts.forEach((part, pi) => {
    const sec = el("section", "part");
    sec.setAttribute("aria-label", t("part").replace("{n}", pi + 1));

    const head = el("div", "part-head");
    head.append(el("span", "n", String(pi + 1).padStart(2, "0")), el("span", "t", t("part").replace("{n}", pi + 1)));
    sec.append(head);

    const list = el("ol", "cues");
    list.setAttribute("start", String(no + 1));
    list.style.listStyle = "none";
    list.style.padding = "0";
    list.style.margin = "0";

    part.songs.forEach((s) => {
      no += 1;
      const li = el("li", "cue");
      li.dataset.no = String(no);
      li.append(el("span", "no", String(no).padStart(2, "0")));

      const song = el("div", "song", s.title);
      if (s.credit) song.append(el("small", null, s.credit));
      li.append(song);

      const names = (s.artists || []).map((a) => (typeof a === "object" ? a[lang] ?? a.ko : a));
      li.append(el("div", "artists", names.length ? names.join(", ") : t("tba")));
      list.append(li);
    });

    sec.append(list);
    root.append(sec);
  });
}
