import { todayISO, escapeHtml } from "./utils.js";
import { validatePaymentMethod, validateRecord, validateVehicle } from "./validation.js";

const fuelOptions = [["gasolina-comum", "Gasolina comum"], ["gasolina-aditivada", "Gasolina aditivada"], ["etanol", "Etanol"], ["diesel", "Diesel"], ["gnv", "GNV"], ["outro", "Outro"]];
const maintenanceOptions = ["Motor", "Lubrificação", "Freios", "Suspensão", "Pneus", "Elétrica", "Ar-condicionado", "Transmissão", "Direção", "Arrefecimento", "Funilaria", "Estética", "Documentação", "Outros"].map((item) => [item.toLowerCase(), item]);
const expenseOptions = ["Combustível", "Manutenção", "Pneus", "IPVA", "Licenciamento", "Seguro", "Multas", "Pedágio", "Estacionamento", "Lavagem", "Acessórios", "Documentação", "Alimentação", "Hospedagem", "Outros"].map((item) => [item.toLowerCase(), item]);

const definitions = {
  vehicles: { title: "Adicionar veículo", subtitle: "Cadastre os dados para começar a acompanhar seus custos.", collection: "vehicles", fields: [
    { id: "name", label: "Apelido", placeholder: "Ex.: Sandero da família", required: true },
    { id: "type", label: "Tipo", type: "select", required: true, options: [["carro", "Carro"], ["moto", "Moto"], ["utilitario", "Utilitário"], ["caminhao", "Caminhão"], ["outro", "Outro"]] },
    { id: "make", label: "Marca", placeholder: "Ex.: Renault" },
    { id: "model", label: "Modelo", placeholder: "Ex.: Sandero" },
    { id: "version", label: "Versão" },
    { id: "year", label: "Ano", type: "number", min: 1900, step: 1 },
    { id: "engine", label: "Motorização", placeholder: "Ex.: 1.6 16V" },
    { id: "fuel", label: "Combustível principal", type: "select", required: true, options: fuelOptions },
    { id: "tankCapacity", label: "Capacidade do tanque (L)", type: "number", min: 0, step: "0.1" },
    { id: "currentOdometer", label: "Quilometragem atual", type: "number", min: 0, step: 1, value: 0 },
    { id: "city", label: "Cidade de referência" },
    { id: "tireSize", label: "Medida dos pneus", placeholder: "Ex.: 185/65 R15" },
    { id: "tirePressure", label: "Pressão recomendada (PSI)", type: "number", min: 0, step: "0.1" },
    { id: "notes", label: "Observações", type: "textarea", full: true },
  ] },
  paymentMethods: { title: "Cadastrar cart\u00e3o", subtitle: "Os dados identificadores do cartao ficam na sua conta.", collection: "paymentMethods", fields: [
    { id: "name", label: "Nome do cart\u00e3o", required: true, placeholder: "Ex.: Cartao principal" },
    { id: "institution", label: "Institui\u00e7\u00e3o financeira", required: true, placeholder: "Ex.: Banco ou emissor" },
    { id: "cardNumber", label: "N\u00famero do cart\u00e3o", type: "card-number", required: true, help: "Por seguran\u00e7a, somente os quatro \u00faltimos d\u00edgitos ser\u00e3o guardados. Nunca informe CVV." },
    { id: "expiry", label: "Validade", type: "month", required: true },
  ] },
  refuels: { title: "Registrar abastecimento", subtitle: "O consumo só aparece após dados suficientes entre tanques cheios.", collection: "refuels", fields: [
    { id: "date", label: "Data", type: "date", required: true, value: todayISO() },
    { id: "odometer", label: "Quilometragem (km)", type: "number", min: 0, step: 1, required: true },
    { id: "fuel", label: "Combustível", type: "select", required: true, options: fuelOptions },
    { id: "city", label: "Cidade" },
    { id: "liters", label: "Litros", type: "number", min: 0.01, step: "0.001", required: true },
    { id: "pricePerLiter", label: "Preço por litro (R$)", type: "number", min: 0.01, step: "0.001", required: true },
    { id: "total", label: "Valor total (R$)", type: "number", min: 0.01, step: "0.01", required: true },
    { id: "station", label: "Posto" },
    { id: "paymentMethod", label: "Forma de pagamento", type: "payment-method" },
    { id: "fullTank", label: "Tanque cheio", type: "checkbox", full: true },
    { id: "notes", label: "Observações", type: "textarea", full: true },
  ] },
  maintenances: { title: "Registrar manutenção", subtitle: "Inclua serviços programados ou qualquer reparo feito no veículo.", collection: "maintenances", fields: [
    { id: "date", label: "Data", type: "date", required: true, value: todayISO() },
    { id: "odometer", label: "Quilometragem (km)", type: "number", min: 0, step: 1 },
    { id: "city", label: "Cidade" },
    { id: "category", label: "Categoria", type: "select", required: true, options: maintenanceOptions, allowCustom: true },
    { id: "service", label: "Serviço", required: true, placeholder: "Ex.: Troca de óleo ou correia dentada" },
    { id: "amount", label: "Valor (R$)", type: "number", min: 0, step: "0.01", required: true },
    { id: "workshop", label: "Oficina" },
    { id: "paymentMethod", label: "Forma de pagamento", type: "payment-method" },
    { id: "nextDate", label: "Próxima data", type: "date" },
    { id: "nextOdometer", label: "Próxima quilometragem", type: "number", min: 0, step: 1 },
    { id: "details", label: "Detalhes do serviço", type: "textarea", full: true },
    { id: "notes", label: "Observações", type: "textarea", full: true },
  ] },
  tires: { title: "Registrar serviço de pneus", subtitle: "Acompanhe compra, troca, conserto e vida útil do conjunto.", collection: "tires", fields: [
    { id: "date", label: "Data", type: "date", required: true, value: todayISO() },
    { id: "odometer", label: "Quilometragem (km)", type: "number", min: 0, step: 1 },
    { id: "action", label: "Serviço", type: "select", required: true, options: [["compra", "Compra"], ["troca", "Troca"], ["conserto", "Conserto"], ["furo", "Furo"], ["alinhamento", "Alinhamento"], ["balanceamento", "Balanceamento"], ["rodizio", "Rodízio"], ["outros", "Outros"]], allowCustom: true },
    { id: "quantity", label: "Quantidade", type: "number", min: 1, step: 1, value: 1 },
    { id: "brand", label: "Marca" },
    { id: "model", label: "Modelo" },
    { id: "tireSize", label: "Medida" },
    { id: "position", label: "Posição", placeholder: "Ex.: dianteiro esquerdo" },
    { id: "amount", label: "Valor total (R$)", type: "number", min: 0, step: "0.01", required: true },
    { id: "paymentMethod", label: "Forma de pagamento", type: "payment-method" },
    { id: "details", label: "Detalhes", type: "textarea", full: true },
  ] },
  expenses: { title: "Registrar despesa", subtitle: "Vincule o gasto a uma viagem quando fizer parte do percurso.", collection: "expenses", fields: [
    { id: "date", label: "Data", type: "date", required: true, value: todayISO() },
    { id: "city", label: "Cidade" },
    { id: "category", label: "Categoria", type: "select", required: true, options: expenseOptions, allowCustom: true },
    { id: "description", label: "Descrição", required: true },
    { id: "amount", label: "Valor (R$)", type: "number", min: 0, step: "0.01", required: true },
    { id: "paymentMethod", label: "Forma de pagamento", type: "payment-method" },
    { id: "tripId", label: "Viagem relacionada", type: "trip-select" },
    { id: "notes", label: "Observações", type: "textarea", full: true },
  ] },
  trips: { title: "Registrar viagem", subtitle: "A distância é calculada pela diferença entre os odômetros.", collection: "trips", fields: [
    { id: "startDate", label: "Data de início", type: "date", required: true, value: todayISO() },
    { id: "endDate", label: "Data de fim", type: "date" },
    { id: "origin", label: "Origem", required: true },
    { id: "destination", label: "Destino", required: true },
    { id: "startOdometer", label: "Quilometragem inicial", type: "number", min: 0, step: 1, required: true },
    { id: "endOdometer", label: "Quilometragem final", type: "number", min: 0, step: 1, required: true },
    { id: "purpose", label: "Finalidade", placeholder: "Ex.: trabalho, lazer" },
    { id: "description", label: "Descrição", type: "textarea", full: true },
    { id: "notes", label: "Observações", type: "textarea", full: true },
  ] },
};

