// ══════════════════════════════════
// CONFIG
// ══════════════════════════════════
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-VR53nDijzK9kugVXvIS3oTXlZePKVqvLOOWW8IfSJZEdS6d4-r54xQPIDM47WlmFsg/exec";

// ══════════════════════════════════
// CHECKLISTS DATA
// ══════════════════════════════════
const CHECKLISTS = {
  production: {
    name: "Daily Production Checklist",
    subtitle: "Production Department — Roz fill karein",
    sections: [
      {
        id: "subah",
        title: "🌅 SUBAH — Shift Start (8:00 AM se Pehle)",
        colorClass: "subah",
        items: [
          { id: "s1", label: "Attendance li — kaun aaya, kaun nahi", star: false },
          { id: "s2", label: "Absent ke liye backup assign kiya", star: true },
          { id: "s3", label: "Aaj ki production slip dekhi — ERP se", star: false },
          { id: "s4", label: "Kal maanga material aaj subh mila — Ajay se confirm kiya", star: true },
          { id: "s5", label: "Har worker ko kaam assign kiya", star: false },
        ]
      },
      {
        id: "dinmein",
        title: "⚙️ DIN MEIN — Production Ke Dauran",
        colorClass: "dinmein",
        items: [
          { id: "d1", label: "2 ghante baad progress check kiya", star: false },
          { id: "d2", label: "Defective pieces alag kiye aur count note kiya", star: false },
          { id: "d3", label: "Batch number record kiya", star: false },
          { id: "d4", label: "ERP / IMS mein WIP update kiya", star: false },
        ]
      },
      {
        id: "sham",
        title: "🌆 SHAM — Shift End (5:00 PM)",
        colorClass: "sham",
        items: [
          { id: "sh1", label: "Aaj total production note ki — Target vs Actual", star: false },
          { id: "sh2", label: "Pending orders note kiye", star: false },
          { id: "sh3", label: "Kal ki production slip check ki", star: false },
          { id: "sh4", label: "Kal ka material list banai aur Ajay ko di", star: true },
          { id: "sh5", label: "Ajay ne confirm kiya — material available hai", star: true },
          { id: "sh6", label: "ERP mein aaj ki summary update ki", star: false },
        ]
      }
    ]
  }
};

// ══════════════════════════════════
// STATE
// ══════════════════════════════════
let currentChecklist = null;
let checkedItems = {};
let submittedToday = {};

// ══════════════════════════════════
// INIT
// ══════════════════════════════════
window.onload = () => {
  const now = new Date();
  document.getElementById("todayDate").textContent =
    now.toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const saved = localStorage.getItem("checklist_state_" + getToday());
  if (saved) {
    submittedToday = JSON.parse(saved);
    updateHomeStatuses();
  }
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function updateHomeStatuses() {
  Object.keys(submittedToday).forEach(key => {
    const el = document.getElementById("status-" + key);
    if (el) {
      el.textContent = "Done ✅";
      el.className = "card-status status-done";
    }
  });
}

// ══════════════════════════════════
// NAVIGATION
// ══════════════════════════════════
function openChecklist(key) {
  currentChecklist = key;
  checkedItems = {};

  const cl = CHECKLISTS[key];
  document.getElementById("cl-title").textContent = cl.name;
  document.getElementById("cl-subtitle").textContent = cl.subtitle;
  document.getElementById("headerTitle").textContent = cl.name;
  document.getElementById("backBtn").classList.add("show");

  renderChecklist(cl);
  updateProgress();

  document.getElementById("home-screen").style.display = "none";
  document.getElementById("checklist-screen").style.display = "block";
  window.scrollTo(0, 0);
}

function goHome() {
  document.getElementById("home-screen").style.display = "block";
  document.getElementById("checklist-screen").style.display = "none";
  document.getElementById("headerTitle").textContent = "Litpax Checklists";
  document.getElementById("backBtn").classList.remove("show");
  currentChecklist = null;
}

// ══════════════════════════════════
// RENDER
// ══════════════════════════════════
function renderChecklist(cl) {
  const body = document.getElementById("checklist-body");
  body.innerHTML = "";

  cl.sections.forEach(section => {
    const block = document.createElement("div");
    block.className = "section-block";

    const hdr = document.createElement("div");
    hdr.className = `section-block-header ${section.colorClass}`;
    hdr.textContent = section.title;
    block.appendChild(hdr);

    section.items.forEach(item => {
      const row = document.createElement("div");
      row.className = `check-item ${item.star ? "star-item" : ""}`;
      row.id = "item-" + item.id;
      row.onclick = () => toggleItem(item.id);

      row.innerHTML = `
        <div class="checkbox" id="cb-${item.id}"></div>
        <div class="item-text">
          <div class="label">
            ${item.star ? "⭐ " : ""}${item.label}
            ${item.star ? '<span class="star-badge">Zaroori</span>' : ""}
          </div>
        </div>
      `;
      block.appendChild(row);
    });

    body.appendChild(block);
  });
}

// ══════════════════════════════════
// TOGGLE
// ══════════════════════════════════
function toggleItem(id) {
  checkedItems[id] = !checkedItems[id];
  const row = document.getElementById("item-" + id);
  const cb  = document.getElementById("cb-" + id);

  if (checkedItems[id]) {
    row.classList.add("checked");
    cb.textContent = "✓";
  } else {
    row.classList.remove("checked");
    cb.textContent = "";
  }
  updateProgress();
}

// ══════════════════════════════════
// PROGRESS
// ══════════════════════════════════
function updateProgress() {
  if (!currentChecklist) return;
  const cl = CHECKLISTS[currentChecklist];
  let total = 0, done = 0;
  cl.sections.forEach(s => s.items.forEach(item => {
    total++;
    if (checkedItems[item.id]) done++;
  }));

  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressText").textContent = `${done} / ${total} complete (${pct}%)`;
}

// ══════════════════════════════════
// SUBMIT
// ══════════════════════════════════
function submitChecklist() {
  if (!currentChecklist) return;
  const cl = CHECKLISTS[currentChecklist];

  const items = [];
  cl.sections.forEach(section => {
    section.items.forEach(item => {
      items.push({
        section: section.title.replace(/[🌅⚙️🌆]/g, "").trim(),
        label: item.label,
        checked: !!checkedItems[item.id]
      });
    });
  });

  document.getElementById("submitBtn").disabled = true;
  document.getElementById("loadingSpinner").style.display = "block";

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "submitChecklist",
      checklistName: cl.name,
      items: items
    })
  })
  .then(r => r.json())
  .then(data => {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("submitBtn").disabled = false;

    if (data.success) {
      submittedToday[currentChecklist] = true;
      localStorage.setItem("checklist_state_" + getToday(), JSON.stringify(submittedToday));
      document.getElementById("successOverlay").classList.add("show");
    } else {
      alert("Error: " + data.message);
    }
  })
  .catch(() => {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("submitBtn").disabled = false;
    alert("Connection error. Check internet.");
  });
}

function closeSuccess() {
  document.getElementById("successOverlay").classList.remove("show");
  updateHomeStatuses();
  goHome();
}
