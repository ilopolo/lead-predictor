const scoring = {
  size: { small: 10, medium: 24, large: 35, enterprise: 45 },
  budget: { exploring: 15, likely: 30, confirmed: 45 },
};

const scoreMessages = {
  hot: ["High-intent lead", "Book a discovery call within one business day."],
  warm: ["Warm opportunity", "Send a focused follow-up and suggest a next step."],
  nurture: ["Nurture this lead", "Share a useful resource and check back next week."],
};

function getIntentSignal(notes) {
  const words = ["timeline", "demo", "proposal", "decision", "urgent", "launch", "budget", "buy"];
  const matches = words.filter((word) => notes.toLowerCase().includes(word));
  return { points: Math.min(matches.length * 5, 15), matches };
}

function calculateScore({ size, budget, notes }) {
  const intent = getIntentSignal(notes || "");
  const points = {
    company: scoring.size[size],
    budget: scoring.budget[budget],
    intent: intent.points,
  };
  const total = Math.min(points.company + points.budget + points.intent, 100);
  const tier = total >= 75 ? "hot" : total >= 50 ? "warm" : "nurture";
  return { total, tier, points, intent };
}

function renderScore(result) {
  const { total, tier, points, intent } = result;
  const [title, message] = scoreMessages[tier];
  const labels = {
    company: "Company profile",
    budget: "Budget confidence",
    intent: intent.matches.length ? `Intent signals: ${intent.matches.join(", ")}` : "Intent signals",
  };

  document.querySelector("#score-empty").classList.add("hidden");
  document.querySelector("#score-result").classList.remove("hidden");
  document.querySelector("#score-value").textContent = total;
  document.querySelector("#score-title").textContent = title;
  document.querySelector("#score-message").textContent = message;
  document.querySelector("#score-status").textContent = tier === "hot" ? "High priority" : tier === "warm" ? "Worth a follow-up" : "Nurture";
  document.querySelector("#reason-list").innerHTML = Object.entries(points)
    .map(([key, value]) => `<div class="reason"><span>${labels[key]}</span><b>+${value}</b></div>`)
    .join("");
}

document.querySelector("#lead-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const result = calculateScore({
    size: form.get("size"),
    budget: form.get("budget"),
    notes: form.get("notes"),
  });
  window.currentLeadScore = result;
  renderScore(result);
});

window.LeadScore = { calculateScore };
