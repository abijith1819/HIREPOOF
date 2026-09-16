// ============================================================
// HireProof — plain HTML/CSS/JS version
// No build tools, no server. AI-feeling features (scoring,
// interview questions, roadmap) run on built-in logic instead
// of a live API call, so this works the instant you open it.
// ============================================================

const SAMPLE_RESUME = `Aisha Sharma
Frontend Developer

EXPERIENCE
Freelance Web Developer, 2023-2024
- Built websites for 3 small business clients using HTML, CSS, and JavaScript
- Worked with a team on a college project website

SKILLS
HTML, CSS, JavaScript, basic Python

EDUCATION
B.Tech Computer Science, 2024`;

const SAMPLE_JD = `Frontend Developer

We are looking for a Frontend Developer to join our team.

Requirements:
- Strong knowledge of React and JavaScript
- Experience with HTML, CSS
- Familiarity with Git version control
- Understanding of REST APIs
- Good communication skills`;

const CORE_SKILLS = ["react", "javascript", "html", "css", "git", "rest api", "typescript", "node", "sql", "testing", "python", "communication", "teamwork", "agile"];

const STATUS_COLORS = { Applied: "#06b6d4", Interview: "#7c3aed", Offer: "#10b981", Rejected: "#ec4899" };
const MOCK_COMPANIES = ["Zoho", "Freshworks", "Swiggy", "Razorpay", "Infosys", "TCS", "Wipro", "Groww", "CRED", "Meesho"];
const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Analyst", "Data Scientist", "DevOps Engineer", "QA / Test Engineer", "UI/UX Designer", "Product Manager"];

// ---------- STATE (persisted to localStorage where sensible) ----------
let currentUser = null;
let apps = JSON.parse(localStorage.getItem("hp_apps") || "null") || [
  { company: "TCS", role: "Developer", status: "Applied", addedAt: Date.now() - 9 * 86400000 },
  { company: "Infosys", role: "Analyst", status: "Interview", addedAt: Date.now() - 3 * 86400000 },
];
let resumeReportState = null;
let roadmapProgressState = null;

function saveApps() { localStorage.setItem("hp_apps", JSON.stringify(apps)); }

// ============================================================
// LOGIN / REGISTER
// ============================================================
let mode = "login";

document.getElementById("mode-login").onclick = () => switchMode("login");
document.getElementById("mode-register").onclick = () => switchMode("register");

function switchMode(next) {
  mode = next;
  document.getElementById("mode-login").classList.toggle("active", next === "login");
  document.getElementById("mode-register").classList.toggle("active", next === "register");
  document.getElementById("name-field").style.display = next === "register" ? "block" : "none";
  document.getElementById("confirm-field").style.display = next === "register" ? "block" : "none";
  document.getElementById("submit-login").textContent = next === "register" ? "Create Account" : "Sign In";
  document.getElementById("login-error").textContent = "";
}

document.getElementById("submit-login").onclick = () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const errorEl = document.getElementById("login-error");

  if (!email || !password) { errorEl.textContent = "Enter an email and password to continue."; return; }

  if (mode === "register") {
    const name = document.getElementById("reg-name").value.trim();
    const confirm = document.getElementById("reg-confirm").value.trim();
    if (!name) { errorEl.textContent = "Enter your name to register."; return; }
    if (password !== confirm) { errorEl.textContent = "Passwords don't match."; return; }
    login(name);
  } else {
    login(email);
  }
};

document.getElementById("guest-login").onclick = () => login("Guest");

function login(name) {
  currentUser = name;
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("app-screen").style.display = "block";
  document.getElementById("user-email").textContent = currentUser;
  renderOverview();
  renderApplications();
  setTimeout(triggerVacancy, 7000);
}

document.getElementById("sign-out").onclick = () => {
  currentUser = null;
  document.getElementById("app-screen").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";
};

