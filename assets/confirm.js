(function () {
  const weddingCfg = window.WEDDING_CONFIG || {};
  const rsvpCfg = window.RSVP_CONFIG || {};
  const params = new URLSearchParams(window.location.search);

  const introText = document.getElementById("introText");
  if (introText) introText.textContent = weddingCfg.textoCodigo || "Escribe tu código para cargar tu invitación.";

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

  const volverInvitacion = document.getElementById("volverInvitacion");
  if (volverInvitacion) volverInvitacion.textContent = weddingCfg.botonRegreso || "Volver a la invitación";

  let currentCode = null;
  let currentMaxGuests = 1;

  function setText(el, value) {
    if (el) el.textContent = value || "—";
  }

  function normalizeCode(value) {
    return String(value || "").trim().toUpperCase();
  }

  async function callFunction(payload) {
    if (!rsvpCfg.functionUrl || rsvpCfg.functionUrl.indexOf("PEGA_AQUI") !== -1) {
      throw new Error("Falta configurar la URL de la función en assets/site-config.js");
    }

    const headers = { "Content-Type": "application/json" };

    if (rsvpCfg.anonKey && rsvpCfg.anonKey.indexOf("PEGA_AQUI") === -1) {
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
    if (formPanel) formPanel.classList.remove("hidden");
    if (codePanel) codePanel.classList.add("hidden");
    if (successBox) successBox.classList.add("hidden");

    currentMaxGuests = Number(record.max_guests || 1);

    if (grupoNombre) grupoNombre.textContent = record.display_name || "Tu invitación";
    setText(grupoInvitados, String(record.guest_names || "").split("|").map(s => s.trim()).join(", "));
    setText(grupoPlazas, String(currentMaxGuests));
    setText(grupoAlergias, record.allergies_summary || "—");
    setText(grupoNecesidades, record.needs_summary || "—");

    if (grupoAlergiasRow) grupoAlergiasRow.classList.toggle("hidden", !record.allergies_summary);
    if (grupoNecesidadesRow) grupoNecesidadesRow.classList.toggle("hidden", !record.needs_summary);

    const currentStatus = record.status || "pendiente";
    if (badgeEstado) badgeEstado.textContent = currentStatus === "si" ? "Confirmado" : currentStatus === "no" ? "No asiste" : "Pendiente";
    const radio = form?.querySelector(`input[name="status"][value="${currentStatus}"]`);
    if (radio) radio.checked = true;

    if (attendingCount) attendingCount.value = record.attending_count ?? "";
    if (dietNotes) dietNotes.value = record.diet_notes || "";
    if (songRequest) songRequest.value = record.song_request || "";
    if (message) message.value = record.message || "";

    const verDetalles = document.getElementById("verDetalles");
    if (verDetalles) verDetalles.href = `../detalles/?codigo=${encodeURIComponent(currentCode)}`;
    if (volverInvitacion) volverInvitacion.href = `../?codigo=${encodeURIComponent(currentCode)}`;
  }

  async function loadInvitation(code) {
    const cleanCode = normalizeCode(code);
    if (!cleanCode) {
      if (statusText) statusText.textContent = "Escribe tu código para continuar.";
      return;
    }
    currentCode = cleanCode;
    if (manualCode) manualCode.value = cleanCode;
    if (statusText) statusText.textContent = "Buscando tu invitación...";
    try {
      const data = await callFunction({ action: "load", code: cleanCode });
      fillForm(data.record);
      if (statusText) statusText.textContent = "";
    } catch (error) {
      if (statusText) statusText.textContent = error.message || "No he encontrado esa invitación.";
    }
  }

  if (loadCodeBtn) {
    loadCodeBtn.addEventListener("click", () => loadInvitation(manualCode?.value || ""));
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const status = (new FormData(form)).get("status");
      if (!status) {
        if (statusText) statusText.textContent = "Marca primero si asistiréis o no.";
        return;
      }

      const count = Number(attendingCount?.value || 0);
      if (status === "si" && (count < 1 || count > currentMaxGuests)) {
        if (statusText) statusText.textContent = `Indica un número entre 1 y ${currentMaxGuests}.`;
        return;
      }
      if (status === "no" && attendingCount) {
        attendingCount.value = 0;
      }

      if (saveBtn) saveBtn.disabled = true;
      if (statusText) statusText.textContent = "Guardando respuesta...";
      try {
        await callFunction({
          action: "save",
          code: currentCode,
          payload: {
            status,
            attending_count: status === "no" ? 0 : Number(attendingCount?.value || 0),
            diet_notes: (dietNotes?.value || "").trim(),
            song_request: (songRequest?.value || "").trim(),
            message: (message?.value || "").trim()
          }
        });

        if (badgeEstado) badgeEstado.textContent = status === "si" ? "Confirmado" : status === "no" ? "No asiste" : "Pendiente";
        const successTitle = document.getElementById("successTitle");
        const successText = document.getElementById("successText");
        if (successTitle) successTitle.textContent = rsvpCfg.exitoTitulo || "¡Respuesta guardada!";
        if (successText) successText.textContent = rsvpCfg.exitoTexto || "Gracias por responder.";
        if (successBox) successBox.classList.remove("hidden");
        if (statusText) statusText.textContent = "";
      } catch (error) {
        if (statusText) statusText.textContent = error.message || rsvpCfg.errorGenerico || "No he podido guardar la respuesta.";
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    });
  }

  const codeFromUrl = normalizeCode(params.get("codigo"));
  if (codeFromUrl) {
    loadInvitation(codeFromUrl);
  }
})();