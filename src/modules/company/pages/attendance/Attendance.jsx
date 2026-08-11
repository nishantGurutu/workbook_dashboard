import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { fetchCompanyAttendance } from "../../../../services/attendanceService";
import { withBase } from "../../../../config/apiConfig";

const Attendance = () => {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [attendanceData, empRes] = await Promise.all([
                fetchCompanyAttendance(),
                fetch(withBase("/api/company-admin/users"), {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("hr_dashboard_token")}`,
                    },
                }),
            ]);
            const empJson = await empRes.json();
            const empList = empJson.data || [];
            setRecords(attendanceData);
            setEmployees(empList);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    };

    const normStatus = (s) => (s || '').toUpperCase();

    const statusFilterMap = {
        "All": "All",
        "Present": "PRESENT",
        "Absent": "ABSENT",
        "Late": "LATE",
        "Half Day": "HALF_DAY",
    };

    const filteredData = records.filter(record => {
        const matchesEmployee = selectedEmployeeId
            ? Number(record.userId) === Number(selectedEmployeeId)
            : true;
        const targetStatus = statusFilterMap[statusFilter] || "All";
        const matchesStatus = targetStatus === "All" || normStatus(record.status) === targetStatus;
        return matchesEmployee && matchesStatus;
    });

    const selectedEmployee = employees.find(e => Number(e.id) === Number(selectedEmployeeId));

    const columns = [
        {
            key: "userName",
            label: "Employee",
            width: "150px",
            render: (value) => <span className="font-medium text-slate-800">{value || "N/A"}</span>
        },
        {
            key: "date",
            label: "Date",
            width: "120px"
        },
        {
            key: "checkInTime",
            label: "Check In",
            width: "100px",
            render: (value) => <span className={value ? "text-slate-800" : "text-slate-400"}>{value || "N/A"}</span>
        },
        {
            key: "checkOutTime",
            label: "Check Out",
            width: "100px",
            render: (value) => <span className={value ? "text-slate-800" : "text-slate-400"}>{value || "N/A"}</span>
        },
        {
            key: "hoursWorked",
            label: "Hours",
            width: "80px",
            render: (value) => <span className="font-medium text-slate-800">{value != null ? Number(value).toFixed(1) : "—"}</span>
        },
        {
            key: "locationAddress",
            label: "Location",
            width: "150px",
            render: (value) => <span className="text-slate-500 text-xs">{value || "—"}</span>
        },
        {
            key: "status",
            label: "Status",
            width: "100px",
            render: (value) => {
                const s = normStatus(value);
                return (
                    <StatusBadge
                        status={s}
                        variant={
                            s === "PRESENT" ? "active" :
                            s === "ABSENT" ? "rejected" :
                            s === "LATE" ? "pending" :
                            s === "HALF_DAY" ? "warning" : "default"
                        }
                    />
                );
            }
        }
    ];

    const empRecords = selectedEmployeeId
        ? records.filter(r => Number(r.userId) === Number(selectedEmployeeId))
        : records;
    const presentCount = empRecords.filter(r => normStatus(r.status) === "PRESENT").length;
    const lateCount = empRecords.filter(r => normStatus(r.status) === "LATE").length;
    const halfDayCount = empRecords.filter(r => normStatus(r.status) === "HALF_DAY").length;
    const absentCount = empRecords.filter(r => normStatus(r.status) === "ABSENT").length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <PageHeader
                title="Attendance"
                description={selectedEmployee
                    ? `Attendance history for ${selectedEmployee.firstName} ${selectedEmployee.lastName || ""}`
                    : "Select an employee to view their attendance history"
                }
            />

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee</label>
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20"
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName || ""} ({emp.email || ""})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20"
                        >
                            <option value="All">All Status</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="Half Day">Half Day</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-sm text-green-700">Present</p>
                    <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-700">Half Day</p>
                    <p className="text-2xl font-bold text-blue-600">{halfDayCount}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <p className="text-sm text-yellow-700">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-sm text-red-700">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8 text-slate-500">Loading attendance...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination={true}
                    pageSize={10}
                />
            )}
        </motion.div>
    );
};

export default Attendance;
