const MEASURE = /(?<![\p{L}\d.,])[−-]?\d[\d.,]*\s?(?:°C|°|%|[A-Za-zΩµ][A-Za-zΩµ·/]*)(?![\p{L}\d])/gu;

export const isolate = (value) => `\u2068${value}\u2069`;

export const fill = (template, values) => template.replace(/\{(\w+)\}/g, (match, name) => (name in values ? isolate(values[name]) : match));

export const isolateMeasures = (text) => text.replace(MEASURE, (measure) => isolate(measure.replace(/\s/, "\u00a0")));

export function mapStrings(value, map) {
  if (typeof value === "string") return map(value);
  if (Array.isArray(value)) return value.map((item) => mapStrings(item, map));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapStrings(item, map)]));
  return value;
}
