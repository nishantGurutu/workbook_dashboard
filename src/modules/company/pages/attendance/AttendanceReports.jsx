import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { fetchCompanyAttendance } from "../../../../services/attendanceService";

const AttendanceReports = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const data = await fetchCompanyAttendance();
            setRecords(data);
        } catch (err) {
            console.error("Failed to load attendance:", err);
        } finally {
            setLoading(false);
        }
    };

    const present = records.filter(r => r.status === "PRESENT").length;
    const absent = records.filter(r => r.status === "ABSENT").length;
    const late = records.filter(r => r.status === "LATE").length;

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Attendance Reports" description="View attendance summary and trends" />
                <div className="text-center py-8 text-slate-500">Loading attendance...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Attendance Reports" description="View attendance summary and trends" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Present</p>
                    <p className="text-4xl font-bold text-green-600">{present}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Absent</p>
                    <p className="text-4xl font-bold text-red-600">{absent}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Late</p>
                    <p className="text-4xl font-bold text-yellow-600">{late}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Attendance Breakdown</h2>
                        <p className="text-sm text-slate-500">All records at a glance.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {records.length === 0 ? (
                        <p className="text-center text-slate-500 py-4">No attendance records found</p>
                    ) : (
                        records.map(record => (
                            <div key={record.id} className="flex items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl">
                                <div>
                                    <p className="font-semibold text-slate-800">{record.userName || "Unknown"}</p>
                                    <p className="text-sm text-slate-500">{record.date}</p>
                                    {record.locationAddress && (
                                        <p className="text-xs text-slate-400">{record.locationAddress}</p>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600">{record.status}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceReports;
