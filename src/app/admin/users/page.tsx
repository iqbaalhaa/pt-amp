import { Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import UserCard from "@/components/admin/users/UserCard";
import AddUserButton from "@/components/admin/users/AddUserButton";
import { getUsers } from "@/actions/user-actions";

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
        <Grid container spacing={3}>
          {users?.map((user) => (
            <Grid key={user.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <UserCard user={user} />
            </Grid>
          ))}
          
          {users?.length === 0 && (
            <Grid size={{ xs: 12 }}>
                <div className="text-center py-20 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                    <p className="text-zinc-500">Belum ada user terdaftar.</p>
                </div>
            </Grid>
          )}
        </Grid>
      )}
    </Stack>
  );
}
