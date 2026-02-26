import { Stack, Typography, Box } from "@mui/material";
import AddUserButton from "@/components/admin/users/AddUserButton";
import { getUsers } from "@/actions/user-actions";
import UsersTableClient from "@/components/admin/users/UsersTableClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const { users, error } = await getUsers();

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Users
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Manajemen akun dan peran staff
          </Typography>
        </Box>
        <AddUserButton />
      </Box>

      {error ? (
        <Box className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </Box>
      ) : (
        <UsersTableClient users={users || []} />
      )}
    </Stack>
  );
}
