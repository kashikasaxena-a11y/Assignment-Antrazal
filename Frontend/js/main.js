/*
*********************************************************************************************************
 *  @File Name     : main.js
 *  @Author        : Kashika Saxena (kashika.saxena@antrazal.com)
 *  @Company       : Antrazal
 *  @Date          : 16-12-2025
 *  @Description   : Handles main frontend logic and API interactions
 *********************************************************************************************************
*/

import { required, emailFormat, phoneFormat } from "./validation.js";
import { validateForm } from "./formValidator.js";

document.addEventListener("DOMContentLoaded", () => {

  /* ================== ONBOARDING INPUTS ================== */
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const city = document.getElementById("city");
  const searchInput = document.querySelector(".search-box input");

  const onboardBtn = document.getElementById("onboardBtn");
  const modalOverlay = document.getElementById("modal-overlay");
  const cancelBtn = document.getElementById("cancelBtn");
  const nextBtn = document.getElementById("nextBtn");

  const steps = document.querySelectorAll(".step");
  const stepDots = document.querySelectorAll(".steps span");

  let currentStep = 0;

  /* ================== MAIN ELEMENTS ================== */
  const patientList = document.getElementById("patientListCard");
  const policyBody = document.getElementById("policyBody");
  const addPolicyBtn = document.getElementById("addPolicyBtn");

  let selectedPatientId = null;

  /* ================== POLICY MODAL ================== */
  const policyModal = document.getElementById("policy-modal-overlay");
  const policyCancelBtn = document.getElementById("policyCancelBtn");
  const policySaveBtn = document.getElementById("policySaveBtn");

  const policyPlan = document.getElementById("policyPlan");
  const policySum = document.getElementById("policySum");
  const policyStart = document.getElementById("policyStart");
  const policyEnd = document.getElementById("policyEnd");

  /* ================== SHOW STEP FUNCTION ================== */
  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === index);
    });

    stepDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    nextBtn.textContent =
      index === steps.length - 1 ? "Submit" : "Next";
  }

  /* ================== ONBOARD MODAL ================== */
  onboardBtn.addEventListener("click", () => {
    modalOverlay.classList.remove("hidden");
    currentStep = 0;
    showStep(currentStep);
  });

  cancelBtn.addEventListener("click", () => {
    modalOverlay.classList.add("hidden");
  });

  nextBtn.addEventListener("click", () => {

    // STEP 1 validation
    if (currentStep === 0) {
      if (!firstName.value.trim() || !lastName.value.trim()) {
        alert("Please enter first and last name");
        return;
      }
    }

    // STEP 2 validation
    if (currentStep === 1) {
      if (
        !email.value.trim() ||
        !phone.value.trim() ||
        !city.value.trim()
      ) {
        alert("Please fill all fields");
        return;
      }
    }

    // FINAL SUBMIT
    if (currentStep === steps.length - 1) {
      submitPatient();
      return;
    }

    currentStep++;
    showStep(currentStep);
  });

  async function submitPatient() {
    const patientData = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      city: city.value.trim()
    };

    await fetch("http://localhost:3000/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData)
    });

    modalOverlay.classList.add("hidden");
    loadPatients();
  }

  /* ================== LOAD PATIENTS ================== */
  async function loadPatients() {
    const res = await fetch("http://localhost:3000/api/patients");
    const patients = await res.json();
    renderPatients(patients);
  }

  loadPatients();

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

  /* ================== VIEW PATIENT ================== */
  patientList.addEventListener("click", e => {
    if (!e.target.classList.contains("view-link")) return;

    const row = e.target.closest(".patient-row");
    selectedPatientId = row.dataset.id;

    document.querySelectorAll(".patient-row")
      .forEach(r => r.classList.remove("active"));
    row.classList.add("active");

    loadPatientSummary(selectedPatientId);
    loadPolicies(selectedPatientId);
  });

  async function loadPatientSummary(id) {
    const res = await fetch("http://localhost:3000/api/patients");
    const patients = await res.json();
    const p = patients.find(x => x.id == id);

    document.getElementById("summaryName").textContent =
      `${p.first_name} ${p.last_name}`;
    document.getElementById("summaryCity").textContent = p.city;
    document.getElementById("summaryPhone").textContent = p.phone;
    document.getElementById("summaryEmail").textContent = p.email;
  }

  /* ================== LOAD POLICIES ================== */
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
            <span class="dot"></span>${p.status}
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

  /* ================== CANCEL / RENEW ================== */
  document.addEventListener("click", async e => {
    if (e.target.classList.contains("cancel-btn")) {
      const id = e.target.dataset.id;
      if (!confirm("Cancel this policy?")) return;

      await fetch(`http://localhost:3000/api/policies/${id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
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

  /* ================== POLICY ISSUE ================== */
  addPolicyBtn.addEventListener("click", () => {
    if (!selectedPatientId) {
      alert("Select a patient first");
      return;
    }
    policyModal.classList.remove("hidden");
  });

  policyCancelBtn.addEventListener("click", () => {
    policyModal.classList.add("hidden");
  });

  policySaveBtn.addEventListener("click", async () => {
    const payload = {
      patientId: selectedPatientId,
      plan: policyPlan.value,
      sumInsured: policySum.value,
      startDate: policyStart.value,
      endDate: policyEnd.value
    };

    await fetch("http://localhost:3000/api/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    policyModal.classList.add("hidden");
    loadPolicies(selectedPatientId);
  });


searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();

  try {
    const url = query
      ? `http://localhost:3000/api/patients/search?q=${encodeURIComponent(query)}`
      : `http://localhost:3000/api/patients`;

    const res = await fetch(url);
    const patients = await res.json();

    if (!Array.isArray(patients)) {
      renderPatients([]);
      return;
    }

    renderPatients(patients);
  } catch (err) {
    console.error("Search failed:", err);
  }
});
function renderPatients(patients = []) {
  document.querySelectorAll(".patient-row").forEach(r => r.remove());

  if (!patients.length) {
    const empty = document.createElement("div");
    empty.className = "patient-row";
    empty.innerHTML = `<span>No patients found</span>`;
    patientList.appendChild(empty);
    return;
  }

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

});
















