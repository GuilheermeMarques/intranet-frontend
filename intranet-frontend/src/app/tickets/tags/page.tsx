'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable } from '@/components/DataTable';
import { ConfirmModal, FormModal } from '@/components/Modal';
import tagsData from '@/mocks/tags.json';
import { Tag } from '@/types/ticket';
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

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>(tagsData.tags);
  const [openModal, setOpenModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteModal, setDeleteModal] = useState<Tag | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#4caf50',
    description: '',
    category: '',
    isActive: true,
  });

  // Categorias disponíveis
  const categories = ['Tipo', 'Área', 'Plataforma', 'Status', 'Outros'];

  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        color: tag.color,
        description: tag.description || '',
        category: tag.category || '',
        isActive: tag.isActive,
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        color: '#4caf50',
        description: '',
        category: '',
        isActive: true,
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingTag(null);
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (editingTag) {
      // Editar tag existente
      setTags((prev) => prev.map((t) => (t.id === editingTag.id ? { ...t, ...formData } : t)));
    } else {
      // Criar nova tag
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        ...formData,
      };
      setTags((prev) => [...prev, newTag]);
    }
    handleCloseModal();
  };

  const handleDelete = (tag: Tag) => {
    setTags((prev) => prev.filter((t) => t.id !== tag.id));
    setDeleteModal(null);
  };

  const handleToggleActive = (tag: Tag) => {
    setTags((prev) => prev.map((t) => (t.id === tag.id ? { ...t, isActive: !t.isActive } : t)));
  };

  const columns = [
    {
      id: 'name',
      field: 'name',
      label: 'Nome',
      width: 200,
      render: (value: unknown, tag: Tag) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: tag.color,
            }}
          />
          <Typography>{tag.name}</Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      field: 'category',
      label: 'Categoria',
      width: 150,
      render: (value: unknown, tag: Tag) => (
        <Chip label={tag.category || 'Sem categoria'} size="small" variant="outlined" />
      ),
    },
    {
      id: 'description',
      field: 'description',
      label: 'Descrição',
      width: 300,
      render: (value: unknown, tag: Tag) => (
        <Typography variant="body2" color="text.secondary">
          {tag.description || '-'}
        </Typography>
      ),
    },
    {
      id: 'isActive',
      field: 'isActive',
      label: 'Status',
      width: 120,
      render: (value: unknown, tag: Tag) => (
        <Chip
          label={tag.isActive ? 'Ativo' : 'Inativo'}
          color={tag.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      field: 'actions',
      label: 'Ações',
      width: 200,
      render: (value: unknown, tag: Tag) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            key={`toggle-${tag.id}`}
            size="small"
            onClick={() => handleToggleActive(tag)}
            color={tag.isActive ? 'warning' : 'success'}
          >
            {tag.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
          <IconButton
            key={`edit-${tag.id}`}
            size="small"
            onClick={() => handleOpenModal(tag)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            key={`delete-${tag.id}`}
            size="small"
            onClick={() => setDeleteModal(tag)}
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
            Gerenciar Tags
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Nova Tag
          </Button>
        </Box>

        <DataTable data={tags} columns={columns} getRowKey={(row) => row.id} />

        {/* Modal para adicionar/editar tag */}
        <FormModal
          open={openModal}
          onClose={handleCloseModal}
          title={editingTag ? 'Editar Tag' : 'Nova Tag'}
          onSubmit={handleSave}
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
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.category}
                  label="Categoria"
                  onChange={(e) => handleFormChange('category', e.target.value)}
                >
                  <MenuItem key="no-category" value="">
                    Sem categoria
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
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
        <ConfirmModal
          open={!!deleteModal}
          onClose={() => setDeleteModal(null)}
          title="Confirmar Exclusão"
          onConfirm={() => deleteModal && handleDelete(deleteModal)}
          confirmLabel="Excluir"
          confirmColor="error"
          message={`Tem certeza que deseja excluir a tag "${deleteModal?.name}"? Esta ação não pode ser desfeita.`}
        />
      </Box>
    </DashboardLayout>
  );
}
