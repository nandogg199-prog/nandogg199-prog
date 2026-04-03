window.WEDDING_CONFIG = {
  pareja: "Irene y Fernando",
  fecha: "21 de junio de 2026",
  dominio: "https://www.limonadadefresa.com",
  botonRegreso: "Volver a la invitación",
  textoCodigo: "Si has recibido un enlace personal, esta página reconocerá tu invitación automáticamente. Si no, escribe tu código.",
  rsvpDeadline: "",
  detalles: [
    { titulo: "Ceremonia", texto: "Escribe aquí la dirección, la hora exacta y una indicación sencilla para llegar." },
    { titulo: "Celebración", texto: "Añade el lugar de la comida o fiesta, la hora aproximada y cualquier detalle útil." },
    { titulo: "Transporte y aparcamiento", texto: "Aquí puedes poner si hay parking, autobús o un punto de encuentro." },
    { titulo: "Dress code", texto: "Si quieres pedir algo concreto, añádelo aquí. Si no, puedes borrar esta tarjeta." },
    { titulo: "Regalo", texto: "Si quieres añadir cuenta, Bizum, lista o simplemente dejar un mensaje bonito, escríbelo aquí." },
    { titulo: "Preguntas frecuentes", texto: "Usa esta tarjeta para niños, horarios, intolerancias, música, alojamiento o cualquier otra duda." }
  ],
  regaloConfirmacion: {
    titulo: "Regalo",
    texto: "Vuestra presencia es nuestro mejor regalo, pero si os apetece tener un detalle con nosotros podéis hacerlo aquí.",
    iban: "ES00 0000 0000 0000 0000 0000",
    titular: "Irene y Fernando"
  }
};

window.RSVP_CONFIG = {
  functionUrl: "https://sehstzaaqtkvjigvczla.supabase.co/functions/v1/clever-processor",
  anonKey: "PEGA_AQUI_TU_PUBLISHABLE_KEY_DE_SUPABASE",
  campoCodigo: "código",
  exitoTitulo: "¡Respuesta guardada!",
  exitoTexto: "Gracias por responder. Si necesitas cambiar algo, puedes volver a entrar con el mismo enlace.",
  errorGenerico: "No he podido guardar la respuesta. Revisa la configuración de Supabase y vuelve a probar."
};