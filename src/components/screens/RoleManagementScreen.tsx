import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Users,
  ShieldCheck,
  AlertCircle,
  Network,
} from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import { RoleDefinition } from '../../types';

interface RoleManagementScreenProps {
  onBack: () => void;
}

export const RoleManagementScreen: React.FC<RoleManagementScreenProps> = ({ onBack }) => {
  const { roles, addRole, updateRole, deleteRole, users } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);

  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleColor, setRoleColor] = useState('#059669');
  const [roleLevel, setRoleLevel] = useState(5);
  const [coordinatorRole, setCoordinatorRole] = useState('Staff');
  const [error, setError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDesc('');
    setRoleColor('#10b981');
    setRoleLevel(5);
    setCoordinatorRole('Staff');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: RoleDefinition) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description || '');
    setRoleColor(role.color || '#059669');
    setRoleLevel(role.level || 5);
    setCoordinatorRole(role.coordinatorRole || 'Staff');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError('Nama jabatan tidak boleh kosong.');
      return;
    }

    if (editingRole) {
      updateRole({
        ...editingRole,
        name: roleName.trim(),
        description: roleDesc.trim(),
        color: roleColor,
        level: Number(roleLevel),
        coordinatorRole: coordinatorRole,
      });
    } else {
      addRole({
        name: roleName.trim(),
        description: roleDesc.trim(),
        color: roleColor,
        level: Number(roleLevel),
        coordinatorRole: coordinatorRole,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (name === 'Developer' || name === 'Kepala SPPG' || name === 'Staff') {
      alert(`Jabatan inti "${name}" tidak boleh dihapus.`);
      return;
    }
    const memberCount = users.filter((u) => u.role === name).length;
    if (memberCount > 0) {
      alert(`Jabatan "${name}" tidak dapat dihapus karena masih digunakan oleh ${memberCount} karyawan.`);
      return;
    }
    if (confirm(`Yakin ingin menghapus jabatan "${name}"?`)) {
      deleteRole(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      <Header
        title="Struktur Jabatan & Koordinator SPPG"
        onBack={onBack}
        rightAction={
          <button
            onClick={handleOpenAdd}
            className="w-10 h-10 rounded-2xl bg-[#024b3a] text-white flex items-center justify-center hover:bg-[#023f31] transition-transform active:scale-95 shadow-md shadow-[#024b3a]/25 cursor-pointer"
            title="Tambah Jabatan"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="space-y-4">
        {/* Info Banner */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-3xl flex items-start gap-3">
          <Network className="w-5 h-5 text-[#024b3a] shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 leading-relaxed">
            <span className="font-bold">Hirarki Hak Akses & Koordinator:</span> Jabatan teratas memiliki akses tertinggi. Security dan Cleaning dikoordinasi oleh <strong>Staff</strong>, sedangkan setiap Divisi dikoordinasi oleh Koordinator masing-masing.
          </div>
        </div>

        {/* Roles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {roles.map((role, idx) => {
            const memberCount = users.filter((u) => u.role === role.name).length;

            return (
              <div
                key={role.id}
                className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: role.color }}
                      />
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        {role.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(role)}
                        className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                        title="Edit Jabatan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {role.name !== 'Developer' && role.name !== 'Kepala SPPG' && role.name !== 'Staff' && (
                        <button
                          onClick={() => handleDelete(role.id, role.name)}
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                          title="Hapus Jabatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[30px]">
                    {role.description || 'Tugas operasional SPPG.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>{memberCount} Karyawan</span>
                  </div>

                  <div className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl">
                    Koordinator: <span className="text-[#024b3a] font-extrabold">{role.coordinatorRole}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRole ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Jabatan / Role *
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Contoh: Divisi Persiapan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Atasan / Koordinator Pembina
                </label>
                <input
                  type="text"
                  value={coordinatorRole}
                  onChange={(e) => setCoordinatorRole(e.target.value)}
                  placeholder="Staff / Koordinator Persiapan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Tanggung Jawab
                </label>
                <textarea
                  rows={2}
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Uraian wewenang tugas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden resize-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#024b3a] text-white text-xs font-bold shadow-md hover:bg-[#023f31]"
                >
                  Simpan Jabatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
