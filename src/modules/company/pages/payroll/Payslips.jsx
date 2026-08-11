import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { fetchPayrollRecords } from "../../../../services/payrollService";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Payslips = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRecords(); }, [year, month]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await fetchPayrollRecords(year, month);
      setRecords(data);
    } catch (err) {
      console.error("Failed to load payslips:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (row) => {
    const content = [
      `SALARY SLIP - ${row.monthName} ${row.year}`,
      `Employee: ${row.employeeName} (${row.employeeId})`,
      `Designation: ${row.designation || "-"}`,
      `Department: ${row.department || "-"}`,
      "",
      `Basic Salary: ₹${row.basicSalary?.toLocaleString()}`,
      `HRA: ₹${row.hra?.toLocaleString()}`,
      `Conveyance: ₹${row.conveyance?.toLocaleString()}`,
      `Medical: ₹${row.medical?.toLocaleString()}`,
      `Special Allowance: ₹${row.specialAllowance?.toLocaleString()}`,
      `Gross Earnings: ₹${row.grossEarnings?.toLocaleString()}`,
      "",
      `PF: -₹${row.pf?.toLocaleString()}`,
      `ESI: -₹${row.esi?.toLocaleString()}`,
      `Professional Tax: -₹${row.professionalTax?.toLocaleString()}`,
      `TDS: -₹${row.tds?.toLocaleString()}`,
      `Total Deductions: -₹${row.totalDeductions?.toLocaleString()}`,
      "",
      `Net Pay: ₹${row.netPay?.toLocaleString()}`,
      `In Words: ${row.netPayInWords}`,
      "",
      `Bank: ${row.bankName || "-"} | A/c: ${row.bankAccountNumber ? row.bankAccountNumber.slice(-4).padStart(row.bankAccountNumber.length, "*") : "-"}`,
      `IFSC: ${row.ifscCode || "-"}`,
      `Status: ${row.status}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payslip_${row.employeeName?.replace(/\s+/g, "_")}_${row.monthName}_${row.year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "employeeName", label: "Employee", width: "180px",
      render: (value) => <span className="font-medium text-slate-800">{value || "N/A"}</span>
    },
    { key: "monthName", label: "Month", width: "110px" },
    {
      key: "grossEarnings", label: "Gross", width: "110px",
      render: (value) => <span>₹{value?.toLocaleString()}</span>
    },
    {
      key: "totalDeductions", label: "Deductions", width: "120px",
      render: (value) => <span className="text-red-600">-₹{value?.toLocaleString()}</span>
    },
    {
      key: "netPay", label: "Net Salary", width: "130px",
      render: (value) => <span className="font-bold text-workbook-dark">₹{value?.toLocaleString()}</span>
    },
    {
      key: "status", label: "Status", width: "100px",
      render: (value) => (
        <StatusBadge status={value} variant={value === "PAID" ? "approved" : "pending"} />
      )
    },
    {
      key: "download", label: "", width: "100px",
      render: (_, row) => (
        <button onClick={() => handleDownload(row)}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-workbook-dark/10 text-workbook-dark hover:bg-workbook-dark/20">
          <Download size={14} /> Download
        </button>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Payslips" description="Access employee payslip downloads and records" />

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading payslips...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No payslips found for {MONTHS[month - 1]} {year}. Process payroll first.
          </div>
        ) : (
          <DataTable columns={columns} data={records} pagination={true} pageSize={8} />
        )}
      </div>
    </motion.div>
  );
};

export default Payslips;