const commonPaymentMethods = [
  ["method:pix", "Pix"], ["method:dinheiro", "Dinheiro"],
  ["method:transferencia", "Transfer\u00eancia banc\u00e1ria"], ["method:boleto", "Boleto"],
  ["method:carteira-digital", "Carteira digital"], ["method:outro", "Outro"],
];

function paymentCardLabel(method) {
  return `Cart\u00e3o - ${method.name} - ${method.institution} - final ${method.lastFour}`;
}

function paymentChoiceFor(record = {}, paymentMethods = []) {
  if (record.paymentMethodId && paymentMethods.some((item) => item.id === record.paymentMethodId)) return `card:${record.paymentMethodId}`;
  const existing = String(record.paymentMethod || "");
  const common = commonPaymentMethods.find(([, label]) => label.toLowerCase() === existing.toLowerCase());
  return common ? common[0] : existing ? `legacy:${existing}` : "";
}

function applyPaymentChoice(data, paymentMethods) {
  const selected = String(data.paymentMethod || "");
  if (selected.startsWith("card:")) {
    const paymentMethodId = selected.slice(5);
    const method = paymentMethods.find((item) => item.id === paymentMethodId);
    data.paymentMethodId = paymentMethodId;
    data.paymentMethod = method ? paymentCardLabel(method) : "";
  } else if (selected.startsWith("method:")) {
    data.paymentMethodId = "";
    data.paymentMethod = commonPaymentMethods.find(([value]) => value === selected)?.[1] || "";
  } else if (selected.startsWith("legacy:")) {
    data.paymentMethodId = "";
    data.paymentMethod = selected.slice(7);
  } else {
    data.paymentMethodId = "";
    data.paymentMethod = "";
  }
}

