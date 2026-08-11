import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { fetchPayrollRecords, fetchPayrollSummary, markPayrollAsPaid } from "../../../../services/payrollService";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Payroll = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [year, month]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recs, summ] = await Promise.all([
        fetchPayrollRecords(year, month),
        fetchPayrollSummary(year, month),
      ]);
      setRecords(recs);
      setSummary(summ);
    } catch (err) {
      console.error("Failed to load payroll data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm("Mark this payroll record as paid?")) return;
    try {
      await markPayrollAsPaid(id);
      await loadData();
    } catch (err) {
      console.error("Failed to mark as paid:", err);
    }
  };

  const filtered = records.filter((r) =>
    r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "employeeName", label: "Employee", width: "180px",
      render: (value) => <span className="font-medium text-slate-800">{value || "N/A"}</span>
    },
    {
      key: "designation", label: "Designation", width: "140px",
      render: (value) => <span className="text-slate-600">{value || "-"}</span>
    },
    {
      key: "presentDays", label: "Present", width: "80px",
      render: (v, row) => (
        <span className="text-slate-700">{v + row.lateDays}/{row.totalWorkingDays}</span>
      )
    },
    {
      key: "grossEarnings", label: "Gross", width: "110px",
      render: (value) => <span className="font-medium">₹{value?.toLocaleString()}</span>
    },
    {
      key: "totalDeductions", label: "Deductions", width: "110px",
      render: (value) => <span className="text-red-600">-₹{value?.toLocaleString()}</span>
    },
    {
      key: "netPay", label: "Net Salary", width: "130px",
      render: (value) => <span className="font-bold text-workbook-dark">₹{value?.toLocaleString()}</span>
    },
    {
      key: "status", label: "Status", width: "110px",
      render: (value) => (
        <StatusBadge status={value} variant={value === "PAID" ? "approved" : "pending"} />
      )
    },
    {
      key: "actions", label: "", width: "80px",
      render: (_, row) =>
        row.status !== "PAID" ? (
          <button onClick={() => handleMarkPaid(row.id)}
            className="text-xs px-3 py-1 rounded-lg bg-workbook-dark/10 text-workbook-dark hover:bg-workbook-dark/20">
            Pay
          </button>
        ) : null
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Payroll Management" description="Manage employee salaries and deductions" />

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Employee</label>
            <input type="text" placeholder="Search by name..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" />
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-600 mb-2">Total Employees</p>
            <p className="text-2xl font-bold text-slate-800">{summary.totalEmployees}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-600 mb-2">Processed</p>
            <p className="text-2xl font-bold text-slate-800">{summary.processedCount}/{summary.totalEmployees}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm text-green-700 mb-2">Paid</p>
            <p className="text-2xl font-bold text-green-600">{summary.paidCount}</p>
          </div>
          <div className="bg-workbook-dark/10 p-4 rounded-lg border border-workbook-dark/20">
            <p className="text-sm text-workbook-dark mb-2">Total Net Pay</p>
            <p className="text-2xl font-bold text-workbook-dark">₹{summary.totalNetPay?.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading payroll records...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No payroll records found. Go to "Process Payroll" to process this month.
          </div>
        ) : (
          <DataTable columns={columns} data={filtered} pagination={true} pageSize={10} />
        )}
      </div>
    </motion.div>
  );
};

export default Payroll;
