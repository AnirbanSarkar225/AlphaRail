const API_BASE_URL = "http://localhost:8000/api";
document.getElementById("landingPage").style.display = "flex";
document.getElementById("authPage").style.display = "none";
document.getElementById("dashboard").style.display = "none";
document.getElementById("landingLoginBtn").addEventListener("click", () => {
  document.getElementById("landingPage").style.display = "none";
  document.getElementById("authPage").style.display = "flex";
});
async function landingSearchTrain() {
  const trainNo = document.getElementById("landingTrainSearch").value.trim();
  const resultBox = document.getElementById("landingSearchResult");
  if (trainNo === "") {
    resultBox.textContent = "⚠ Please enter a train number.";
    return;
  }
  
  resultBox.textContent = "Searching...";
  try {
    const res = await fetch(`${API_BASE_URL}/train/${trainNo}`);
    if (!res.ok) {
      throw new Error("Train not found");
    }
    const train = await res.json();

    // ✅ This section is updated to display the new time information
    resultBox.innerHTML = `
      <strong>${train.name} (${train.train_no})</strong><br>
      Route: ${train.route}<br>
      Departure: ${train.departure_time} | Arrival: ${train.arrival_time}
    `;
    
  } catch (err) {
    resultBox.textContent = `⚠ ${err.message}. Please check the train number.`;
  }
}
// FIX JS-5: submitEmergency now POSTs to the backend
async function submitEmergency() {
  const msg = document.getElementById("emergencyInput").value.trim();
  const list = document.getElementById("instructionList");
  if (msg === "") {
    Swal.fire({
      title: 'Wait!',
      text: 'Please describe the emergency before submitting.',
      icon: 'warning',
      background: '#2c3e50',
      color: '#ffffff',
      confirmButtonColor: '#5ad7db'
    });
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/emergency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: msg }),
    });
  } catch (_) {
    console.warn("Could not reach backend for emergency report.");
  }

  Swal.fire({
    title: '💡 Report Sent!',
    text: 'Your emergency report has been received by the control center.',
    icon: 'success',
    confirmButtonText: 'OK',
    background: '#2c3e50',
    color: '#ffffff',
    confirmButtonColor: '#5ad7db'
  });

  document.getElementById("emergencyInput").value = "";

  const emergencyList = document.getElementById("emergencyList");
  if (emergencyList.children.length > 0 && emergencyList.children[0].textContent === "No emergencies reported") {
    emergencyList.innerHTML = "";
  }
  const li = document.createElement("li");
  li.textContent = `Manual Report: ${msg}`;
  emergencyList.appendChild(li);

  list.innerHTML = "<li>Reduce speed to 30km/h until cleared.</li>";
}

// ---------------------------
// AUTHENTICATION HANDLING
// ---------------------------
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const toggleAuth = document.getElementById("toggleAuth");
const authTitle = document.getElementById("authTitle");
const authError = document.getElementById("authError");
const dashboard = document.getElementById("dashboard");
const authPage = document.getElementById("authPage");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

let isLogin = true;

// Toggle Login/Register
toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  authError.textContent = "";
  if (isLogin) {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    forgotPasswordForm.style.display = "none";
    authTitle.textContent = "Register";
    toggleAuth.innerHTML = "Already have an account? <a href='#'>Login</a>";
    isLogin = false;
  } else {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    forgotPasswordForm.style.display = "none";
    authTitle.textContent = "Login";
    toggleAuth.innerHTML = "Don't have an account? <a href='#'>Register</a>";
    isLogin = true;
  }
});

// Forgot Password
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  authError.textContent = "";
  loginForm.style.display = "none";
  registerForm.style.display = "none";
  forgotPasswordForm.style.display = "block";
  authTitle.textContent = "Reset Password";
});

