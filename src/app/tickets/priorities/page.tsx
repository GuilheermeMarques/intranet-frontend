'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import { FormModal, Modal } from '@/components/Modal';
import prioritiesData from '@/mocks/priorities.json';
import { Priority } from '@/types/ticket';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export default function PrioritiesPage() {
  const [priorities, setPriorities] = useState<Priority[]>(prioritiesData.priorities);
  const [openModal, setOpenModal] = useState(false);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  const [deleteModal, setDeleteModal] = useState<Priority | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#4caf50',
    level: 1,
    description: '',
    isActive: true,
  });

  const handleOpenModal = (priority?: Priority) => {
    if (priority) {
      setEditingPriority(priority);
      setFormData({
        name: priority.name,
        color: priority.color,
        level: priority.level,
        description: priority.description || '',
        isActive: priority.isActive,
      });
    } else {
      setEditingPriority(null);
      setFormData({
        name: '',
        color: '#4caf50',
        level: 1,
        description: '',
        isActive: true,
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingPriority(null);
  };

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (editingPriority) {
      // Editar prioridade existente
      setPriorities((prev) =>
        prev.map((p) => (p.id === editingPriority.id ? { ...p, ...formData } : p)),
      );
    } else {
      // Criar nova prioridade
      const newPriority: Priority = {
        id: `priority-${Date.now()}`,
        ...formData,
      };
      setPriorities((prev) => [...prev, newPriority]);
    }
    handleCloseModal();
  };

  const handleDelete = (priority: Priority) => {
    setPriorities((prev) => prev.filter((p) => p.id !== priority.id));
    setDeleteModal(null);
  };

  const handleToggleActive = (priority: Priority) => {
    setPriorities((prev) =>
      prev.map((p) => (p.id === priority.id ? { ...p, isActive: !p.isActive } : p)),
    );
  };

  const columns = [
    {
      id: 'name',
      field: 'name',
      label: 'Nome',
      width: 200,
      render: (value: unknown, priority: Priority) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: priority.color,
            }}
          />
          <Typography>{priority.name}</Typography>
        </Box>
      ),
    },
    {
      id: 'level',
      field: 'level',
      label: 'Nível',
      width: 100,
      render: (value: unknown, priority: Priority) => (
        <Chip
          label={priority.level}
          size="small"
          color={priority.level >= 4 ? 'error' : priority.level >= 3 ? 'warning' : 'success'}
        />
      ),
    },
    {
      id: 'description',
      field: 'description',
      label: 'Descrição',
      width: 300,
      render: (value: unknown, priority: Priority) => (
        <Typography variant="body2" color="text.secondary">
          {priority.description || '-'}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      field: 'isActive',
      label: 'Status',
      width: 120,
      render: (value: unknown, priority: Priority) => (
        <Chip
          label={priority.isActive ? 'Ativo' : 'Inativo'}
          color={priority.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      field: 'actions',
      label: 'Ações',
      width: 200,
      render: (value: unknown, priority: Priority) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            key={`toggle-${priority.id}`}
            size="small"
            onClick={() => handleToggleActive(priority)}
            color={priority.isActive ? 'warning' : 'success'}
          >
            {priority.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
          <IconButton
            key={`edit-${priority.id}`}
            size="small"
            onClick={() => handleOpenModal(priority)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            key={`delete-${priority.id}`}
            size="small"
            onClick={() => setDeleteModal(priority)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Gerenciar Prioridades
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Nova Prioridade
          </Button>
        </Box>

        <DataTable data={priorities} columns={columns} getRowKey={(row) => row.id} />

        {/* Modal para adicionar/editar prioridade */}
        <FormModal
          open={openModal}
          onClose={handleCloseModal}
          title={editingPriority ? 'Editar Prioridade' : 'Nova Prioridade'}
          onSave={handleSave}
          maxWidth="sm"
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cor"
                type="color"
                value={formData.color}
                onChange={(e) => handleFormChange('color', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Nível</InputLabel>
                <Select
                  value={formData.level}
                  label="Nível"
                  onChange={(e) => handleFormChange('level', e.target.value)}
                >
                  <MenuItem key="level-1" value={1}>
                    1 - Muito Baixa
                  </MenuItem>
                  <MenuItem key="level-2" value={2}>
                    2 - Baixa
                  </MenuItem>
                  <MenuItem key="level-3" value={3}>
                    3 - Média
                  </MenuItem>
                  <MenuItem key="level-4" value={4}>
                    4 - Alta
                  </MenuItem>
                  <MenuItem key="level-5" value={5}>
                    5 - Crítica
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </FormModal>

        {/* Modal de confirmação de exclusão */}
        <Modal
          open={!!deleteModal}
          onClose={() => setDeleteModal(null)}
          title="Confirmar Exclusão"
          onConfirm={() => deleteModal && handleDelete(deleteModal)}
          confirmText="Excluir"
          confirmColor="error"
        >
          <Typography>
            Tem certeza que deseja excluir a prioridade "{deleteModal?.name}"? Esta ação não pode
            ser desfeita.
          </Typography>
        </Modal>
      </Box>
    </DashboardLayout>
  );
}
