"use client";

import { useState } from "react";
import { Stack, TextField, Alert, CircularProgress } from "@mui/material";
import GlassButton from "@/components/ui/GlassButton";
import { updateCurrentUserProfile } from "@/actions/account-actions";

interface AccountProfileFormProps {
  initialName: string;
  initialEmail: string;
}

export default function AccountProfileForm({
  initialName,
  initialEmail,
}: AccountProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  // Sinkron saat nilai dari server berubah (pola React: adjust state saat render).
  const [prevInitial, setPrevInitial] = useState({ initialName, initialEmail });
  if (
    initialName !== prevInitial.initialName ||
    initialEmail !== prevInitial.initialEmail
  ) {
    setPrevInitial({ initialName, initialEmail });
    setName(initialName);
    setEmail(initialEmail);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setMessage({
        type: "error",
        text: "Nama dan email wajib diisi.",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await updateCurrentUserProfile({
        name: trimmedName,
        email: trimmedEmail,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: "Profil akun berhasil diperbarui.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Gagal memperbarui profil akun.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={4}>
        {message && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

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

        <div className="flex justify-end pt-2">
          <GlassButton
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Simpan Perubahan"
            )}
          </GlassButton>
        </div>
      </Stack>
    </form>
  );
}

