"use client";

import { useState } from "react";
import GlassButton from "@/components/ui/GlassButton";
import AddIcon from "@mui/icons-material/Add";
import UserModal from "./UserModal";

export default function AddUserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <GlassButton 
        variant="primary" 
        onClick={() => setIsModalOpen(true)}
        className="gap-2"
      >
        <AddIcon fontSize="small" />
        Tambah User
      </GlassButton>
      
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
