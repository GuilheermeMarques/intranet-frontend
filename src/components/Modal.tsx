'use client';

import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import React from 'react';

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: ModalAction[];
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  showCloseButton?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  contentSx?: object;
  titleSx?: object;
  actionsSx?: object;
  showDivider?: boolean;
  loading?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions = [],
  maxWidth = 'md',
  fullWidth = true,
  showCloseButton = true,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  contentSx = {},
  titleSx = {},
  actionsSx = {},
  showDivider = true,
  loading = false,
}: ModalProps) {
  const handleClose = (event: object, reason: string) => {
    if (reason === 'backdropClick' && disableBackdropClick) {
      return;
    }
    if (reason === 'escapeKeyDown' && disableEscapeKeyDown) {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={{
        sx: {
          borderRadius: 2,
          ...contentSx,
        },
      }}
    >
      {(title || showCloseButton) && (
        <DialogTitle sx={{ pb: 1, ...titleSx }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              {title && (
                <Typography variant="h6" sx={{ mb: subtitle ? 0.5 : 0 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {showCloseButton && (
              <IconButton onClick={onClose} size="small" sx={{ ml: 1 }} disabled={loading}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}

      <DialogContent sx={{ pt: showDivider ? 2 : 1 }}>{children}</DialogContent>

      {actions.length > 0 && (
        <DialogActions sx={{ p: 3, pt: showDivider ? 1 : 2, ...actionsSx }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'text'}
              color={action.color || 'primary'}
              disabled={action.disabled || loading}
              startIcon={action.startIcon}
              endIcon={action.endIcon}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
}

// Componente de confirmação específico
export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar Ação',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmColor = 'primary',
  loading = false,
}: ConfirmModalProps) {
  const actions: ModalAction[] = [
    {
      label: cancelLabel,
      onClick: onClose,
      variant: 'text',
      disabled: loading,
    },
    {
      label: confirmLabel,
      onClick: onConfirm,
      variant: 'contained',
      color: confirmColor,
      disabled: loading,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={actions}
      maxWidth="sm"
      loading={loading}
    >
      <Typography variant="body1">{message}</Typography>
    </Modal>
  );
}

// Componente de formulário específico
export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function FormModal({
  open,
  onClose,
  onSubmit,
  title = 'Formulário',
  subtitle,
  children,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  loading = false,
  disabled = false,
}: FormModalProps) {
  const actions: ModalAction[] = [
    {
      label: cancelLabel,
      onClick: onClose,
      variant: 'text',
      disabled: loading,
    },
    {
      label: submitLabel,
      onClick: onSubmit,
      variant: 'contained',
      disabled: disabled || loading,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      actions={actions}
      loading={loading}
    >
      {children}
    </Modal>
  );
}
