export const services = Object.freeze([
  { id: "corte", label: "Corte masculino", price: 35 },
  { id: "barba", label: "Barba", price: 25 },
  { id: "combo", label: "Corte + barba", price: 55 }
]);
export function validBusinessPhone(raw = "") {
  const phone = String(raw).replace(/\D/g, "");
  return /^55\d{10,11}$/.test(phone) ? phone : null;
}
export function whatsappUrl(id, rawPhone = "") {
  const service = services.find((x) => x.id === id);
  if (!service) throw new Error("Serviço inválido");
  const message = "Olá! Gostaria de agendar " + service.label.toLowerCase() + " (preço ilustrativo de R$ " + service.price + "). Qual horário está disponível?";
  const number = validBusinessPhone(rawPhone) || "";
  return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
}
if (typeof document !== "undefined") {
  const button = document.getElementById("agendar");
  const status = document.getElementById("wa-status");
  const phone = new URLSearchParams(window.location.search).get("wa") || "";
  function refresh() {
    const id = document.querySelector('input[name="servico"]:checked')?.value || "corte";
    button.href = whatsappUrl(id, phone);
    status.textContent = validBusinessPhone(phone)
      ? "Número demonstrativo configurado para o estabelecimento."
      : "Esta é uma demonstração. Escolha o destinatário no WhatsApp. Na versão real, entra o número da loja.";
  }
  document.querySelectorAll('input[name="servico"]').forEach((x) => x.addEventListener("change", refresh));
  refresh();
}