"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import GlassButton from "@/components/ui/GlassButton";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password baru tidak cocok." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password minimal 8 karakter." });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setMessage({
          type: "error",
          text: error.message || "Gagal mengubah password.",
        });
      } else {
        setMessage({ type: "success", text: "Password berhasil diubah!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setConfirmOpen(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter((show) => !show);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={4}>
        {message && (
          <Alert severity={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <TextField
          label="Password Saat Ini"
          type={showCurrentPassword ? "text" : "password"}
          fullWidth
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          variant="outlined"
          size="medium"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    handleClickShowPassword(setShowCurrentPassword)
                  }
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Password Baru"
          type={showNewPassword ? "text" : "password"}
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          variant="outlined"
          size="medium"
          helperText="Minimal 8 karakter"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleClickShowPassword(setShowNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Konfirmasi Password Baru"
          type={showConfirmPassword ? "text" : "password"}
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          variant="outlined"
          size="medium"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    handleClickShowPassword(setShowConfirmPassword)
                  }
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
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
              "Ganti Password"
            )}
          </GlassButton>
        </div>
      </Stack>
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        loading={loading}
        title="Ganti Password"
        content="Apakah Anda yakin ingin mengganti password akun Anda?"
      />
    </form>
  );
}
