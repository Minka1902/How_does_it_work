export default {
  title: "איך __TITLE__ עובד",
  summary: "משפט אחד שמספר לקורא מה הוא יבין.",
  keywords: [],
  steps: [
    { id: "overview", heading: "הרעיון", body: ["מה הקורא רואה קודם, ולמה זה חשוב."] },
    { id: "detail", heading: "המנגנון", body: ["החלק שזז, ומה התנועה שלו אומרת."] },
  ],
  figure: {
    fig: "איור 1",
    title: "__TITLE__",
    hint: "פקדים למטה",
    label: "תיאור האובייקט ומה האיור מראה.",
    readout: "הקשות: {value}",
    parts: {
      base: { name: "בסיס", body: "שורה אחת על מה שהחלק הזה עושה.", step: "overview" },
      part: { name: "חלק", body: "שורה אחת על מה שהחלק הזה עושה. הקישו עליו כדי לנסות.", step: "detail" },
    },
    keys: [{ mark: "lit", label: "החלק שהשלב הזה עוסק בו" }],
    caption: "המספרים האמיתיים שמאחורי האיור.",
  },
};
