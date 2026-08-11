import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday } from "../../../../services/holidayService";

const HolidayModal = ({ holiday, onClose, onSave }) => {
  const [name, setName] = useState(holiday?.name || "");
  const [date, setDate] = useState(holiday?.date || "");
  const [type, setType] = useState(holiday?.type || "NATIONAL");
  const [description, setDescription] = useState(holiday?.description || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !date) return;
    setSaving(true);
    try {
      await onSave({ name, date, type, description });
      onClose();
    } catch (err) {
      console.error("Failed to save holiday:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {holiday ? "Edit Holiday" : "Add Holiday"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Holiday Name *</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input
              type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
            <select
              value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20"
            >
              <option value="NATIONAL">National</option>
              <option value="FESTIVAL">Festival</option>
              <option value="COMPANY">Company</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg bg-workbook-dark text-white hover:bg-workbook-light disabled:opacity-50">
              {saving ? "Saving..." : holiday ? "Update" : "Add Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Holidays = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => { loadHolidays(); }, []);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const data = await fetchHolidays();
      setRecords(data);
    } catch (err) {
      console.error("Failed to load holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (payload) => {
    if (modal?.id) {
      await updateHoliday(modal.id, payload);
    } else {
      await createHoliday(payload);
    }
    await loadHolidays();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await deleteHoliday(id);
      await loadHolidays();
    } catch (err) {
      console.error("Failed to delete holiday:", err);
    }
  };

  const columns = [
    {
      key: "name", label: "Holiday", width: "220px",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    { key: "date", label: "Date", width: "140px" },
    {
      key: "type", label: "Type", width: "140px",
      render: (value) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-700 border border-slate-100">
          {value}
        </span>
      )
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

  const upcoming = records
    .filter(r => r.date >= new Date().toISOString().split("T")[0])
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title="Holidays"
        description="Manage the company holiday schedule"
        showActions={true}
        onAdd={() => setModal({})}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Total Holidays</p>
          <p className="text-4xl font-bold text-slate-800">{records.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Upcoming Holiday</p>
          <p className="text-2xl font-bold text-workbook-dark">{upcoming?.name || "—"}</p>
          <p className="text-sm text-slate-500 mt-1">{upcoming?.date || ""}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Holiday Types</p>
          <p className="text-lg font-semibold text-slate-800">
            {[...new Set(records.map(r => r.type))].join(" & ")}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading holidays...</div>
        ) : (
          <DataTable columns={columns} data={records} pagination={true} pageSize={6} />
        )}
      </div>

      {modal && (
        <HolidayModal
          holiday={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </motion.div>
  );
};

export default Holidays;
