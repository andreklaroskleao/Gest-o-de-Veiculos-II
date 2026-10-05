import { categoryTotals, filterPeriod, fuelSummary, costPerKm } from "./calculations.js";
import { numeric } from "./utils.js";

export function financialEvents(data) {
  return [
    ...(data.refuels || []).map((item) => ({ id: item.id, path: item.path, kind: "refuels", date: item.date, category: "Combustível", detail: `${item.fuel || "Abastecimento"}${item.station ? ` · ${item.station}` : ""}`, amount: numeric(item.total), odometer: item.odometer })),
    ...(data.maintenances || []).map((item) => ({ id: item.id, path: item.path, kind: "maintenances", date: item.date, category: "Manutenção", detail: item.service || item.category || "Serviço", amount: numeric(item.amount), odometer: item.odometer })),
    ...(data.tires || []).map((item) => ({ id: item.id, path: item.path, kind: "tires", date: item.date, category: "Pneus", detail: `${item.action || "Serviço"}${item.brand ? ` · ${item.brand}` : ""}`, amount: numeric(item.amount), odometer: item.odometer })),
    ...(data.expenses || []).map((item) => ({ id: item.id, path: item.path, kind: "expenses", date: item.date, category: item.category || "Outros", detail: item.description || item.notes || "Despesa", amount: numeric(item.amount), odometer: item.odometer, tripId: item.tripId })),
  ].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function getFinanceSummary(data, events = financialEvents(data)) {
  const refuels = data.refuels || [];
  const maintenance = (data.maintenances || []).reduce((sum, item) => sum + numeric(item.amount), 0);
  const tires = (data.tires || []).reduce((sum, item) => sum + numeric(item.amount), 0);
  const other = (data.expenses || []).reduce((sum, item) => sum + numeric(item.amount), 0);
  const total = events.reduce((sum, item) => sum + item.amount, 0);
  const odometers = [
    ...(data.refuels || []).map((item) => numeric(item.odometer)),
    ...(data.maintenances || []).map((item) => numeric(item.odometer)),
    ...(data.tires || []).map((item) => numeric(item.odometer)),
    ...(data.trips || []).flatMap((item) => [numeric(item.startOdometer), numeric(item.endOdometer)]),
  ].filter((value) => value > 0);
  const kmDriven = odometers.length ? Math.max(...odometers) - Math.min(...odometers) : 0;
  return {
    total,
    fuel: refuels.reduce((sum, item) => sum + numeric(item.total), 0),
    maintenance,
    tires,
    other,
    monthlyAverage: events.length ? total / Math.max(1, new Set(events.map((item) => (item.date || "").slice(0, 7))).size) : 0,
    weeklyAverage: events.length ? total / Math.max(1, Math.ceil((Date.now() - new Date(`${events.at(-1).date}T12:00:00`).getTime()) / 604800000)) : 0,
    annual: events.filter((item) => String(item.date || "").startsWith(String(new Date().getFullYear()))).reduce((sum, item) => sum + item.amount, 0),
    costPerKm: costPerKm(total, kmDriven),
    kmDriven,
    categories: categoryTotals(events, "category", "amount"),
    fuelData: fuelSummary(refuels),
  };
}

export function reportEvents(data, type, period = "all", customStart = "", customEnd = "") {
  const events = financialEvents(data);
  const byType = {
    fuel: events.filter((item) => item.kind === "refuels"),
    maintenance: events.filter((item) => item.kind === "maintenances"),
    tires: events.filter((item) => item.kind === "tires"),
    expenses: events.filter((item) => item.kind === "expenses"),
    complete: events,
  };
  const selected = byType[type] || events;
  return period === "all" ? selected : filterPeriod(selected, period, "date", customStart, customEnd);
}

export function buildBackup(vehicle, data) {
  return {
    format: "rota-backup-v1",
    exportedAt: new Date().toISOString(),
    vehicle: Object.fromEntries(Object.entries(vehicle).filter(([key]) => key !== "path")),
    collections: Object.fromEntries(Object.entries(data).map(([name, records]) => [name, records.map(({ path, ...record }) => record)])),
  };
}
