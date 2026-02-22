"use client";

import { ChangeEvent } from "react";

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxSizeMB?: number;
  onFileSelect?: (file: File) => void;
}

export function FileInput({
  maxSizeMB = 50,
  onFileSelect,
  onChange,
  className,
  ...props
}: FileInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size exceeds ${maxSizeMB}MB`);
        e.target.value = "";
        return;
      }
      onFileSelect?.(file);
    }

    onChange?.(e);
  };

  return (
    <input
      type="file"
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
}
