export const isolate = (value) => `⁦${value}⁩`;

export const fill = (template, values) => template.replace(/\{(\w+)\}/g, (match, name) => (name in values ? isolate(values[name]) : match));