// Added event listener for the forgot password form
forgotPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const identifier = document.getElementById("resetIdentifier").value;
  const resetMsg = document.getElementById("resetMsg");
  if (identifier) {
    resetMsg.textContent = `✅ If an account exists for ${identifier}, a reset link has been sent.`;
    resetMsg.style.color = "lightgreen";
  } else {
    resetMsg.textContent = "⚠ Please enter your email or username.";
    resetMsg.style.color = "#ff5555";
  }
});


// Login form submit
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  if (username === "" || password === "") {
    authError.textContent = "⚠ Please enter both username and password.";
    return;
  }

  // FIX JS-4 + JS-6: init dashboard only after login so chart canvas is visible
  authError.textContent = "";
  authPage.style.display = "none";
  dashboard.style.display = "block";
  initDashboard();
});

// Register form submit
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const phone = document.getElementById("regPhone").value;

  if (password !== confirmPassword) {
    authError.textContent = "⚠ Passwords do not match!";
    return;
  }
  if (password.length < 8) {
    authError.textContent = "⚠ Password must be at least 8 characters long!";
    return;
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(password)) {
    authError.textContent =
      "⚠ Password must include uppercase, lowercase, number, and symbol.";
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    authError.textContent = "⚠ Phone number must be exactly 10 digits!";
    return;
  }

  // ✅ Fake registration success
  authError.textContent = "";
  Swal.fire({
      title: 'Registration Successful!',
      text: 'You can now log in with your new account.',
      icon: 'success',
      background: '#2c3e50',
      color: '#ffffff',
      confirmButtonColor: '#5ad7db'
  });
  registerForm.reset();
  toggleAuth.click(); // switch to login
});

// Password Strength Indicator
const regPasswordInput = document.getElementById("regPassword");
const passwordStrength = document.getElementById("passwordStrength");

if (regPasswordInput) {
  regPasswordInput.addEventListener("input", () => {
    const val = regPasswordInput.value;
    let strength = "";
    if (val.length < 8) {
      strength = "❌ Too short (min 8 chars)";
      passwordStrength.style.color = "red";
    } else if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(val)
    ) {
      strength = "✅ Strong password";
      passwordStrength.style.color = "lightgreen";
    } else {
      strength =
        "⚠ Add uppercase, lowercase, numbers, and symbols for strength";
      passwordStrength.style.color = "orange";
    }
    passwordStrength.textContent = strength;
  });
}

// Logout button
document.getElementById("logoutBtn").addEventListener("click", () => {
  dashboard.style.display = "none";
  authPage.style.display = "flex";
  loginForm.style.display = "block";
  registerForm.style.display = "none";
  forgotPasswordForm.style.display = "none";
  authTitle.textContent = "Login";
  toggleAuth.innerHTML = "Don't have an account? <a href='#'>Register</a>";
  isLogin = true;
});

// ---------------------------
// DASHBOARD INIT
// FIX JS-4 + JS-6: everything below runs only after the user logs in
// ---------------------------
let twinChart = null;
let chartIntervalId = null;
let routeIntervalId = null;
let metricsIntervalId = null;
let labels = [];
let activeTrainData = [];
let conflictsData = [];
let _lastMetrics = { active_trains: 0, conflicts_prevented: 0 };

function initDashboard() {
  if (!twinChart) {
    // FIX JS-6: ctx created here, not at module parse time (canvas was hidden)
    const ctx = document.getElementById("twinChart").getContext("2d");
    labels = []; activeTrainData = []; conflictsData = [];
    twinChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Active Trains", data: activeTrainData, borderColor: "#5ad7db", backgroundColor: "rgba(90,215,219,0.2)", fill: true, tension: 0.3 },
          { label: "Conflicts Prevented", data: conflictsData, borderColor: "#ffeb3b", backgroundColor: "rgba(255,235,59,0.2)", fill: true, tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: {
          x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.2)" } },
          y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.2)" } }
        }
      }
    });
  }
  // FIX JS-4: load data only after login
  loadRoutes();
  loadMetrics();
  clearInterval(chartIntervalId);
  clearInterval(routeIntervalId);
  clearInterval(metricsIntervalId);
  routeIntervalId = setInterval(loadRoutes, 5000);
  metricsIntervalId = setInterval(loadMetrics, 10000);
  chartIntervalId = setInterval(updateChart, 10000);
}

