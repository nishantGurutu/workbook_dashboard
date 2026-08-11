import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import { fetchShifts, createShift, updateShift, deleteShift } from "../../../../services/shiftService";

const ShiftModal = ({ shift, onClose, onSave }) => {
  const [name, setName] = useState(shift?.name || "");
  const [startTime, setStartTime] = useState(shift?.startTime || "");
  const [endTime, setEndTime] = useState(shift?.endTime || "");
  const [days, setDays] = useState(shift?.days || "");
  const [description, setDescription] = useState(shift?.description || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !startTime || !endTime || !days) return;
    setSaving(true);
    try {
      await onSave({ name, startTime, endTime, days, description });
      onClose();
    } catch (err) {
      console.error("Failed to save shift:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {shift ? "Edit Shift" : "Add Shift"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Shift Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Days *</label>
            <input type="text" value={days} onChange={(e) => setDays(e.target.value)}
              placeholder="Mon-Fri"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg bg-workbook-dark text-white hover:bg-workbook-light disabled:opacity-50">
              {saving ? "Saving..." : shift ? "Update" : "Add Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Shifts = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => { loadShifts(); }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const data = await fetchShifts();
      setRecords(data);
    } catch (err) {
      console.error("Failed to load shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (payload) => {
    if (modal?.id) {
      await updateShift(modal.id, payload);
    } else {
      await createShift(payload);
    }
    await loadShifts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shift?")) return;
    try {
      await deleteShift(id);
      await loadShifts();
    } catch (err) {
      console.error("Failed to delete shift:", err);
    }
  };

  const columns = [
    {
      key: "name", label: "Shift Name", width: "180px",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    { key: "startTime", label: "Start", width: "110px" },
    { key: "endTime", label: "End", width: "110px" },
    { key: "days", label: "Days", width: "110px" },
    {
      key: "employeeCount", label: "Employees", width: "120px",
      render: (value) => <span className="font-semibold text-slate-800">{value ?? 0}</span>
    },
    {
      key: "actions", label: "", width: "80px",
      render: (_, row) => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={(e) => { e.stopPropagation(); setModal(row); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <Pencil size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const totalEmployees = records.reduce((sum, r) => sum + (r.employeeCount || 0), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Shift Management"
        description="Create and assign shift schedules"
        onAdd={() => setModal({})}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Total Shifts</p>
          <p className="text-4xl font-bold text-slate-800">{records.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
          <p className="text-sm text-green-700">Total Assigned</p>
          <p className="text-4xl font-bold text-green-600">{totalEmployees}</p>
        </div>
        <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 shadow-sm">
          <p className="text-sm text-teal-700">Active Shifts</p>
          <p className="text-4xl font-bold text-teal-700">{records.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading shifts...</div>
        ) : (
          <DataTable columns={columns} data={records} pagination={true} pageSize={6} />
        )}
      </div>

      {modal && (
        <ShiftModal
          shift={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </motion.div>
  );
};

export default Shifts;
