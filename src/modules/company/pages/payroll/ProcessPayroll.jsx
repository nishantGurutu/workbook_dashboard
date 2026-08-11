import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { processPayroll, fetchPayrollSummary } from "../../../../services/payrollService";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ProcessPayroll = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const handleProcess = async () => {
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const records = await processPayroll(year, month);
      setResult(records);
      const summ = await fetchPayrollSummary(year, month);
      setSummary(summ);
    } catch (err) {
      setError(err.message || "Failed to process payroll");
    } finally {
      setProcessing(false);
    }
  };

  const totalNet = (result || []).reduce((sum, r) => sum + (r.netPay || 0), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Process Payroll" description="Run payroll and approve salary disbursals" />

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20">
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20">
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <button onClick={handleProcess} disabled={processing}
            className="bg-workbook-dark text-white px-6 py-3 rounded-2xl hover:bg-workbook-light transition-all disabled:opacity-50 flex items-center gap-2 justify-center">
            {processing && <Loader2 size={18} className="animate-spin" />}
            {processing ? "Processing..." : "Run Payroll"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>
      )}

      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500">Employees Processed</p>
            <p className="text-4xl font-bold text-slate-800">{summary.processedCount}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
            <p className="text-sm text-green-700">Total Net Amount</p>
            <p className="text-4xl font-bold text-green-600">₹{totalNet.toLocaleString()}</p>
          </div>
          <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 shadow-sm">
            <p className="text-sm text-teal-700">Already Paid</p>
            <p className="text-4xl font-bold text-teal-700">{summary.paidCount}</p>
          </div>
        </div>
      )}

      {result && result.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-3">Processed Employees</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="text-left py-2 px-2">Employee</th>
                  <th className="text-left py-2 px-2">Present</th>
                  <th className="text-right py-2 px-2">Gross</th>
                  <th className="text-right py-2 px-2">Deductions</th>
                  <th className="text-right py-2 px-2">Net Pay</th>
                  <th className="text-center py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-2 px-2 font-medium text-slate-800">{r.employeeName}</td>
                    <td className="py-2 px-2 text-slate-600">
                      {r.presentDays + r.lateDays + r.halfDays * 0.5}/{r.totalWorkingDays}
                    </td>
                    <td className="py-2 px-2 text-right">₹{r.grossEarnings?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-red-600">-₹{r.totalDeductions?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right font-semibold text-workbook-dark">₹{r.netPay?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProcessPayroll;
