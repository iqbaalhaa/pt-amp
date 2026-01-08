import { Paper, Stack, Typography } from "@mui/material";

export default function UsersPage() {
	return (
		<Stack spacing={2}>
			<Typography variant="h4">Users</Typography>
			<Paper sx={{ p: 2 }}>
				<Typography variant="body2">
					Placeholder: list staff + create staff.
				</Typography>
			</Paper>
		</Stack>
	);
}
