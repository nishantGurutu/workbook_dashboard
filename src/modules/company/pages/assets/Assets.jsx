import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, X, Undo2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import {
  fetchAssets, createAsset, updateAsset, deleteAsset,
  assignAsset, unassignAsset, fetchEmployees
} from "../../../../services/assetService";

const AssetModal = ({ asset, onClose, onSave }) => {
  const [name, setName] = useState(asset?.name || "");
  const [assetTag, setAssetTag] = useState(asset?.assetTag || "");
  const [serialNumber, setSerialNumber] = useState(asset?.serialNumber || "");
  const [model, setModel] = useState(asset?.model || "");
  const [brand, setBrand] = useState(asset?.brand || "");
  const [type, setType] = useState(asset?.type || "");
  const [purchaseDate, setPurchaseDate] = useState(asset?.purchaseDate || "");
  const [warrantyExpiry, setWarrantyExpiry] = useState(asset?.warrantyExpiry || "");
  const [notes, setNotes] = useState(asset?.notes || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      await onSave({ name, assetTag, serialNumber, model, brand, type, purchaseDate, warrantyExpiry, notes });
      onClose();
    } catch (err) {
      console.error("Failed to save asset:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">{asset?.id ? "Edit Asset" : "Add Asset"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Asset Tag</label>
              <input type="text" value={assetTag} onChange={(e) => setAssetTag(e.target.value)}
                placeholder="AST-001"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                placeholder="Dell"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
                placeholder="Latitude 7400"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <input type="text" value={type} onChange={(e) => setType(e.target.value)}
                placeholder="Laptop"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Serial No</label>
              <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Expiry</label>
            <input type="date" value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg bg-workbook-dark text-white hover:bg-workbook-light disabled:opacity-50">
              {saving ? "Saving..." : asset?.id ? "Update" : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignModal = ({ asset, employees, onClose, onAssign }) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      await onAssign(asset.id, Number(selectedUserId));
      onClose();
    } catch (err) {
      console.error("Failed to assign:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Assign Asset</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Assign <strong>{asset.name}</strong> ({asset.assetTag || asset.serialNumber || "—"})
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Employee *</label>
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20">
            <option value="">— Select Employee —</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.employeeId || emp.email})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={handleAssign} disabled={!selectedUserId || saving}
            className="px-4 py-2 rounded-lg bg-workbook-dark text-white hover:bg-workbook-light disabled:opacity-50">
            {saving ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Assets = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetModal, setAssetModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assets, emps] = await Promise.all([fetchAssets(), fetchEmployees()]);
      setRecords(assets);
      setEmployees(emps);
    } catch (err) {
      console.error("Failed to load assets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (payload) => {
    if (assetModal?.id) {
      await updateAsset(assetModal.id, payload);
    } else {
      await createAsset(payload);
    }
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await deleteAsset(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete asset:", err);
    }
  };

  const handleAssign = async (assetId, userId) => {
    await assignAsset(assetId, userId);
    await loadData();
  };

  const handleUnassign = async (assetId) => {
    if (!window.confirm("Unassign this asset?")) return;
    try {
      await unassignAsset(assetId);
      await loadData();
    } catch (err) {
      console.error("Failed to unassign:", err);
    }
  };

  const filtered = statusFilter === "ALL"
    ? records
    : records.filter((r) => r.status === statusFilter);

  const availableCount = records.filter((r) => r.status === "AVAILABLE").length;
  const assignedCount = records.filter((r) => r.status === "ASSIGNED").length;
  const damagedCount = records.filter((r) => r.status === "DAMAGED").length;

  const columns = [
    {
      key: "name", label: "Asset", width: "150px",
      render: (value, row) => (
        <div>
          <span className="font-medium text-slate-800">{value}</span>
          {row.assetTag && <span className="text-xs text-slate-400 ml-2">({row.assetTag})</span>}
        </div>
      )
    },
    { key: "brand", label: "Brand", width: "100px" },
    { key: "model", label: "Model", width: "110px" },
    { key: "serialNumber", label: "Serial No", width: "120px" },
    { key: "type", label: "Type", width: "90px" },
    {
      key: "assignedToName", label: "Assigned To", width: "150px",
      render: (value) => value ? <span className="text-slate-700">{value}</span> : <span className="text-slate-400">—</span>
    },
    {
      key: "status", label: "Status", width: "110px",
      render: (value) => {
        const variant = value === "AVAILABLE" ? "approved" : value === "ASSIGNED" ? "active" : value === "DAMAGED" ? "rejected" : "pending";
        return <StatusBadge status={value} variant={variant} />;
      }
    },
    {
      key: "actions", label: "", width: "140px",
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end">
          {row.status === "AVAILABLE" ? (
            <button onClick={(e) => { e.stopPropagation(); setAssignModal(row); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100">Assign</button>
          ) : row.status === "ASSIGNED" ? (
            <button onClick={(e) => { e.stopPropagation(); handleUnassign(row.id); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center gap-1">
              <Undo2 size={12} /> Unassign
            </button>
          ) : null}
          <button onClick={(e) => { e.stopPropagation(); setAssetModal(row); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={15} /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
        </div>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Asset Management" description="Track and assign company assets"
        onAdd={() => setAssetModal({})} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500">Total Assets</p>
          <p className="text-2xl font-bold text-slate-800">{records.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <p className="text-sm text-green-700">Available</p>
          <p className="text-2xl font-bold text-green-600">{availableCount}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">Assigned</p>
          <p className="text-2xl font-bold text-blue-600">{assignedCount}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-sm text-red-700">Damaged</p>
          <p className="text-2xl font-bold text-red-600">{damagedCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-workbook-dark/20">
            <option value="ALL">All Assets</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="DAMAGED">Damaged</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading assets...</div>
        ) : (
          <DataTable columns={columns} data={filtered} pagination={true} pageSize={8} />
        )}
      </div>

      {assetModal && (
        <AssetModal asset={assetModal.id ? assetModal : null}
          onClose={() => setAssetModal(null)} onSave={handleSave} />
      )}

      {assignModal && (
        <AssignModal asset={assignModal} employees={employees}
          onClose={() => setAssignModal(null)} onAssign={handleAssign} />
      )}
    </motion.div>
  );
};

export default Assets;
