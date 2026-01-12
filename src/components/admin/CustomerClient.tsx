"use client";

import { Box, Paper, Typography } from "@mui/material";

interface CustomerClientProps {
  initialCustomers: unknown[];
}

export default function CustomerClient({ initialCustomers }: CustomerClientProps) {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
        Customers
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Modul Customer sudah dihapus dari schema. Total data: {initialCustomers.length}
        </Typography>
      </Paper>
    </Box>
  );
}

