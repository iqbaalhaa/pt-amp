"use client";

import { User } from "@/generated/prisma";
import GlassCard from "@/components/ui/GlassCard";
import { Avatar, Box, Chip, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { deleteUser } from "@/actions/user-actions";
import { useRouter } from "next/navigation";
import UserModal from "./UserModal";

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditOpen(true);
    handleClose();
  };

  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      await deleteUser(user.id);
      router.refresh();
    }
    handleClose();
  };

  return (
    <>
      <GlassCard className="p-5 h-full flex flex-col justify-between relative group hover:border-[var(--brand)]/30 transition-all duration-300">
        <div className="absolute top-3 right-3">
          <IconButton
            size="small"
            onClick={handleClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 2,
              sx: { borderRadius: 2, minWidth: 120 },
            }}
          >
            <MenuItem onClick={handleEdit} sx={{ fontSize: "0.875rem" }}>
              <EditIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ fontSize: "0.875rem", color: "error.main" }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Hapus
            </MenuItem>
          </Menu>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 mb-4">
          <Avatar
            src={user.image || ""}
            alt={user.name}
            sx={{
              width: 72,
              height: 72,
              fontSize: 28,
              fontWeight: "bold",
              bgcolor: "var(--brand)",
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          
          <div>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {user.email}
            </Typography>
          </div>

          <Chip
            label={user.role}
            size="small"
            color={user.role === "SUPERADMIN" ? "primary" : "default"}
            variant={user.role === "SUPERADMIN" ? "filled" : "outlined"}
            sx={{ 
              fontWeight: 600, 
              height: 24,
              fontSize: "0.7rem",
              bgcolor: user.role === "SUPERADMIN" ? "var(--brand)" : "transparent",
              color: user.role === "SUPERADMIN" ? "white" : "text.secondary",
              borderColor: "var(--brand)",
            }}
          />
        </div>
      </GlassCard>

      <UserModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        user={user} 
      />
    </>
  );
}