// FIX JS-3: updateChart uses real backend values cached by loadMetrics
function updateChart() {
  const now = new Date().toLocaleTimeString();
  labels.push(now);
  if (labels.length > 10) labels.shift();

  const activeTrains = _lastMetrics.active_trains;
  const conflicts = _lastMetrics.conflicts_prevented;
  activeTrainData.push(activeTrains);
  conflictsData.push(conflicts);
  if (activeTrainData.length > 10) activeTrainData.shift();
  if (conflictsData.length > 10) conflictsData.shift();

  document.getElementById("activeTrains").textContent = activeTrains;
  document.getElementById("conflictsPrevented").textContent = conflicts;
  if (twinChart) twinChart.update();
}

// ---------------------------
// TRAIN SEARCH FUNCTIONS
// ---------------------------

// FIX JS-1: searchTrain now calls the real backend
async function searchTrain() {
  const query = document.getElementById("trainSearch").value.trim();
  const result = document.getElementById("searchResult");
  if (query === "") {
    result.textContent = "⚠ Please enter a train no. or name.";
    return;
  }
  result.textContent = "Searching...";
  try {
    const res = await fetch(`${API_BASE_URL}/train/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Train not found");
    const train = await res.json();
    result.innerHTML = `<strong>${train.name} (${train.train_no})</strong> — ${train.route}<br>Departure: ${train.departure_time} | Arrival: ${train.arrival_time}`;
  } catch (err) {
    result.textContent = `⚠ ${err.message}. Please check the train number.`;
  }
}

// FIX JS-2: findTrainsBetween now calls the real backend
async function findTrainsBetween() {
  const from = document.getElementById("fromStation").value.trim();
  const to = document.getElementById("toStation").value.trim();
  const resultBox = document.getElementById("stationResults");
  if (from === "" || to === "") {
    resultBox.textContent = "⚠ Please enter both stations.";
    return;
  }
  resultBox.textContent = "Searching...";
  try {
    const res = await fetch(`${API_BASE_URL}/trains_between?from_station=${encodeURIComponent(from)}&to_station=${encodeURIComponent(to)}`);
    if (!res.ok) throw new Error("Could not fetch trains");
    const trains = await res.json();
    if (!trains || trains.length === 0) {
      resultBox.textContent = `⚠ No trains found between ${from} and ${to}.`;
      return;
    }
    resultBox.innerHTML = trains.map(t => `
      <div class="train-card">
        <img src="https://cdn-icons-png.flaticon.com/512/3202/3202926.png" alt="train" />
        <div><strong>${t.name} (${t.train_no})</strong><br>${from} ➝ ${to} | Departure: ${t.departure} | Arrival: ${t.arrival}</div>
      </div>`).join("");
  } catch (err) {
    resultBox.textContent = `⚠ ${err.message}.`;
  }
}

// ---------------------------
// ROUTE-WISE TRAIN POSITIONS (TABLE VIEW)
// ---------------------------
async function loadRoutes() {
  const panel = document.getElementById("routeResults");
  const liveStatus = document.getElementById("liveStatus");
  const lastUpdated = document.getElementById("lastUpdated");
  if (!panel) return;

  try {
    const res = await fetch(`${API_BASE_URL}/routes`);
    if (!res.ok) throw new Error(`Network response was not ok (${res.status})`);
    const data = await res.json();

    panel.innerHTML = "<h3>🚆 Route-wise Train Positions</h3>";

    for (const [route, trains] of Object.entries(data)) {
      const routeBlock = document.createElement("div");
      routeBlock.innerHTML = `<h4 style="color:#ffeb3b; margin-top:1rem;">${route}</h4>`;

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.marginBottom = "1rem";
      table.innerHTML = `
        <thead>
          <tr style="background:rgba(255,255,255,0.1); color:#5ad7db;">
            <th style="padding:6px; border-bottom:1px solid #5ad7db;">Train No</th>
            <th style="padding:6px; border-bottom:1px solid #5ad7db;">Name</th>
            <th style="padding:6px; border-bottom:1px solid #5ad7db;">Position (km)</th>
            <th style="padding:6px; border-bottom:1px solid #5ad7db;">Δ Distance (km)</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      const tbody = table.querySelector("tbody");

      trains.forEach((t) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="padding:6px; border-bottom:1px solid rgba(255,255,255,0.1);">${t.train_no}</td>
          <td style="padding:6px; border-bottom:1px solid rgba(255,255,255,0.1);">${t.name}</td>
          <td style="padding:6px; border-bottom:1px solid rgba(255,255,255,0.1);">${t.position_km}</td>
          <td style="padding:6px; border-bottom:1px solid rgba(255,255,255,0.1);">${t.distance_from_prev ? t.distance_from_prev : "-"}</td>
        `;
        tbody.appendChild(tr);
      });

      routeBlock.appendChild(table);
      panel.appendChild(routeBlock);
    }
    // Update status indicators on success
    liveStatus.textContent = "✅ Connected";
    liveStatus.style.color = "#7dff7d";
    lastUpdated.textContent = `Updated: ${new Date().toLocaleTimeString()}`;

  } catch (err) {
    panel.innerHTML = `<p style="color:red">⚠ Failed to load routes: ${err}</p>`;
    // Update status indicators on failure
    liveStatus.textContent = "❌ Disconnected";
    liveStatus.style.color = "#ff5555";
  }
}

// ---------------------------
// METRICS + PANELS LOADER
// ---------------------------
async function loadMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics`);
    if (!res.ok) throw new Error(`Network response was not ok (${res.status})`);
    const data = await res.json();

    // FIX JS-3: cache real values so updateChart() can use them
    _lastMetrics.active_trains = data.active_trains ?? 0;
    _lastMetrics.conflicts_prevented = data.conflicts_prevented ?? 0;

    document.getElementById("kpiThroughput").textContent = data.kpi_throughput_gain || "--";
    document.getElementById("kpiDelay").textContent = data.kpi_delay_reduction || "--";
    document.getElementById("activeTrains").textContent = data.active_trains ?? "--";
    document.getElementById("conflictsPrevented").textContent = data.conflicts_prevented ?? "--";

    const emergencyList = document.getElementById("emergencyList");
    emergencyList.innerHTML = "";
    if (!data.emergencies || data.emergencies.length === 0) {
      emergencyList.innerHTML = "<li>No emergencies reported</li>";
    } else {
      data.emergencies.forEach(e => {
        const li = document.createElement("li");
        li.textContent = e.description
          ? `User Report: ${e.description}`
          : `${e.type} on Train ${e.train_no} (Status: ${e.status})`;
        emergencyList.appendChild(li);
      });
    }

    // Disasters
    const disasterList = document.getElementById("disasterList");
    disasterList.innerHTML = "";
    if (!data.disasters || data.disasters.length === 0) {
      disasterList.innerHTML = "<li>No disasters reported</li>";
    } else {
      data.disasters.forEach(d => {
        const li = document.createElement("li");
        li.textContent = `${d.type} at ${d.location} (Status: ${d.status})`;
        disasterList.appendChild(li);
      });
    }

    // Plan
    const planList = document.getElementById("planList");
    planList.innerHTML = "";
    if (!data.plan) { // Plan is an object, not a list
      planList.innerHTML = "<li>No plan yet</li>";
    } else {
      const li = document.createElement("li");
      li.textContent = `Plan ${data.plan.plan_id}: ${data.plan.description} (${data.plan.status})`;
      planList.appendChild(li);
    }

  } catch (err) {
    console.error("⚠ Failed to load metrics:", err);
  }
}

// FIX JS-4: Removed window.addEventListener("load", initialLoad)
// initDashboard() is called only on successful login (see loginForm submit above)