import { Chip } from "@mui/material";

type Props = {
  label: string;
  color?: "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info";
  outlined?: boolean;
  size?: "small" | "medium";
};

export default function TagBadge({ label, color = "default", outlined = true, size = "small" }: Props) {
  return <Chip label={label} color={color} size={size} variant={outlined ? "outlined" : "filled"} />;
}