// ============================================================
// TABS
// ============================================================
document.querySelectorAll(".tab").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "overview") renderOverview();
  };
});

function goToTab(tabId) {
  document.querySelector(`.tab[data-tab="${tabId}"]`).click();
}

// ============================================================
// ASSESSMENT — heuristic "AI" scoring
// ============================================================
document.getElementById("sample-resume").onclick = () => { document.getElementById("resume-text").value = SAMPLE_RESUME; };
document.getElementById("sample-jd").onclick = () => { document.getElementById("jd-text").value = SAMPLE_JD; };

document.getElementById("run-assessment").onclick = () => {
  const resumeText = document.getElementById("resume-text").value;
  const jdText = document.getElementById("jd-text").value;
  const errorEl = document.getElementById("assessment-error");

  if (resumeText.trim().length < 30) {
    errorEl.textContent = "Paste a resume to begin the assessment.";
    return;
  }
  errorEl.textContent = "";

  const report = analyzeResume(resumeText, jdText);
  resumeReportState = report;
  renderAssessmentResult(report);
  renderOverview();
};

function analyzeResume(resumeText, jdText) {
  const lower = resumeText.toLowerCase();
  const foundSkills = CORE_SKILLS.filter((s) => lower.includes(s));
  const missingCore = CORE_SKILLS.filter((s) => !lower.includes(s)).slice(0, 5);

  const hasNumbers = /\d/.test(resumeText);
  const wordCount = resumeText.trim().split(/\s+/).length;
  const hasProject = /project/i.test(resumeText);
  const hasSummaryWords = /summary|objective|profile/i.test(resumeText);

  let score = 40;
  score += Math.min(foundSkills.length * 4, 28);
  score += hasNumbers ? 10 : 0;
  score += wordCount > 80 ? 10 : 0;
  score += hasProject ? 8 : 0;
  score += hasSummaryWords ? 4 : 0;
  score = Math.max(10, Math.min(96, Math.round(score)));

  const improvements = [];
  if (!hasNumbers) improvements.push("Add measurable achievements — numbers, percentages, or scale (e.g. 'improved load time by 30%').");
  if (foundSkills.length < 5) improvements.push("List more of your relevant technical skills explicitly, even ones you've used briefly.");
  if (!hasProject) improvements.push("Add 1-2 concrete projects with a short description of what you built and the tech used.");
  if (!hasSummaryWords) improvements.push("Add a short professional summary at the top stating your focus and years of experience.");
  if (wordCount < 80) improvements.push("Expand on your experience — a resume this short reads as incomplete to recruiters.");
  while (improvements.length < 3) improvements.push("Tailor your resume's keywords to match the specific job descriptions you're applying to.");

  let jobMatch = null;
  if (jdText.trim()) {
    const jdLower = jdText.toLowerCase();
    const jdSkills = CORE_SKILLS.filter((s) => jdLower.includes(s));
    const matched = jdSkills.filter((s) => lower.includes(s));
    const missing = jdSkills.filter((s) => !lower.includes(s));
    const matchPercent = jdSkills.length > 0 ? Math.round((matched.length / jdSkills.length) * 100) : 50;

    jobMatch = {
      matchPercent,
      matchedSkills: matched.length ? matched.map(cap) : ["General experience"],
      missingSkills: missing.map(cap),
      recommendation: missing.length
        ? `Focus on demonstrating ${cap(missing[0])} before applying — it's explicitly required and not evidenced in your resume.`
        : "Your resume already covers the key skills in this job description. Focus your cover letter on specific results.",
    };
  }

  return {
    resumeScore: score,
    summary: score >= 75 ? "Strong resume — minor polish needed." : score >= 50 ? "Solid foundation, but several gaps to close." : "Needs significant work before applying.",
    missingSkills: missingCore.map(cap),
    improvements: improvements.slice(0, 4),
    jobMatch,
  };
}

