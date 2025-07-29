# Componente Modal

Componente reutilizável para modais na aplicação, baseado no Material-UI Dialog com funcionalidades adicionais.

## Componentes Disponíveis

### 1. Modal (Base)

Componente principal que pode ser usado para qualquer tipo de modal.

### 2. ConfirmModal

Modal específico para confirmações com botões "Cancelar" e "Confirmar".

### 3. FormModal

Modal específico para formulários com botões "Cancelar" e "Salvar".

## Uso Básico

### Modal Base

```tsx
import { Modal } from '@/components/Modal';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Título do Modal"
      subtitle="Subtítulo opcional"
      actions={[
        {
          label: 'Cancelar',
          onClick: () => setOpen(false),
          variant: 'text',
        },
        {
          label: 'Salvar',
          onClick: () => {
            // Lógica de salvamento
            setOpen(false);
          },
          variant: 'contained',
          color: 'primary',
        },
      ]}
    >
      <Typography>Conteúdo do modal aqui...</Typography>
    </Modal>
  );
}
```

### ConfirmModal

```tsx
import { ConfirmModal } from '@/components/Modal';

function MyComponent() {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    // Lógica de confirmação
    console.log('Confirmado!');
    setOpen(false);
  };

  return (
    <ConfirmModal
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={handleConfirm}
      title="Confirmar Exclusão"
      message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
      confirmColor="error"
    />
  );
}
```

### FormModal

```tsx
import { FormModal } from '@/components/Modal';

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = () => {
    // Lógica de submissão
    console.log('Formulário enviado:', formData);
    setOpen(false);
  };

  return (
    <FormModal
      open={open}
      onClose={() => setOpen(false)}
      onSubmit={handleSubmit}
      title="Novo Usuário"
      subtitle="Preencha os dados do usuário"
      submitLabel="Criar Usuário"
      disabled={!formData.name || !formData.email}
    >
      <TextField
        fullWidth
        label="Nome"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
    </FormModal>
  );
}
```

## Propriedades

### Modal Props

| Propriedade            | Tipo                                   | Padrão  | Descrição                                              |
| ---------------------- | -------------------------------------- | ------- | ------------------------------------------------------ |
| `open`                 | `boolean`                              | -       | Controla se o modal está aberto                        |
| `onClose`              | `() => void`                           | -       | Função chamada quando o modal é fechado                |
| `title`                | `string`                               | -       | Título do modal                                        |
| `subtitle`             | `string`                               | -       | Subtítulo opcional                                     |
| `children`             | `ReactNode`                            | -       | Conteúdo do modal                                      |
| `actions`              | `ModalAction[]`                        | `[]`    | Array de ações (botões)                                |
| `maxWidth`             | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Largura máxima do modal                                |
| `fullWidth`            | `boolean`                              | `true`  | Se o modal deve ocupar toda a largura disponível       |
| `showCloseButton`      | `boolean`                              | `true`  | Se deve mostrar o botão de fechar no cabeçalho         |
| `disableBackdropClick` | `boolean`                              | `false` | Se deve desabilitar o fechamento ao clicar no backdrop |
| `disableEscapeKeyDown` | `boolean`                              | `false` | Se deve desabilitar o fechamento com a tecla Escape    |
| `contentSx`            | `object`                               | `{}`    | Estilos customizados para o conteúdo                   |
| `titleSx`              | `object`                               | `{}`    | Estilos customizados para o título                     |
| `actionsSx`            | `object`                               | `{}`    | Estilos customizados para as ações                     |
| `showDivider`          | `boolean`                              | `true`  | Se deve mostrar divisor entre título e conteúdo        |
| `loading`              | `boolean`                              | `false` | Se o modal está em estado de carregamento              |

### ModalAction Props

| Propriedade | Tipo                                                                      | Padrão      | Descrição                         |
| ----------- | ------------------------------------------------------------------------- | ----------- | --------------------------------- |
| `label`     | `string`                                                                  | -           | Texto do botão                    |
| `onClick`   | `() => void`                                                              | -           | Função chamada ao clicar no botão |
| `variant`   | `'text' \| 'outlined' \| 'contained'`                                     | `'text'`    | Variante do botão                 |
| `color`     | `'primary' \| 'secondary' \| 'error' \| 'info' \| 'success' \| 'warning'` | `'primary'` | Cor do botão                      |
| `disabled`  | `boolean`                                                                 | `false`     | Se o botão está desabilitado      |
| `startIcon` | `ReactNode`                                                               | -           | Ícone no início do botão          |
| `endIcon`   | `ReactNode`                                                               | -           | Ícone no final do botão           |

