"use client";

import { User } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";
import UserModal from "./UserModal";
import { deleteUser } from "@/actions/user-actions";

type Props = {
  users: User[];
};

export default function UsersTableClient({ users }: Props) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [editOpen, setEditOpen] = useState(false);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    await deleteUser(user.id);
    router.refresh();
  };

  const handleResetPassword = async (user: User) => {
    const newPassword = prompt(
      `Masukkan password baru untuk ${user.name} (minimal 8 karakter):`
    );
    if (!newPassword) return;
    if (newPassword.length < 8) {
      alert("Password minimal 8 karakter");
      return;
    }

    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Gagal mereset password");
        return;
      }

      alert("Password berhasil direset");
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat mereset password");
    }
  };

  return (
    <>
      <div className="rounded-xl border border-[var(--glass-border)] bg-white overflow-hidden">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nama</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    color={user.role === "SUPERADMIN" ? "primary" : "default"}
                    variant={user.role === "SUPERADMIN" ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEdit(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset password">
                    <IconButton
                      size="small"
                      onClick={() => handleResetPassword(user)}
                    >
                      <LockResetIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Hapus">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="text-center py-10 text-zinc-500">
                    Belum ada user terdaftar.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserModal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedUser(undefined);
        }}
        user={selectedUser}
      />
    </>
  );
}