function cap(s) { return s.replace(/\b\w/g, (c) => c.toUpperCase()); }

function renderAssessmentResult(report) {
  const el = document.getElementById("assessment-result");
  el.style.display = "block";

  const color = report.resumeScore >= 75 ? "#10b981" : report.resumeScore >= 50 ? "#7c3aed" : "#ec4899";
  const status = report.resumeScore >= 75 ? "CLEARED" : report.resumeScore >= 50 ? "PENDING" : "REVIEW";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (report.resumeScore / 100) * circumference;

  let html = `
    <div class="section-label"><span class="num">03</span><span class="title">Findings</span><div class="line"></div></div>
    <div class="card">
      <div class="gauge-wrap">
        <div class="gauge">
          <svg width="148" height="148" viewBox="0 0 148 148">
            <circle cx="74" cy="74" r="54" fill="none" stroke="rgba(148,163,184,0.15)" stroke-width="7"/>
            <circle cx="74" cy="74" r="54" fill="none" stroke="${color}" stroke-width="7"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
              style="filter: drop-shadow(0 0 6px ${color}99); transition: stroke-dashoffset 1s ease;"/>
          </svg>
          <div class="gauge-text">
            <div class="gauge-score">${report.resumeScore}</div>
            <div class="gauge-status" style="color:${color}; border-color:${color};">${status}</div>
          </div>
        </div>
        <div style="flex:1; min-width:200px;">
          <div style="font-family: ui-serif, Georgia, serif; font-size:15.5px; margin-bottom:12px;">${report.summary}</div>
          ${report.missingSkills.length ? `<div class="stat-label" style="margin-bottom:6px;">SKILLS NOT EVIDENCED</div>${report.missingSkills.map((s) => `<span class="chip chip-bad">✕ ${s}</span>`).join("")}` : ""}
        </div>
      </div>
    </div>

    <div class="section-label"><span class="num">04</span><span class="title">Recommended Improvements</span><div class="line"></div></div>
    <div class="card">
      ${report.improvements.map((imp, i) => `<div class="improvement-row"><span class="improvement-num">${String(i + 1).padStart(2, "0")}</span><span>${imp}</span></div>`).join("")}
    </div>
  `;

  if (report.jobMatch) {
    const jm = report.jobMatch;
    const mColor = jm.matchPercent >= 70 ? "#10b981" : "#7c3aed";
    html += `
      <div class="section-label"><span class="num">05</span><span class="title">Position Match Analysis</span><div class="line"></div></div>
      <div class="card">
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
          <div style="font-family: ui-monospace, Menlo, monospace; font-size:26px; font-weight:700; color:${mColor};">${jm.matchPercent}%</div>
          <div style="font-size:12.5px; color:var(--mute);">match to this role</div>
        </div>
        <div class="match-bar-track"><div class="match-bar-fill" style="width:${jm.matchPercent}%;"></div></div>
        <div>
          ${jm.matchedSkills.map((s) => `<span class="chip chip-ok">✓ ${s}</span>`).join("")}
          ${jm.missingSkills.map((s) => `<span class="chip chip-bad">✕ ${s}</span>`).join("")}
        </div>
        <div style="border-top:1px solid rgba(148,163,184,0.15); padding-top:14px; margin-top:14px; font-style:italic; color:var(--mute); font-size:13.5px;">${jm.recommendation}</div>
      </div>
    `;
  }

  el.innerHTML = html;
}

