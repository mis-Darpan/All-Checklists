// ══════════════════════════════════
// CONFIG
// ══════════════════════════════════
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCg6ewGGjBAEzj4jD6EFJEoZdi8GClZjUHGYogtyAZK_NfylZhmitJW2b_urClYdL76w/exec";

// ══════════════════════════════════
// CHECKLISTS DATA
// ══════════════════════════════════
const CHECKLISTS = {
  production: {
    name: "Daily Production Checklist",
    subtitle: "Roz sham ko fill karein",
    sections: [
      {
        id: "production",
        title: "📋 Daily Production Checklist",
        colorClass: "subah",
        items: [
          { id: "p1", label: "Did you receive tomorrow Parchi?", type: "yesno" },
          { id: "p2", label: "Aaj ka Production Kitna complete hua?", type: "percent" },
          { id: "p3", label: "Kal k liye raw material pura hai or store se mil gya hai?", type: "yesno" },
          { id: "p4", label: "Kya aap kal k liye Box lekar aaye ho?", type: "yesno" },
          { id: "p5", label: "Kal kon kya kaam krega, uski planning hogyi hai?", type: "yesno" },
          { id: "p6", label: "Machine sahi se chal rhi hai?", type: "yesno" },
          { id: "p7", label: "Kya kal k Action Point likh diye hai?", type: "yesno" },
        ]
      }
    ]
  }
};

// ══════════════════════════════════
// STATE
// ══════════════════════════════════
let currentChecklist = null;
let answers = {};
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
  answers = {};

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

    section.items.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "check-item";
      row.id = "item-" + item.id;

      if (item.type === "yesno") {
        row.innerHTML = `
          <div class="item-number">${idx + 1}</div>
          <div class="item-text">
            <div class="label">${item.label}</div>
            <div class="yn-buttons">
              <button class="yn-btn yes-btn" id="yes-${item.id}" onclick="setYesNo('${item.id}', 'Yes')">✅ Yes</button>
              <button class="yn-btn no-btn"  id="no-${item.id}"  onclick="setYesNo('${item.id}', 'No')">❌ No</button>
            </div>
          </div>
        `;
      } else if (item.type === "percent") {
        row.innerHTML = `
          <div class="item-number">${idx + 1}</div>
          <div class="item-text">
            <div class="label">${item.label}</div>
            <div class="pct-buttons">
              <button class="pct-btn" id="pct-70-${item.id}" onclick="setPercent('${item.id}', '70%')">70%</button>
              <button class="pct-btn" id="pct-80-${item.id}" onclick="setPercent('${item.id}', '80%')">80%</button>
              <button class="pct-btn" id="pct-90-${item.id}" onclick="setPercent('${item.id}', '90%')">90%</button>
              <button class="pct-btn" id="pct-100-${item.id}" onclick="setPercent('${item.id}', '100%')">100%</button>
            </div>
          </div>
        `;
      }

      block.appendChild(row);
    });

    // Collected by / Checked by
    const sigBlock = document.createElement("div");
    sigBlock.className = "sig-block";
    sigBlock.innerHTML = `
      <div class="sig-row">
        <label>Collected by:</label>
        <input type="text" id="collectedBy" placeholder="Naam likho..." />
      </div>
      <div class="sig-row">
        <label>Checked by:</label>
        <input type="text" id="checkedBy" placeholder="Naam likho..." />
      </div>
    `;
    block.appendChild(sigBlock);
    body.appendChild(block);
  });
}

// ══════════════════════════════════
// YES / NO
// ══════════════════════════════════
function setYesNo(id, val) {
  answers[id] = val;

  const yesBtn = document.getElementById("yes-" + id);
  const noBtn  = document.getElementById("no-" + id);

  yesBtn.classList.remove("selected-yes");
  noBtn.classList.remove("selected-no");

  if (val === "Yes") yesBtn.classList.add("selected-yes");
  else               noBtn.classList.add("selected-no");

  updateProgress();
}

// ══════════════════════════════════
// PERCENT
// ══════════════════════════════════
function setPercent(id, val) {
  answers[id] = val;

  ["70%","80%","90%","100%"].forEach(p => {
    const btn = document.getElementById("pct-" + p.replace("%","") + "-" + id);
    if (btn) btn.classList.remove("selected-pct");
  });

  const selected = document.getElementById("pct-" + val.replace("%","") + "-" + id);
  if (selected) selected.classList.add("selected-pct");

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
    if (answers[item.id]) done++;
  }));

  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressText").textContent = `${done} / ${total} answered (${pct}%)`;
}

// ══════════════════════════════════
// SUBMIT
// ══════════════════════════════════
function submitChecklist() {
  if (!currentChecklist) return;
  const cl = CHECKLISTS[currentChecklist];

  const collectedBy = document.getElementById("collectedBy").value.trim();
  const checkedBy   = document.getElementById("checkedBy").value.trim();

  if (!collectedBy) {
    alert("Collected by ka naam likho!");
    return;
  }

  const items = [];
  cl.sections.forEach(section => {
    section.items.forEach(item => {
      items.push({
        section: "Daily Production",
        label: item.label,
        answer: answers[item.id] || "—"
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
      collectedBy,
      checkedBy,
      items
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