### ConfirmModal Props

| Propriedade    | Tipo                                                                      | Padrão             | Descrição                                 |
| -------------- | ------------------------------------------------------------------------- | ------------------ | ----------------------------------------- |
| `open`         | `boolean`                                                                 | -                  | Controla se o modal está aberto           |
| `onClose`      | `() => void`                                                              | -                  | Função chamada quando o modal é fechado   |
| `onConfirm`    | `() => void`                                                              | -                  | Função chamada quando confirmado          |
| `title`        | `string`                                                                  | `'Confirmar Ação'` | Título do modal                           |
| `message`      | `string`                                                                  | -                  | Mensagem de confirmação                   |
| `confirmLabel` | `string`                                                                  | `'Confirmar'`      | Texto do botão de confirmação             |
| `cancelLabel`  | `string`                                                                  | `'Cancelar'`       | Texto do botão de cancelamento            |
| `confirmColor` | `'primary' \| 'secondary' \| 'error' \| 'info' \| 'success' \| 'warning'` | `'primary'`        | Cor do botão de confirmação               |
| `loading`      | `boolean`                                                                 | `false`            | Se o modal está em estado de carregamento |

### FormModal Props

| Propriedade   | Tipo         | Padrão         | Descrição                                    |
| ------------- | ------------ | -------------- | -------------------------------------------- |
| `open`        | `boolean`    | -              | Controla se o modal está aberto              |
| `onClose`     | `() => void` | -              | Função chamada quando o modal é fechado      |
| `onSubmit`    | `() => void` | -              | Função chamada quando o formulário é enviado |
| `title`       | `string`     | `'Formulário'` | Título do modal                              |
| `subtitle`    | `string`     | -              | Subtítulo opcional                           |
| `children`    | `ReactNode`  | -              | Conteúdo do formulário                       |
| `submitLabel` | `string`     | `'Salvar'`     | Texto do botão de envio                      |
| `cancelLabel` | `string`     | `'Cancelar'`   | Texto do botão de cancelamento               |
| `loading`     | `boolean`    | `false`        | Se o modal está em estado de carregamento    |
| `disabled`    | `boolean`    | `false`        | Se o botão de envio está desabilitado        |

## Exemplos Avançados

### Modal com Loading

```tsx
<Modal
  open={open}
  onClose={handleClose}
  title="Processando..."
  loading={isLoading}
  actions={[
    {
      label: 'Cancelar',
      onClick: handleClose,
      variant: 'text',
      disabled: isLoading,
    },
  ]}
>
  <Typography>{isLoading ? 'Processando dados...' : 'Dados processados com sucesso!'}</Typography>
</Modal>
```

### Modal com Ações Customizadas

```tsx
<Modal
  open={open}
  onClose={handleClose}
  title="Ações Disponíveis"
  actions={[
    {
      label: 'Visualizar',
      onClick: handleView,
      variant: 'outlined',
      startIcon: <VisibilityIcon />,
    },
    {
      label: 'Editar',
      onClick: handleEdit,
      variant: 'outlined',
      startIcon: <EditIcon />,
      color: 'primary',
    },
    {
      label: 'Excluir',
      onClick: handleDelete,
      variant: 'contained',
      startIcon: <DeleteIcon />,
      color: 'error',
    },
  ]}
>
  <Typography>Selecione uma ação para continuar.</Typography>
</Modal>
```

### Modal sem Botão de Fechar

```tsx
<Modal
  open={open}
  onClose={handleClose}
  title="Modal Importante"
  showCloseButton={false}
  disableBackdropClick={true}
  disableEscapeKeyDown={true}
  actions={[
    {
      label: 'Entendi',
      onClick: handleClose,
      variant: 'contained',
    },
  ]}
>
  <Typography>Este modal não pode ser fechado clicando fora ou pressionando Escape.</Typography>
</Modal>
```

## Boas Práticas

1. **Sempre forneça uma função `onClose`** para garantir que o modal possa ser fechado
2. **Use `loading`** quando houver operações assíncronas
3. **Desabilite ações** durante operações de carregamento
4. **Use cores apropriadas** para diferentes tipos de ação (ex: `error` para exclusão)
5. **Forneça feedback visual** através de ícones nos botões quando apropriado
6. **Use `disableBackdropClick`** para modais críticos que não devem ser fechados acidentalmente
7. **Considere a acessibilidade** fornecendo labels descritivos para as ações