// ============================================================
// INTERVIEW PREP — canned question bank + heuristic grading
// ============================================================
const QUESTION_BANK = {
  technical: [
    "Explain the difference between let, const, and var.",
    "What is the difference between == and === in JavaScript?",
    "How does the virtual DOM work in React?",
    "What are React hooks, and why were they introduced?",
    "Explain the concept of closures with an example.",
    "What is the difference between synchronous and asynchronous code?",
    "How would you optimize a slow-loading webpage?",
    "What is a REST API, and what makes an API RESTful?",
    "Explain event bubbling and event capturing.",
    "What is the box model in CSS?",
    "How do you handle state management in a React application?",
    "What is the difference between SQL and NoSQL databases?",
    "Explain the concept of Git branching and merging.",
    "What is CORS, and why does it matter?",
    "How would you debug a memory leak in a web application?",
  ],
  hr: [
    "Tell me about yourself.",
    "Why do you want to work here?",
    "What are your greatest strengths and weaknesses?",
    "Describe a time you faced conflict with a teammate and how you resolved it.",
    "Where do you see yourself in 5 years?",
    "Why should we hire you over other candidates?",
    "Describe a time you failed and what you learned from it.",
    "How do you handle tight deadlines and pressure?",
    "What motivates you at work?",
    "Do you have any questions for us?",
  ],
  project: [
    "Walk me through the most challenging project you've worked on.",
    "What was your specific contribution to a team project?",
    "What would you do differently if you rebuilt this project today?",
    "How did you handle a technical decision you disagreed with on a project?",
    "What tools or technologies did you choose for your project, and why?",
  ],
  resumeBased: [
    "I see you worked freelance — how did you find and manage clients?",
    "Can you explain this specific skill listed on your resume in more depth?",
    "What was the outcome or impact of the work described in your most recent role?",
    "Why did you choose this particular field of study or specialization?",
    "Is there anything on your resume you'd like to elaborate on that isn't obvious from the text?",
  ],
};

document.getElementById("generate-questions").onclick = () => {
  const resumeText = document.getElementById("resume-text").value;
  const errorEl = document.getElementById("interview-error");

  if (resumeText.trim().length < 30) {
    errorEl.textContent = "Add a resume in the Assessment tab first.";
    return;
  }
  errorEl.textContent = "";
  renderInterviewQuestions();
};

function renderInterviewQuestions() {
  const el = document.getElementById("interview-result");
  const cats = [
    { key: "technical", label: "Technical (15)", num: "02" },
    { key: "hr", label: "HR & Behavioral (10)", num: "03" },
    { key: "project", label: "Project (5)", num: "04" },
    { key: "resumeBased", label: "About Your Resume (5)", num: "05" },
  ];

  let html = "";
  cats.forEach((cat) => {
    html += `<div class="section-label" style="margin-top:24px;"><span class="num">${cat.num}</span><span class="title">${cat.label}</span><div class="line"></div></div>`;
    QUESTION_BANK[cat.key].forEach((q, i) => {
      const id = `${cat.key}-${i}`;
      html += `
        <div class="question-card">
          <button class="question-header" onclick="toggleQuestion('${id}')">
            <span>${q}</span>
            <span id="chevron-${id}">▾</span>
          </button>
          <div class="question-body" id="body-${id}">
            <textarea id="answer-${id}" rows="3" placeholder="Type your answer here, then get feedback..."></textarea>
            <button class="btn-gold small" onclick="gradeAnswer('${id}', \`${q.replace(/`/g, "'")}\`)">✨ Get Feedback</button>
            <div id="feedback-${id}"></div>
          </div>
        </div>
      `;
    });
  });
  el.innerHTML = html;
}

function toggleQuestion(id) {
  document.getElementById(`body-${id}`).classList.toggle("open");
  const chevron = document.getElementById(`chevron-${id}`);
  chevron.textContent = document.getElementById(`body-${id}`).classList.contains("open") ? "▴" : "▾";
}