function valueFor(field, record = {}) {
  if (record[field.id] != null) return record[field.id];
  return field.value ?? "";
}

function fieldMarkup(field, record, trips, paymentMethods) {
  const value = valueFor(field, record);
  const required = field.required ? "required" : "";
  const full = field.full ? " full" : "";
  if (field.type === "payment-method") {
    const selected = paymentChoiceFor(record, paymentMethods);
    const options = [["", "N\u00e3o informado"], ...commonPaymentMethods, ...paymentMethods.map((item) => [`card:${item.id}`, paymentCardLabel(item)])];
    if (selected.startsWith("legacy:")) options.push([selected, selected.slice(7)]);
    return `<div class="form-field${full}"><label for="field-${field.id}">${escapeHtml(field.label)}</label><select id="field-${field.id}" name="${field.id}">${options.map(([key, label]) => `<option value="${escapeHtml(key)}" ${key === selected ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select>${paymentMethods.length ? "" : `<small class="form-help">Cadastre seus cart\u00f5es na area Formas de pagamento.</small>`}</div>`;
  }
  if (field.type === "card-number") {
    const requiredNumber = field.required && !record.lastFour ? "required" : "";
    const help = record.lastFour ? `Cart\u00e3o salvo: final ${escapeHtml(record.lastFour)}. Deixe em branco para manter.` : field.help;
    return `<div class="form-field${full}"><label for="field-${field.id}">${escapeHtml(field.label)}${requiredNumber ? " *" : ""}</label><input id="field-${field.id}" name="${field.id}" type="text" inputmode="numeric" autocomplete="cc-number" maxlength="23" ${requiredNumber} placeholder="0000 0000 0000 0000" /><small class="form-help">${escapeHtml(help || "")}</small></div>`;
  }
  if (field.type === "checkbox") return `<label class="form-field full checkbox-control"><input id="field-${field.id}" name="${field.id}" type="checkbox" ${value === true ? "checked" : ""} /><span>${escapeHtml(field.label)}</span></label>`;
  if (field.type === "select" || field.type === "trip-select") {
    const options = field.type === "trip-select"
      ? [["", "Nenhuma"], ...trips.map((trip) => [trip.id, `${trip.origin || "Origem"} → ${trip.destination || "Destino"} · ${trip.startDate || ""}`])]
      : [["", "Selecione"], ...field.options];
    const custom = field.allowCustom ? ` data-custom="true"` : "";
    return `<div class="form-field${full}"><label for="field-${field.id}">${escapeHtml(field.label)}${field.required ? " *" : ""}</label><select id="field-${field.id}" name="${field.id}" ${required}${custom}>${options.map(([key, label]) => `<option value="${escapeHtml(key)}" ${key === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}</select>${field.allowCustom ? `<input class="custom-select-input" data-for="${field.id}" placeholder="Ou informe outra opção" value="${field.options.some(([key]) => key === value) ? "" : escapeHtml(value)}" />` : ""}</div>`;
  }
  const type = field.type || "text";
  const attrs = [required, field.min != null ? `min="${field.min}"` : "", field.step ? `step="${field.step}"` : "", field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : "", field.readonly ? "readonly" : ""].filter(Boolean).join(" ");
  if (type === "textarea") return `<div class="form-field${full}"><label for="field-${field.id}">${escapeHtml(field.label)}${field.required ? " *" : ""}</label><textarea id="field-${field.id}" name="${field.id}" ${required} placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(value)}</textarea></div>`;
  return `<div class="form-field${full}"><label for="field-${field.id}">${escapeHtml(field.label)}${field.required ? " *" : ""}</label><input id="field-${field.id}" name="${field.id}" type="${type}" value="${escapeHtml(value)}" ${attrs} />${field.help ? `<small class="form-help">${escapeHtml(field.help)}</small>` : ""}</div>`;
}

export function openEntryForm(kind, { dialog, vehicle, trips = [], paymentMethods = [], record = null, initialValues = null, onSubmit }) {
  const definition = definitions[kind];
  if (!definition) return;
  const editing = Boolean(record);
  const title = editing ? `Editar ${definition.title.replace(/^Registrar |^Adicionar |^Cadastrar /, "").toLowerCase()}` : definition.title;
  const formId = "entry-form";
  dialog.innerHTML = `<div class="dialog-head"><div><p class="section-kicker">${escapeHtml(vehicle?.name || "ROTA")}</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(definition.subtitle)}</p></div><button class="dialog-close" type="button" aria-label="Fechar">×</button></div><form id="${formId}" class="dialog-form"><div class="form-grid">${definition.fields.map((field) => fieldMarkup(field, record || initialValues || {}, trips, paymentMethods)).join("")}</div><p id="form-error" class="form-error" role="alert"></p><div class="form-actions"><button type="button" class="button button-quiet" data-cancel>Cancelar</button><button type="submit" class="button button-primary">${editing ? "Salvar alterações" : "Salvar registro"}</button></div></form>`;
  const form = dialog.querySelector(`#${formId}`);
  const close = () => dialog.close();
  dialog.querySelector(".dialog-close").addEventListener("click", close);
  dialog.querySelector("[data-cancel]").addEventListener("click", close);
  const total = form.elements.namedItem("total");
  const liters = form.elements.namedItem("liters");
  const price = form.elements.namedItem("pricePerLiter");
  const syncTotal = () => {
    if (total && liters?.value && price?.value) total.value = (Number(liters.value) * Number(price.value)).toFixed(2);
  };
  liters?.addEventListener("input", syncTotal);
  price?.addEventListener("input", syncTotal);
  const startKm = form.elements.namedItem("startOdometer");
  const endKm = form.elements.namedItem("endOdometer");
  form.addEventListener("input", (event) => {
    if ([startKm, endKm].includes(event.target) && startKm?.value && endKm?.value && Number(endKm.value) >= Number(startKm.value)) {
      const distanceField = form.querySelector("#trip-distance-value");
      if (distanceField) distanceField.textContent = `${Number(endKm.value) - Number(startKm.value)} km`;
    }
  });
  form.querySelectorAll(".custom-select-input").forEach((input) => input.addEventListener("input", () => {
    const select = form.elements.namedItem(input.dataset.for);
    if (input.value.trim()) {
      const custom = [...select.options].find((option) => option.value === "__custom");
      if (!custom) select.add(new Option("Outra opção", "__custom"));
      select.value = "__custom";
    }
  }));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    for (const checkbox of form.querySelectorAll('input[type="checkbox"]')) data[checkbox.name] = checkbox.checked;
    for (const field of definition.fields) {
      const select = form.elements.namedItem(field.id);
      if (field.allowCustom && select?.value === "__custom") data[field.id] = form.querySelector(`[data-for="${field.id}"]`)?.value.trim() || "Outros";
    }
    if (data.total == null && data.liters && data.pricePerLiter) data.total = (Number(data.liters) * Number(data.pricePerLiter)).toFixed(2);
    if (kind === "refuels" && !data.total && data.liters && data.pricePerLiter) data.total = (Number(data.liters) * Number(data.pricePerLiter)).toFixed(2);
    const validation = kind === "vehicles" ? validateVehicle(data) : kind === "paymentMethods" ? validatePaymentMethod(data, Boolean(record)) : validateRecord(kind, data);
    if (validation) { form.querySelector("#form-error").textContent = validation; return; }
    for (const field of definition.fields) if (field.type === "number" && data[field.id] !== "") data[field.id] = Number(data[field.id]);
    if (kind === "paymentMethods") {
      const cardNumber = String(data.cardNumber || "").replace(/\D/g, "");
      delete data.cardNumber;
      data.lastFour = cardNumber ? cardNumber.slice(-4) : record.lastFour;
    } else if (definition.fields.some((field) => field.type === "payment-method")) {
      applyPaymentChoice(data, paymentMethods);
    }
    if (kind === "trips") data.distance = Number(data.endOdometer) - Number(data.startOdometer);
    const tripId = data.tripId || "";
    delete data.tripId;
    try {
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      submit.textContent = "Salvando…";
      await onSubmit({ ...data, _tripId: tripId, _collection: definition.collection });
      dialog.close();
    } catch (error) {
      form.querySelector("#form-error").textContent = error.message || "Não foi possível salvar.";
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = false;
      submit.textContent = editing ? "Salvar alterações" : "Salvar registro";
    }
  });
  dialog.showModal();
}

export const formKinds = Object.keys(definitions);
