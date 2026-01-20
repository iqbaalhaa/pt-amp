"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser } from "@/actions/user-actions";
import Modal from "@/components/ui/Modal";
import GlassButton from "@/components/ui/GlassButton";
import { TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Stack } from "@mui/material";
import { User } from "@/generated/prisma";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
}

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setPassword("");
      } else {
        // Reset form when closed
        setName("");
        setEmail("");
        setPassword("");
        setRole("STAFF");
      }
      setError(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user && password.length < 8) {
        setError("Password minimal 8 karakter");
        setLoading(false);
        return;
    }

    try {
      let result;
      
      if (user) {
         result = await updateUser(user.id, {
            name,
            email,
            role: role as "STAFF" | "SUPERADMIN"
         });
      } else {
         result = await createUser({
            name,
            email,
            password,
            role: role as "STAFF" | "SUPERADMIN"
         });
      }

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || (user ? "Gagal mengupdate user" : "Gagal membuat user"));
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={user ? "Edit User" : "Tambah User Baru"}>
      <form onSubmit={handleSubmit} className="p-2">
        <Stack spacing={4}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Nama Lengkap"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            variant="outlined"
            size="medium"
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="outlined"
            size="medium"
          />

          {!user && (
            <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                size="medium"
                helperText="Minimal 8 karakter"
            />
          )}

          <FormControl fullWidth size="medium">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="STAFF">Staff</MenuItem>
              <MenuItem value="SUPERADMIN">Super Admin</MenuItem>
            </Select>
          </FormControl>

          <div className="flex justify-end pt-2 space-x-2">
            <GlassButton type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Batal
            </GlassButton>
            <GlassButton type="submit" variant="primary" disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : (user ? "Update User" : "Simpan User")}
            </GlassButton>
          </div>
        </Stack>
      </form>
    </Modal>
  );
}