function gradeAnswer(id, question) {
  const answer = document.getElementById(`answer-${id}`).value.trim();
  const fbEl = document.getElementById(`feedback-${id}`);
  if (!answer) return;

  const wordCount = answer.split(/\s+/).length;
  const hasExample = /example|instance|project|for instance|e\.g\./i.test(answer);
  const hasStructure = /because|therefore|as a result|first|then|finally/i.test(answer);

  let score = 4;
  if (wordCount > 20) score += 2;
  if (wordCount > 50) score += 1;
  if (hasExample) score += 2;
  if (hasStructure) score += 1;
  score = Math.min(10, score);

  const color = score >= 7 ? "#10b981" : score >= 4 ? "#7c3aed" : "#ec4899";
  const verdict = score >= 7 ? "Strong answer" : score >= 4 ? "Reasonable, but could go deeper" : "Needs more detail";

  const strengths = [];
  const improvements = [];
  if (hasExample) strengths.push("You backed this up with a concrete example.");
  if (hasStructure) strengths.push("Your answer has clear structure and logical flow.");
  if (!hasExample) improvements.push("Add a specific example from your own experience to make this concrete.");
  if (wordCount < 20) improvements.push("Expand your answer — a one-liner won't demonstrate depth to an interviewer.");
  if (!hasStructure) improvements.push("Structure your answer clearly (e.g. situation → action → result) rather than a single flowing sentence.");
  if (strengths.length === 0) strengths.push("You attempted the question directly, which is a good start.");

  fbEl.innerHTML = `
    <div class="feedback-box">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
        <span class="score-badge" style="color:${color}; border-color:${color};">${score}/10</span>
        <span style="font-weight:600;">${verdict}</span>
      </div>
      ${strengths.map((s) => `<div style="display:flex; gap:6px; margin-bottom:3px; color:#c4cad6;">✓ ${s}</div>`).join("")}
      ${improvements.map((s) => `<div style="display:flex; gap:6px; margin-bottom:3px; color:#c4cad6;">⚠ ${s}</div>`).join("")}
    </div>
  `;
}

// ============================================================
// APPLICATIONS — persisted to localStorage
// ============================================================
document.getElementById("add-app").onclick = () => {
  const company = document.getElementById("app-company").value.trim();
  const role = document.getElementById("app-role").value.trim();
  const status = document.getElementById("app-status").value;
  if (!company || !role) return;

  apps.push({ company, role, status, addedAt: Date.now() });
  saveApps();
  document.getElementById("app-company").value = "";
  document.getElementById("app-role").value = "";
  renderApplications();
  renderOverview();
};

function daysSince(ts) { return Math.floor((Date.now() - ts) / 86400000); }

