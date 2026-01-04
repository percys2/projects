# Migration Guide: Replacing Alerts with Toast Notifications

This guide will help you systematically replace all `alert()` and `confirm()` calls with the new toast and confirmation dialog system.

## Quick Reference

### Replace `alert()` with `toast`

```jsx
// Before
alert("Error al guardar");

// After
import { toast } from '@/src/lib/notifications/toast';
toast.error("Error al guardar");
```

### Replace `confirm()` with `useConfirm`

```jsx
// Before
if (confirm("¿Eliminar?")) {
  handleDelete();
}

// After
import { useConfirm } from '@/src/hooks/useConfirm';

function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirm();
  
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Eliminar",
      message: "¿Está seguro?",
      type: "danger"
    });
    if (confirmed) {
      // Delete logic
    }
  };
  
  return (
    <>
      <button onClick={handleDelete}>Eliminar</button>
      {ConfirmDialog}
    </>
  );
}
```

## Step-by-Step Migration

### Step 1: Find All Alerts

Search your codebase for:
- `alert(`
- `confirm(`

### Step 2: Categorize Alerts

**Error Messages** → `toast.error()`
```jsx
// Error cases
alert("Error al guardar");
alert("No se pudo completar la operación");
alert("El campo es requerido");
```

**Success Messages** → `toast.success()`
```jsx
// Success cases
alert("Operación exitosa");
alert("Guardado correctamente");
alert("Venta realizada");
```

**Info Messages** → `toast.info()`
```jsx
// Info cases
alert("Información importante");
alert("Nota");
```

**Warning Messages** → `toast.warning()`
```jsx
// Warning cases
alert("Advertencia");
alert("Atención");
```

### Step 3: Replace Patterns

#### Pattern 1: Simple Alert
```jsx
// Before
alert("Error al guardar");

// After
import { toast } from '@/src/lib/notifications/toast';
toast.error("Error al guardar");
```

#### Pattern 2: Alert in Try-Catch
```jsx
// Before
try {
  await saveData();
  alert("Guardado exitosamente");
} catch (error) {
  alert("Error: " + error.message);
}

// After
import { toast } from '@/src/lib/notifications/toast';
try {
  await saveData();
  toast.success("Guardado exitosamente");
} catch (error) {
  toast.error(error.message || "Error al guardar");
}
```

#### Pattern 3: Confirm Before Action
```jsx
// Before
const handleDelete = () => {
  if (confirm("¿Eliminar este registro?")) {
    deleteRecord();
  }
};

// After
import { useConfirm } from '@/src/hooks/useConfirm';

function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirm();
  
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Eliminar registro",
      message: "¿Está seguro de eliminar este registro?",
      type: "danger",
      confirmText: "Eliminar"
    });
    
    if (confirmed) {
      deleteRecord();
    }
  };
  
  return (
    <>
      <button onClick={handleDelete}>Eliminar</button>
      {ConfirmDialog}
    </>
  );
}
```

#### Pattern 4: Confirm with Different Actions
```jsx
// Before
const cancelSale = (saleId, restoreInventory) => {
  const message = restoreInventory 
    ? "¿Anular venta? El inventario será restaurado."
    : "¿Eliminar venta? Esta acción no se puede deshacer.";
  
  if (confirm(message)) {
    // Delete logic
  }
};

// After
const cancelSale = async (saleId, restoreInventory) => {
  const confirmed = await confirm({
    title: restoreInventory ? "Anular venta" : "Eliminar venta",
    message: restoreInventory 
      ? "¿Está seguro de ANULAR esta venta? El inventario será restaurado."
      : "¿Está seguro de ELIMINAR esta venta permanentemente? Esta acción no se puede deshacer.",
    type: "danger",
    confirmText: restoreInventory ? "Anular" : "Eliminar"
  });
  
  if (confirmed) {
    // Delete logic
  }
};
```

## Common Files to Update

Based on the codebase analysis, here are the files with the most alerts:

### High Priority (Frequently Used)
1. `src/modules/sales/hooks/useSales.js` ✅ (Already updated)
2. `src/modules/POS/PosScreen.jsx` ✅ (Partially updated)
3. `src/modules/inventory/inventoryScreen.jsx`
4. `src/modules/finance/hooks/useFinance.js`
5. `src/modules/hr/components/*.jsx` (Multiple files)

### Medium Priority
6. `src/modules/settings/tabs/*.jsx` (Multiple files)
7. `src/modules/inventory/components/*.jsx` (Multiple files)
8. `src/modules/kardex/kardexScreen.jsx`

## Automated Replacement Script

You can use find-and-replace in your IDE:

### Find: `alert\(([^)]+)\);`
### Replace: `toast.error($1);`

**But be careful!** You'll need to:
1. Add the import at the top
2. Change `toast.error()` to `toast.success()` for success messages
3. Handle confirm dialogs manually (they need the hook)

## Testing Checklist

After migration, test:

- [ ] Error messages show as red toast notifications
- [ ] Success messages show as green toast notifications
- [ ] Confirmation dialogs appear correctly
- [ ] Confirmation dialogs can be cancelled
- [ ] Confirmation dialogs show loading state during action
- [ ] All alerts/confirms are replaced (search for remaining ones)
- [ ] No console errors
- [ ] Mobile experience works (toasts should be visible)

## Examples by Module

### Sales Module
```jsx
// ✅ Already migrated - see src/modules/sales/hooks/useSales.js
```

### Inventory Module
```jsx
// Before
alert("Error al guardar producto");

// After
import { toast } from '@/src/lib/notifications/toast';
toast.error("Error al guardar producto");
```

### Finance Module
```jsx
// Before
if (confirm("¿Eliminar esta cuenta?")) {
  deleteAccount();
}

// After
const { confirm, ConfirmDialog } = useConfirm();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: "Eliminar cuenta",
    message: "¿Está seguro de eliminar esta cuenta?",
    type: "danger"
  });
  if (confirmed) deleteAccount();
};
```

## Tips

1. **Start with one module** - Don't try to replace everything at once
2. **Test as you go** - Verify each replacement works
3. **Use consistent messages** - Keep error/success messages consistent
4. **Add ConfirmDialog to component** - Don't forget to render it!
5. **Check mobile** - Ensure toasts are visible on mobile devices

## Need Help?

If you encounter issues:
1. Check that packages are installed: `npm list react-hot-toast @tanstack/react-query`
2. Verify providers are in layout: `app/layout.jsx`
3. Check import paths are correct
4. Look at working examples in `src/modules/sales/`

