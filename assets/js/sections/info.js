// 공연 정보 채우기: HTML의 data-bind="키" 자리에 concert.json 값을 넣어요
export function renderInfo(concert, lang, t) {
  const pick = (v) => (v && typeof v === "object" ? v[lang] ?? v.ko : v);
  const values = {
    dateText: pick(concert.dateText),
    dateBig: concert.dateBig,
    dow: t("dow"),
    timeText: concert.timeText,
    venue: pick(concert.venue),
    venueMain: t("venueMain"),
    venueSub: t("venueSub"),
    admission: pick(concert.admission),
    year: String(new Date().getFullYear()),
  };
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const v = values[el.dataset.bind];
    if (v != null) el.textContent = v;
  });

  // 지도 바로가기 (네이버 지도, 카카오맵)
  const maps = document.getElementById("maps");
  maps.textContent = "";
  (concert.maps || []).forEach(({ label, url }) => {
    const a = document.createElement("a");
    a.className = "t-map"; a.href = url; a.target = "_blank"; a.rel = "noopener";
    a.textContent = t(label) + " ↗";
    maps.append(a);
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