function renderApplications() {
  const el = document.getElementById("app-list");
  if (apps.length === 0) {
    el.innerHTML = `<div style="padding:20px; text-align:center; color:var(--mute); font-size:13px;">No applications logged yet.</div>`;
    return;
  }

  el.innerHTML = apps.map((a, i) => {
    const days = daysSince(a.addedAt);
    const isStale = a.status === "Applied" && days >= 7;
    const statusColor = STATUS_COLORS[a.status];
    return `
      <div class="app-row">
        <div class="app-row-main">
          <div>${a.company}</div>
          <div>${a.role}</div>
          <select class="app-status-select" style="color:${statusColor}; border:1px solid ${statusColor};" onchange="updateAppStatus(${i}, this.value)">
            ${Object.keys(STATUS_COLORS).map((s) => `<option ${s === a.status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
          ${isStale
            ? `<button class="chip stale-chip" onclick="toggleFollowUp(${i})">⚠ ${days}d — follow up</button>`
            : `<span style="font-size:10.5px; color:var(--mute); font-family: ui-monospace, Menlo, monospace;">${days}d ago</span>`}
          <button class="remove-btn" onclick="removeApp(${i})">🗑</button>
        </div>
        <div class="followup-panel" id="followup-${i}" style="display:none;"></div>
      </div>
    `;
  }).join("");
}

function updateAppStatus(i, status) { apps[i].status = status; saveApps(); renderOverview(); }
function removeApp(i) { apps.splice(i, 1); saveApps(); renderApplications(); renderOverview(); }

function toggleFollowUp(i) {
  const el = document.getElementById(`followup-${i}`);
  const isOpen = el.style.display === "block";
  el.style.display = isOpen ? "none" : "block";
  if (!isOpen && !el.dataset.filled) {
    const a = apps[i];
    const days = daysSince(a.addedAt);
    el.innerHTML = `
      <div class="feedback-box" style="font-style:italic; color:#c4cad6;">
        Hi [Hiring Manager], I wanted to follow up on my application for the ${a.role} position at ${a.company},
        submitted ${days} days ago. I remain very interested in the opportunity and would love to hear about next steps.
        Happy to provide any additional information. Thank you for your time and consideration.
      </div>
    `;
    el.dataset.filled = "true";
  }
}

// ============================================================
// ROADMAP — canned templates per role
// ============================================================
const ROADMAP_TEMPLATES = {
  "Frontend Developer": [
    ["Master HTML/CSS fundamentals", "Learn JavaScript ES6+ basics", "Build 2 static websites", "Learn responsive design", "Get comfortable with browser dev tools"],
    ["Learn React fundamentals", "Understand Git & GitHub workflow", "Learn REST API integration", "Build a small React app with API calls"],
    ["Build 2 real portfolio projects", "Learn a CSS framework (Tailwind)", "Practice deploying with Vercel/Netlify", "Write clean, documented code"],
    ["Polish your resume with project links", "Do 5 mock interviews", "Apply to 3-5 jobs daily", "Prepare a portfolio walkthrough"],
  ],
  "Backend Developer": [
    ["Learn a backend language (Node.js/Python)", "Understand HTTP & REST principles", "Learn SQL basics", "Build a simple CRUD API"],
    ["Learn authentication (JWT/sessions)", "Learn a database ORM (Prisma/SQLAlchemy)", "Understand API security basics", "Build a full API with auth"],
    ["Build 1-2 real backend projects", "Learn Docker basics", "Practice writing tests", "Learn basic system design concepts"],
    ["Polish resume with backend projects", "Practice system design interviews", "Do 5 mock interviews", "Apply to 3-5 jobs daily"],
  ],
  "Full Stack Developer": [
    ["Learn HTML/CSS/JavaScript fundamentals", "Learn a frontend framework (React)", "Learn a backend language (Node.js)", "Learn SQL basics"],
    ["Build a full-stack CRUD app", "Learn authentication end-to-end", "Learn REST API design", "Deploy a full-stack app"],
    ["Build 2 polished full-stack projects", "Learn Git collaboration workflows", "Practice writing tests on both ends", "Learn basic cloud deployment (Vercel + Supabase)"],
    ["Polish resume & portfolio", "Practice full-stack system design", "Do 5 mock interviews", "Apply to 3-5 jobs daily"],
  ],
  "Data Analyst": [
    ["Learn Excel/Google Sheets deeply", "Learn SQL fundamentals", "Learn basic statistics", "Practice with public datasets"],
    ["Learn Python for data analysis (pandas)", "Learn data visualization (Power BI/Tableau)", "Build 2 analysis projects", "Learn to write a data story"],
    ["Build a portfolio dashboard project", "Practice case study interviews", "Learn A/B testing basics", "Learn basic SQL window functions"],
    ["Polish resume with dashboards/projects", "Practice case interviews", "Do 5 mock interviews", "Apply to 3-5 jobs daily"],
  ],
  "Data Scientist": [
    ["Learn Python fundamentals", "Learn statistics & probability", "Learn pandas/numpy", "Practice with public datasets"],
    ["Learn machine learning basics (scikit-learn)", "Learn data visualization", "Build 1-2 ML projects", "Learn SQL for data extraction"],
    ["Build a polished end-to-end ML project", "Learn model evaluation metrics deeply", "Practice explaining models simply", "Learn basic MLOps concepts"],
    ["Polish resume with ML projects", "Practice case + technical interviews", "Do 5 mock interviews", "Apply to 3-5 jobs daily"],
  ],
  "DevOps Engineer": [
    ["Learn Linux fundamentals", "Learn networking basics", "Learn Git deeply", "Learn shell scripting"],
    ["Learn Docker", "Learn CI/CD basics (GitHub Actions)", "Learn a cloud provider (AWS/GCP basics)", "Build a CI/CD pipeline for a project"],
    ["Learn Kubernetes basics", "Learn infrastructure as code (Terraform)", "Build a full deployment pipeline project", "Learn monitoring basics"],
    ["Polish resume with pipeline/infra projects", "Practice troubleshooting scenarios", "Do 5 mock interviews", "Apply to 3-5 jobs daily"],
  ],
  "QA / Test Engineer": [
    ["Learn manual testing fundamentals", "Learn how to write test cases", "Learn basic SQL for data validation", "Learn bug reporting tools (Jira)"],
    ["Learn automation testing basics (Selenium/Playwright)", "Learn API testing (Postman)", "Build a small automation suite", "Learn test planning"],
    ["Build a full automation framework project", "Learn CI integration for tests", "Practice writing detailed bug reports", "Learn performance testing basics"],
    ["Polish resume with automation projects", "Practice QA scenario interviews", "Do 5 mock interviews", "Apply to 3-5 jobs daily"],
  ],
  "UI/UX Designer": [
    ["Learn design fundamentals (color, typography, layout)", "Learn Figma deeply", "Study 10 well-designed apps", "Practice redesigning an existing app"],
    ["Learn user research basics", "Learn wireframing & prototyping", "Build 2 case study projects", "Learn accessibility basics"],
    ["Build a polished portfolio with case studies", "Practice presenting design decisions", "Learn basic usability testing", "Get feedback from real designers"],
    ["Polish portfolio website", "Practice portfolio walkthroughs", "Do 5 mock interviews", "Apply to 3-5 jobs daily"],
  ],
  "Product Manager": [
    ["Learn PM fundamentals & frameworks", "Study 5 products you use daily critically", "Learn basic SQL", "Learn to write a PRD"],
    ["Learn user research basics", "Learn prioritization frameworks (RICE, MoSCoW)", "Write 2 mock PRDs", "Learn basic analytics tools"],
    ["Build a portfolio case study project", "Practice product sense interviews", "Learn stakeholder communication", "Learn A/B testing basics"],
    ["Polish resume & case studies", "Practice PM mock interviews", "Do 5 mock interviews", "Apply to 3-5 jobs daily"],
  ],
};

document.getElementById("generate-roadmap").onclick = () => {
  const role = document.getElementById("roadmap-role").value;
  const months = ROADMAP_TEMPLATES[role] || ROADMAP_TEMPLATES["Frontend Developer"];
  renderRoadmap(role, months);
};

let roadmapDone = {};

function renderRoadmap(role, months) {
  roadmapDone = {};
  roadmapProgressState = { role, total: months.reduce((s, m) => s + m.length, 0), completed: 0 };

  let html = `<div class="section-label" style="margin-top:20px;"><span class="num">02</span><span class="title">Plan — ${role}</span><div class="line"></div></div>`;
  months.forEach((items, mi) => {
    html += `<div class="card month-card"><div class="month-title">Month ${mi + 1}</div>`;
    items.forEach((item, ii) => {
      const id = `${mi}-${ii}`;
      html += `
        <div class="roadmap-item" id="roadmap-item-${id}" onclick="toggleRoadmapItem('${id}')">
          <div class="roadmap-checkbox" id="roadmap-check-${id}"></div>
          <span>${item}</span>
        </div>
      `;
    });
    html += `</div>`;
  });
  document.getElementById("roadmap-result").innerHTML = html;
  renderOverview();
}

function toggleRoadmapItem(id) {
  roadmapDone[id] = !roadmapDone[id];
  const itemEl = document.getElementById(`roadmap-item-${id}`);
  const checkEl = document.getElementById(`roadmap-check-${id}`);
  itemEl.classList.toggle("done", roadmapDone[id]);
  checkEl.textContent = roadmapDone[id] ? "✓" : "";
  checkEl.style.color = roadmapDone[id] ? "#10b981" : "";

  if (roadmapProgressState) {
    roadmapProgressState.completed = Object.values(roadmapDone).filter(Boolean).length;
  }
  renderOverview();
}

// ============================================================
// OVERVIEW / DASHBOARD
// ============================================================
function renderOverview() {
  const statusCounts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
  apps.forEach((a) => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

  document.getElementById("stat-score").textContent = resumeReportState ? `${resumeReportState.resumeScore}/100` : "—";
  document.getElementById("stat-score-sub").textContent = resumeReportState ? resumeReportState.summary.slice(0, 40) : "Run an assessment";
  document.getElementById("stat-match").textContent = resumeReportState?.jobMatch ? `${resumeReportState.jobMatch.matchPercent}%` : "—";
  document.getElementById("stat-match-sub").textContent = resumeReportState?.jobMatch ? "vs. pasted job description" : "Add a JD to compare";

  const roadmapPercent = roadmapProgressState && roadmapProgressState.total > 0
    ? Math.round((roadmapProgressState.completed / roadmapProgressState.total) * 100) : null;
  document.getElementById("stat-roadmap").textContent = roadmapPercent !== null ? `${roadmapPercent}%` : "—";
  document.getElementById("stat-roadmap-sub").textContent = roadmapProgressState ? roadmapProgressState.role : "Generate a roadmap";

  document.getElementById("stat-apps").textContent = apps.length;
  document.getElementById("stat-apps-sub").textContent = `${statusCounts.Interview} in interview · ${statusCounts.Offer} offers`;

  document.getElementById("pipeline-row").innerHTML = Object.keys(STATUS_COLORS).map((s) => `
    <div class="card pipeline-card" style="border-color:${STATUS_COLORS[s]}44; margin-bottom:0;">
      <div class="pipeline-count" style="color:${STATUS_COLORS[s]};">${statusCounts[s]}</div>
      <div class="pipeline-label">${s}</div>
    </div>
  `).join("");

  const actions = [];
  if (!resumeReportState) actions.push(["Run your first resume assessment →", "assessment"]);
  if (resumeReportState && !roadmapProgressState) actions.push(["Generate your career roadmap →", "roadmap"]);
  if (resumeReportState) actions.push(["Practice interview questions →", "interview"]);
  actions.push(["Log a new application →", "applications"]);

  document.getElementById("next-actions").innerHTML = actions.map(([label, tab]) =>
    `<button class="next-action-btn" onclick="goToTab('${tab}')">${label}</button>`
  ).join("");
}

// ============================================================
// VACANCY ALERT
// ============================================================
function triggerVacancy() {
  const company = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];
  document.getElementById("vacancy-role").textContent = role;
  document.getElementById("vacancy-company").textContent = `${company} · matches your target role`;
  document.getElementById("vacancy-apply").href = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}&company=${encodeURIComponent(company)}`;
  document.getElementById("vacancy-alert").style.display = "block";
  document.getElementById("vacancy-alert").dataset.company = company;
  document.getElementById("vacancy-alert").dataset.role = role;
}

document.getElementById("close-vacancy").onclick = () => { document.getElementById("vacancy-alert").style.display = "none"; };
document.getElementById("check-vacancies").onclick = triggerVacancy;
document.getElementById("vacancy-save").onclick = () => {
  const el = document.getElementById("vacancy-alert");
  apps.push({ company: el.dataset.company, role: el.dataset.role, status: "Applied", addedAt: Date.now() });
  saveApps();
  renderApplications();
  renderOverview();
  el.style.display = "none";
};
