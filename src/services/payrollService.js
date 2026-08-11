import { apiGet, apiPost } from "./apiClient";

export async function processPayroll(year, month) {
  return apiPost(`/api/payroll/process?year=${year}&month=${month}`, {}) || [];
}

export async function fetchPayrollRecords(year, month) {
  return apiGet(`/api/payroll?year=${year}&month=${month}`) || [];
}

export async function fetchPayrollSummary(year, month) {
  return apiGet(`/api/payroll/summary?year=${year}&month=${month}`);
}

export async function fetchPayrollRecord(id) {
  return apiGet(`/api/payroll/${id}`);
}

export async function markPayrollAsPaid(id) {
  return apiPost(`/api/payroll/${id}/pay`, {});
}
