import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import type { ReactNode } from "react";

type Props<T> = {
  title: string;
  badge?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  createLabel?: string;
  onCreate?: () => void;
  createDisabled?: boolean;
  items: T[];
  emptyText: string;
  getId: (item: T) => number | string;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getMeta?: (item: T) => string;
  getInitials?: (item: T) => string;
  getStatus?: (item: T) => string | undefined;
  activeId?: number | string | null;
  onSelect?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  leadingIcon?: ReactNode;
  footer?: ReactNode;
};

export default function ClicMenuEntityListCard<T>({
  title,
  badge,
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  createLabel = "Nuevo",
  onCreate,
  createDisabled = false,
  items,
  emptyText,
  getId,
  getTitle,
  getSubtitle,
  getMeta,
  getInitials,
  getStatus,
  activeId,
  onSelect,
  onEdit,
  onDelete,
  leadingIcon,
  footer,
}: Props<T>) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack spacing={1.5} height="100%">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h6"
            fontWeight={900}
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>

          {typeof badge === "number" && (
            <Chip
              size="small"
              label={badge}
              color="primary"
              sx={{ fontWeight: 900, flexShrink: 0 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            fullWidth
            sx={{
              minWidth: 0,
              "& .MuiInputBase-root": {
                borderRadius: 2,
                bgcolor: "background.default",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {onCreate && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onCreate}
              disabled={createDisabled}
              sx={{
                height: 40,
                borderRadius: 2,
                fontWeight: 800,
                px: 1.5,
                minWidth: 92,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {createLabel}
            </Button>
          )}
        </Stack>

        <Stack
          spacing={1}
          sx={{
            flex: 1,
            minHeight: 0,
            maxHeight: 430,
            overflowY: "auto",
            pr: 0.5,
          }}
        >
          {items.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              {emptyText}
            </Typography>
          )}

          {items.map((item) => {
            const id = getId(item);
            const titleValue = getTitle(item);
            const subtitle = getSubtitle?.(item);
            const meta = getMeta?.(item);
            const status = getStatus?.(item);
            const active = activeId === id;

            return (
              <Paper
                key={id}
                elevation={0}
                onClick={() => onSelect?.(item)}
                sx={{
                  p: 1.4,
                  borderRadius: 3,
                  cursor: onSelect ? "pointer" : "default",
                  border: "1px solid",
                  borderColor: active ? "primary.main" : "divider",
                  bgcolor: active ? "action.hover" : "background.default",
                  transition: "0.15s ease",
                  "&:hover": {
                    borderColor: onSelect ? "primary.main" : "divider",
                    bgcolor: onSelect ? "action.hover" : "background.default",
                  },
                }}
              >
                <Stack direction="row" spacing={1.4} alignItems="center">
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      fontWeight: 900,
                    }}
                  >
                    {leadingIcon || getInitials?.(item) || "CM"}
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      fontWeight={900}
                      title={titleValue}
                      sx={{
                        lineHeight: 1.15,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {titleValue}
                    </Typography>

                    {subtitle && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        title={subtitle}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {subtitle}
                      </Typography>
                    )}

                    {meta && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        title={meta}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {meta}
                      </Typography>
                    )}
                  </Box>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ flexShrink: 0 }}
                  >
                    {status && <StatusChip value={status} />}

                    {onEdit && (
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(item);
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onDelete && (
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(item);
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onSelect && (
                      <ArrowForwardIosIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>

        {footer && <Box>{footer}</Box>}
      </Stack>
    </Paper>
  );
}

function StatusChip({ value }: { value?: string }) {
  const normalized = value || "sin estado";

  if (normalized === "active") {
    return <Chip size="small" label="Activo" color="success" />;
  }

  if (normalized === "inactive") {
    return <Chip size="small" label="Inactivo" color="default" />;
  }

  if (normalized === "trialing") {
    return <Chip size="small" label="Demo" color="warning" />;
  }

  if (normalized === "expired") {
    return <Chip size="small" label="Vencido" color="error" />;
  }

  if (normalized === "cancelled") {
    return <Chip size="small" label="Cancelado" color="default" />;
  }

  if (normalized === "paid") {
    return <Chip size="small" label="Pagada" color="success" />;
  }

  return <Chip size="small" label={normalized} color="default" />;
}