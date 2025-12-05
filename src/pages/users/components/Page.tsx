import React from "react";
import { Stack, Typography, Breadcrumbs, Link as MLink } from "@mui/material";
import { NavLink } from "react-router-dom";

export default function Page({
  title,
  children,
  breadcrumbs,
}: {
  title: string;
  children: React.ReactNode;
  breadcrumbs?: { label: string; to: string }[];
}) {
  return (
    <Stack spacing={2}>
      <Stack>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
            {breadcrumbs.map((b, i) => (
              <MLink key={`${b.to}-${i}`} component={NavLink} color="inherit" to={b.to}>
                {b.label}
              </MLink>
            ))}
            <Typography color="text.primary">{title}</Typography>
          </Breadcrumbs>
        )}
        <Typography variant="h4">{title}</Typography>
      </Stack>
      {children}
    </Stack>
  );
}
