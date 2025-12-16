import { required, emailFormat, phoneFormat } from "./validation.js";
import { validateForm } from "./formValidator.js";

document.addEventListener("DOMContentLoaded", () => {

  const patientList = document.getElementById("patientListCard");
  const policyBody = document.getElementById("policyBody");
  const addPolicyBtn = document.getElementById("addPolicyBtn");
const policyModal = document.getElementById("policy-modal-overlay");
const policyCancelBtn = document.getElementById("policyCancelBtn");
const policySaveBtn = document.getElementById("policySaveBtn");

const policyPlan = document.getElementById("policyPlan");
const policySum = document.getElementById("policySum");
const policyStart = document.getElementById("policyStart");
const policyEnd = document.getElementById("policyEnd");


  let selectedPatientId = null;

  /* ================= LOAD PATIENTS ================= */

async function loadPatients() {
  const res = await fetch("http://localhost:3000/api/patients");
  const patients = await res.json();
  renderPatients(patients);
}
  loadPatients();
const searchInput = document.querySelector(".search-box input");

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();

  // If empty → reload all patients
  if (!query) {
    loadPatients();
    return;
  }

  const res = await fetch(
    `http://localhost:3000/api/patients/search?q=${encodeURIComponent(query)}`
  );
  const patients = await res.json();

  renderPatients(patients);
});
function renderPatients(patients) {
  document.querySelectorAll(".patient-row").forEach(r => r.remove());

  patients.forEach(p => {
    const row = document.createElement("div");
    row.className = "patient-row";
    row.dataset.id = p.id;

    row.innerHTML = `
      <span>${p.first_name} ${p.last_name}</span>
      <span>${p.phone}</span>
      <span>${p.city || "-"}</span>
      <span class="count view-link">View</span>
    `;

    patientList.appendChild(row);
  });
}

  /* ================= VIEW CLICK ================= */

  patientList.addEventListener("click", e => {
    if (!e.target.classList.contains("view-link")) return;

    const row = e.target.closest(".patient-row");
    if (!row) return;

    selectedPatientId = row.dataset.id;

    document.querySelectorAll(".patient-row")
      .forEach(r => r.classList.remove("active"));
    row.classList.add("active");

    loadPatientSummary(selectedPatientId);
    loadPolicies(selectedPatientId);
  });

  /* ================= PATIENT SUMMARY ================= */

  async function loadPatientSummary(id) {
    const res = await fetch("http://localhost:3000/api/patients");
    const patients = await res.json();
    const p = patients.find(x => x.id == id);

    if (!p) return;

    document.getElementById("summaryName").textContent =
      `${p.first_name} ${p.last_name}`;
    document.getElementById("summaryCity").textContent = p.city || "-";
    document.getElementById("summaryPhone").textContent = p.phone;
    document.getElementById("summaryEmail").textContent = p.email;
  }

  /* ================= LOAD POLICIES ================= */

  async function loadPolicies(patientId) {
    const res = await fetch(
      `http://localhost:3000/api/policies/patient/${patientId}`
    );
    const policies = await res.json();

    policyBody.innerHTML = "";

    if (!policies.length) {
      policyBody.innerHTML =
        `<tr><td colspan="7">No policies found</td></tr>`;
      return;
    }

    policies.forEach(p => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>HS-${p.id}</td>
        <td>${p.plan}</td>
        <td>${p.sum_insured}</td>
        <td>${new Date(p.start_date).toLocaleDateString()}</td>
        <td>${new Date(p.end_date).toLocaleDateString()}</td>
        
       <td>
  <span class="status-badge ${p.status.toLowerCase()}">
    <span class="dot"></span>
    ${p.status}
  </span>
</td>
<td class="action-cell">
  ${p.status === "ACTIVE"
    ? `<button class="action-btn cancel-btn" data-id="${p.id}">Cancel</button>`
    : ""}
  ${p.status !== "CANCELLED"
    ? `<button class="action-btn renew-btn" data-id="${p.id}">Renew</button>`
    : ""}
</td>


      `;

      policyBody.appendChild(tr);
    });
  }

  /* ================= CANCEL / RENEW ================= */

  document.addEventListener("click", async e => {

    if (e.target.classList.contains("cancel-btn")) {
      const id = e.target.dataset.id;
      if (!confirm("Cancel this policy?")) return;

      await fetch(`http://localhost:3000/api/policies/${id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "User cancelled" })
      });

      loadPolicies(selectedPatientId);
    }

    if (e.target.classList.contains("renew-btn")) {
      const id = e.target.dataset.id;

      await fetch(`http://localhost:3000/api/policies/${id}/renew`, {
        method: "PUT"
      });

      loadPolicies(selectedPatientId);
    }
  });
async function loadStats() {
  const res = await fetch("http://localhost:3000/api/policies/stats");
  const s = await res.json();

  document.getElementById("statActive").textContent = s.active;
  document.getElementById("statCancelled").textContent = s.cancelled;
  document.getElementById("statExpired").textContent = s.expired;
  document.getElementById("statExpiring").textContent = s.expiringSoon;
}

loadStats();
addPolicyBtn.addEventListener("click", () => {
  if (!selectedPatientId) {
    alert("Please select a patient first");
    return;
  }
  policyModal.classList.remove("hidden");
});
policyCancelBtn.addEventListener("click", () => {
  policyModal.classList.add("hidden");
});
policySaveBtn.addEventListener("click", async () => {
  if (
    !policyPlan.value ||
    !policySum.value ||
    !policyStart.value ||
    !policyEnd.value
  ) {
    alert("All fields are required");
    return;
  }

  const payload = {
    patientId: selectedPatientId,
    plan: policyPlan.value,
    sumInsured: policySum.value,
    startDate: policyStart.value,
    endDate: policyEnd.value
  };

  const res = await fetch("http://localhost:3000/api/policies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  alert(result.message);

  policyModal.classList.add("hidden");
  loadPolicies(selectedPatientId);

  // clear fields
  policyPlan.value = "";
  policySum.value = "";
  policyStart.value = "";
  policyEnd.value = "";
});
const onboardBtn = document.querySelector(".primary-btn");
const modal = document.getElementById("modal-overlay");
const cancelBtn = document.getElementById("cancelBtn");

onboardBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

});















