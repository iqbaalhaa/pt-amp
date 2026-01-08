import { Paper, Stack, Typography } from "@mui/material";

export default function SettingsPage() {
	return (
		<Stack spacing={2}>
			<Typography variant="h4">Settings</Typography>
			<Paper sx={{ p: 2 }}>
				<Typography variant="body2">
					Placeholder: konfigurasi sistem.
				</Typography>
			</Paper>
		</Stack>
	);
}
