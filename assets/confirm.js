(function () {
  const weddingCfg = window.WEDDING_CONFIG;
  const rsvpCfg = window.RSVP_CONFIG;
  const params = new URLSearchParams(window.location.search);

  const introText = document.getElementById("introText");
  introText.textContent = weddingCfg.textoCodigo;

  const manualCode = document.getElementById("manualCode");
  const loadCodeBtn = document.getElementById("loadCodeBtn");
  const formPanel = document.getElementById("formPanel");
  const codePanel = document.getElementById("codePanel");
  const statusText = document.getElementById("statusText");
  const successBox = document.getElementById("successBox");
  const saveBtn = document.getElementById("saveBtn");
  const badgeEstado = document.getElementById("badgeEstado");
  const grupoNombre = document.getElementById("grupoNombre");
  const grupoInvitados = document.getElementById("grupoInvitados");
  const grupoPlazas = document.getElementById("grupoPlazas");
  const grupoAlergias = document.getElementById("grupoAlergias");
  const grupoNecesidades = document.getElementById("grupoNecesidades");
  const grupoAlergiasRow = document.getElementById("grupoAlergiasRow");
  const grupoNecesidadesRow = document.getElementById("grupoNecesidadesRow");
  const attendingCount = document.getElementById("attendingCount");
  const dietNotes = document.getElementById("dietNotes");
  const songRequest = document.getElementById("songRequest");
  const message = document.getElementById("message");
  const form = document.getElementById("rsvpForm");

  document.getElementById("volverInvitacion").textContent = weddingCfg.botonRegreso;

  let currentCode = null;
  let currentMaxGuests = 1;

  function setText(el, value) {
    el.textContent = value || "—";
  }

  function normalizeCode(value) {
    return String(value || "").trim().toUpperCase();
  }

  async function callFunction(payload) {
    if (!rsvpCfg.functionUrl || rsvpCfg.functionUrl.indexOf("PEGA_AQUI") !== -1) {
      throw new Error("Falta configurar la URL de la Edge Function en assets/site-config.js");
    }

    const headers = {
      "Content-Type": "application/json"
    };

    if (rsvpCfg.anonKey) {
      headers["apikey"] = rsvpCfg.anonKey;
      headers["Authorization"] = `Bearer ${rsvpCfg.anonKey}`;
    }

    const response = await fetch(rsvpCfg.functionUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "No he podido procesar la solicitud.");
    }
    return data;
  }

  function fillForm(record) {
    formPanel.classList.remove("hidden");
    codePanel.classList.add("hidden");
    successBox.classList.add("hidden");

    currentMaxGuests = Number(record.max_guests || 1);

    grupoNombre.textContent = record.display_name || "Tu invitación";
    setText(grupoInvitados, String(record.guest_names || "").split("|").map(s => s.trim()).join(", "));
    setText(grupoPlazas, currentMaxGuests);
    setText(grupoAlergias, record.allergies_summary || "—");
    setText(grupoNecesidades, record.needs_summary || "—");

    grupoAlergiasRow.classList.toggle("hidden", !record.allergies_summary);
    grupoNecesidadesRow.classList.toggle("hidden", !record.needs_summary);

    const currentStatus = record.status || "pendiente";
    badgeEstado.textContent = currentStatus === "si" ? "Confirmado" : currentStatus === "no" ? "No asiste" : "Pendiente";
    const radio = form.querySelector(`input[name="status"][value="${currentStatus}"]`);
    if (radio) radio.checked = true;
    attendingCount.value = record.attending_count ?? "";
    dietNotes.value = record.diet_notes || "";
    songRequest.value = record.song_request || "";
    message.value = record.message || "";

    document.getElementById("verDetalles").href = `../detalles/?codigo=${encodeURIComponent(currentCode)}`;
    document.getElementById("volverInvitacion").href = `../?codigo=${encodeURIComponent(currentCode)}`;
  }

  async function loadInvitation(code) {
    const cleanCode = normalizeCode(code);
    if (!cleanCode) {
      statusText.textContent = "Escribe tu código para continuar.";
      return;
    }
    currentCode = cleanCode;
    manualCode.value = cleanCode;
    statusText.textContent = "Buscando tu invitación...";
    try {
      const data = await callFunction({ action: "load", code: cleanCode });
      fillForm(data.record);
      statusText.textContent = "";
    } catch (error) {
      statusText.textContent = error.message || "No he encontrado esa invitación.";
    }
  }

  loadCodeBtn.addEventListener("click", () => loadInvitation(manualCode.value));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = (new FormData(form)).get("status");
    if (!status) {
      statusText.textContent = "Marca primero si asistiréis o no.";
      return;
    }

    const count = Number(attendingCount.value || 0);
    if (status === "si" && (count < 1 || count > currentMaxGuests)) {
      statusText.textContent = `Indica un número entre 1 y ${currentMaxGuests}.`;
      return;
    }
    if (status === "no") {
      attendingCount.value = 0;
    }

    saveBtn.disabled = true;
    statusText.textContent = "Guardando respuesta...";
    try {
      await callFunction({
        action: "save",
        code: currentCode,
        payload: {
          status,
          attending_count: status === "no" ? 0 : Number(attendingCount.value || 0),
          diet_notes: dietNotes.value.trim(),
          song_request: songRequest.value.trim(),
          message: message.value.trim()
        }
      });

      badgeEstado.textContent = status === "si" ? "Confirmado" : "No asiste";
      document.getElementById("successTitle").textContent = rsvpCfg.exitoTitulo;
      document.getElementById("successText").textContent = rsvpCfg.exitoTexto;
      successBox.classList.remove("hidden");
      statusText.textContent = "";
    } catch (error) {
      statusText.textContent = error.message || rsvpCfg.errorGenerico;
    } finally {
      saveBtn.disabled = false;
    }
  });

  const codeFromUrl = normalizeCode(params.get("codigo"));
  if (codeFromUrl) {
    loadInvitation(codeFromUrl);
  }
})();