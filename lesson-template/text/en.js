export default {
  title: "How __TITLE__ works",
  summary: "One sentence that tells the reader what they will understand.",
  keywords: [],
  steps: [
    { id: "overview", heading: "The idea", body: ["What the reader sees first, and why it matters."] },
    { id: "detail", heading: "The mechanism", body: ["The part that moves, and what its motion means."] },
  ],
  figure: {
    fig: "Fig 1",
    title: "__TITLE__",
    hint: "Controls below",
    label: "Describe the object and what the figure shows.",
    readout: "Tapped {value} times",
    parts: {
      base: { name: "Base", body: "One line on what this part does.", step: "overview" },
      part: { name: "Part", body: "One line on what this part does. Tap it to try.", step: "detail" },
    },
    keys: [{ mark: "lit", label: "The part this step is about" }],
    caption: "The true numbers behind the figure.",
  },
};
