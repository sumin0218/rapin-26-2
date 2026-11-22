// 언어: 한국어 / English / 中文
// 문구는 data/i18n/{ko,en,zh}.json 에 있어요. HTML에는 data-i18n="키"만 달면 돼요.
import { loadJSON } from "./data.js?v=11221512";

const LANGS = ["ko", "en", "zh"];
const KEY = "rapin262-lang";
let lang = "ko";
let dict = {};
let fallback = {};
const listeners = [];

function pickInitial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (LANGS.includes(saved)) return saved;
  } catch (e) { /* 저장소를 못 쓰는 브라우저 */ }
  const nav = (navigator.language || "ko").toLowerCase();
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("en")) return "en";
  return "ko";
}

export const getLang = () => lang;
export const t = (key) => dict[key] ?? fallback[key] ?? key;
export const onLangChange = (fn) => listeners.push(fn);

function apply() {
  const root = document.documentElement;
  root.lang = lang === "zh" ? "zh-CN" : lang;
  document.title = t("docTitle");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(",").forEach((pair) => {
      const [attr, key] = pair.split(":");
      el.setAttribute(attr.trim(), t(key.trim()));
    });
  });
  document.querySelectorAll(".lang [data-lang]").forEach((b) => {
    b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
  });
}

export async function setLang(next) {
  if (!LANGS.includes(next)) return;
  lang = next;
  dict = await loadJSON(`data/i18n/${lang}.json`);
  try { localStorage.setItem(KEY, lang); } catch (e) {}
  apply();
  listeners.forEach((fn) => fn(lang));
}

export async function initI18n() {
  fallback = await loadJSON("data/i18n/ko.json");
  document.querySelectorAll(".lang [data-lang]").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });
  await setLang(pickInitial());
}
