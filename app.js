const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCg6ewGGjBAEzj4jD6EFJEoZdi8GClZjUHGYogtyAZK_NfylZhmitJW2b_urClYdL76w/exec";

const CHECKLISTS = {
  production: {
    name: "Daily Production Checklist",
    subtitle: "Roz fill karein",
    items: [
      {
        id: "p1",
        label: "Kya kal ki Production Parchi mil gayi?",
        tip: "Kal kya banana hai — yeh aaj pata hona chahiye",
        type: "yesno"
      },
      {
        id: "p2",
        label: "Aaj ka Production kitna complete hua?",
        tip: "Target ke against actual output",
        type: "percent"
      },
      {
        id: "p3",
        label: "Kal k liye raw material pura hai aur store se mil gaya hai?",
        tip: "Subah production rukni nahi chahiye material ki wajah se",
        type: "yesno"
      },
      {
        id: "p4",
        label: "Kal k liye Box lekar aa gaye ho?",
        tip: "Packaging ready honi chahiye pehle se",
        type: "yesno"
      },
      {
        id: "p5",
        label: "Kal kon kya kaam karega — planning ho gayi?",
        tip: "Har worker ka kaam pehle se assign hona chahiye",
        type: "yesno"
      },
      {
        id: "p6",
        label: "Machine sahi se chal rahi hai?",
        tip: "Koi issue hai toh aaj hi batao — kal band nahi honi chahiye",
        type: "yesno"
      },
      {
        id: "p7",
        label: "Kal ke Action Points likh diye hain?",
        tip: "Jo bhi pending hai ya karna hai — likha hua hona chahiye",
        type: "yesno"
      }
    ]
  }
};

let currentChecklist = null;
let answers = {};
let submittedToday = {};

window.onload = () => {
  const now = new Date();
  document.getElementById("todayDate").textContent =
    now.toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const saved = localStorage.getItem("cl_state_" + getToday());
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

function openChecklist(key) {
  currentChecklist = key;
  answers = {};

  const cl = CHECKLISTS[key];
  document.getElementById("cl-title").textContent = cl.name;
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

function renderChecklist(cl) {
  const body = document.getElementById("checklist-body");
  body.innerHTML = "";

  cl.items.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "check-item";
    row.id = "item-" + item.id;

    let inputHtml = "";

    if (item.type === "yesno") {
      inputHtml = `
        <div class="yn-buttons">
          <button class="yn-btn" id="yes-${item.id}" onclick="setYesNo('${item.id}', 'Yes')">✅ Yes</button>
          <button class="yn-btn" id="no-${item.id}"  onclick="setYesNo('${item.id}', 'No')">❌ No</button>
        </div>`;
    } else if (item.type === "percent") {
      inputHtml = `
        <div class="pct-buttons">
          <button class="pct-btn" id="pct-70-${item.id}"  onclick="setPercent('${item.id}', '70%')">70%</button>
          <button class="pct-btn" id="pct-80-${item.id}"  onclick="setPercent('${item.id}', '80%')">80%</button>
          <button class="pct-btn" id="pct-90-${item.id}"  onclick="setPercent('${item.id}', '90%')">90%</button>
          <button class="pct-btn" id="pct-100-${item.id}" onclick="setPercent('${item.id}', '100%')">100%</button>
        </div>`;
    }

    row.innerHTML = `
      <div class="item-top">
        <div class="item-number">${idx + 1}</div>
        <div class="item-text">
          <div class="label">${item.label}</div>
          <div class="tip">💡 ${item.tip}</div>
        </div>
      </div>
      <div class="item-input">${inputHtml}</div>
    `;

    body.appendChild(row);
  });

  // Signature block
  const sig = document.createElement("div");
  sig.className = "sig-block";
  sig.innerHTML = `
    <div class="sig-row">
      <label>Collected by</label>
      <input type="text" id="collectedBy" placeholder="Naam likho..." />
    </div>
    <div class="sig-row">
      <label>Checked by</label>
      <input type="text" id="checkedBy" placeholder="Naam likho..." />
    </div>
  `;
  body.appendChild(sig);
}

function setYesNo(id, val) {
  answers[id] = val;
  document.getElementById("yes-" + id).className = "yn-btn" + (val === "Yes" ? " selected-yes" : "");
  document.getElementById("no-" + id).className  = "yn-btn" + (val === "No"  ? " selected-no"  : "");
  updateProgress();
}

function setPercent(id, val) {
  answers[id] = val;
  ["70%","80%","90%","100%"].forEach(p => {
    const btn = document.getElementById("pct-" + p.replace("%","") + "-" + id);
    if (btn) btn.className = "pct-btn" + (val === p ? " selected-pct" : "");
  });
  updateProgress();
}

function updateProgress() {
  if (!currentChecklist) return;
  const cl = CHECKLISTS[currentChecklist];
  const total = cl.items.length;
  const done  = cl.items.filter(i => answers[i.id]).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressText").textContent = `${done} / ${total} answered`;

  // Submit button color change
  const btn = document.getElementById("submitBtn");
  if (done === total) {
    btn.style.background = "linear-gradient(135deg, #375623, #70AD47)";
    btn.textContent = "✅ Submit Checklist";
  } else {
    btn.style.background = "";
    btn.textContent = `Submit (${done}/${total} done)`;
  }
}

function submitChecklist() {
  if (!currentChecklist) return;
  const cl = CHECKLISTS[currentChecklist];

  const collectedBy = document.getElementById("collectedBy").value.trim();
  const checkedBy   = document.getElementById("checkedBy").value.trim();

  if (!collectedBy) {
    alert("Collected by ka naam zaroori hai!");
    document.getElementById("collectedBy").focus();
    return;
  }

  const unanswered = cl.items.filter(i => !answers[i.id]);
  if (unanswered.length > 0) {
    const ok = confirm(`${unanswered.length} question(s) ka jawab nahi diya. Phir bhi submit karein?`);
    if (!ok) return;
  }

  document.getElementById("submitBtn").disabled = true;
  document.getElementById("loadingSpinner").style.display = "block";

  const items = cl.items.map(item => ({
    label: item.label,
    answer: answers[item.id] || "—"
  }));

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
      localStorage.setItem("cl_state_" + getToday(), JSON.stringify(submittedToday));
      document.getElementById("successOverlay").classList.add("show");
    } else {
      alert("Error: " + data.message);
    }
  })
  .catch(() => {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("submitBtn").disabled = false;
    alert("Connection error. Internet check karo.");
  });
}

function closeSuccess() {
  document.getElementById("successOverlay").classList.remove("show");
  updateHomeStatuses();
  goHome();
}
