// JSON 데이터 불러오기 (GitHub Pages 상대 경로 기준)
const cache = new Map();

export async function loadJSON(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const json = await res.json();
  cache.set(path, json);
  return json;
}
