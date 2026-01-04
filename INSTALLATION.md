# Installation Guide for Improvements

This guide will help you install the required packages and set up the new improvements.

## Required Packages

Install the following packages to enable all improvements:

```bash
npm install react-hot-toast @tanstack/react-query
```

Or with yarn:

```bash
yarn add react-hot-toast @tanstack/react-query
```

## What's Been Added

### 1. Toast Notification System
- **Location**: `src/lib/notifications/toast.js`
- **Provider**: `src/components/providers/ToastProvider.jsx`
- **Usage**: Import and use `toast.success()`, `toast.error()`, etc.

### 2. Confirmation Dialog Component
- **Location**: `src/components/ui/ConfirmDialog.jsx`
- **Hook**: `src/hooks/useConfirm.js`
- **Usage**: Use the `useConfirm` hook for confirmation dialogs

### 3. Loading Skeletons
- **Location**: `src/components/ui/Skeleton.jsx`
- **Components**: `Skeleton`, `TableSkeleton`, `CardSkeleton`, `FormSkeleton`
- **Usage**: Replace loading text with skeleton components

### 4. React Query Setup
- **Location**: `src/components/providers/QueryProvider.jsx`
- **Usage**: Already integrated in root layout

### 5. API Client
- **Location**: `src/lib/api/client.js`
- **Usage**: Use `api.get()`, `api.post()`, etc. instead of direct fetch

### 6. Utility Hooks
- **useDebounce**: `src/hooks/useDebounce.js` - For search inputs
- **useConfirm**: `src/hooks/useConfirm.js` - For confirmation dialogs

## Files Updated

### Root Layout
- `app/layout.jsx` - Added ToastProvider and QueryProvider

### Audit Logging
- `src/lib/audit/auditLog.js` - Now stores logs in database

### Sales Module
- `src/modules/sales/hooks/useSales.js` - Uses toast and confirm dialog
- `src/modules/sales/SalesScreen.jsx` - Includes ConfirmDialog

### Other Modules
- `src/modules/inventory/components/ProductFormModal.jsx` - Uses toast
- `src/modules/POS/PosScreen.jsx` - Uses toast

## Next Steps

1. **Install packages** (see above)
2. **Test the improvements**:
   - Try creating/deleting a sale (should see toast notifications)
   - Try deleting something (should see confirmation dialog)
   - Check that loading states work properly

3. **Gradually replace remaining alerts**:
   - Search for `alert(` in your codebase
   - Replace with `toast.error()` or `toast.success()`
   - Search for `confirm(` and replace with `useConfirm` hook

4. **Add loading skeletons**:
   - Find components with "Cargando..." text
   - Replace with appropriate skeleton component

5. **Migrate to React Query** (optional but recommended):
   - Replace `useState` + `useEffect` patterns with `useQuery`
   - See React Query documentation for examples

## Example Usage

### Toast Notifications
```jsx
import { toast } from '@/src/lib/notifications/toast';

// Success
toast.success('Operación exitosa');

// Error
toast.error('Error al guardar');

// Info
toast.info('Información importante');

// Warning
toast.warning('Advertencia');
```

### Confirmation Dialog
```jsx
import { useConfirm } from '@/src/hooks/useConfirm';

function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Eliminar',
      message: '¿Está seguro?',
      type: 'danger',
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

### Loading Skeletons
```jsx
import { TableSkeleton, CardSkeleton } from '@/src/components/ui/Skeleton';

// In your component
{loading ? <TableSkeleton rows={5} columns={4} /> : <Table data={data} />}
```

### API Client
```jsx
import { api } from '@/src/lib/api/client';

// Instead of fetch
const data = await api.get('/api/sales', { orgSlug });
await api.post('/api/sales', saleData, { orgSlug });
```

### Debounced Search
```jsx
import { useDebounce } from '@/src/hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    // This runs 500ms after user stops typing
    fetchData(debouncedSearch);
  }, [debouncedSearch]);
}
```

## Troubleshooting

### Toast notifications not showing?
- Make sure `react-hot-toast` is installed
- Check that `ToastProvider` is in your root layout
- Verify the import path is correct

### Confirmation dialog not appearing?
- Make sure you're using the `useConfirm` hook correctly
- Check that `ConfirmDialog` is rendered in your component
- Verify the component is not conditionally hidden

### React Query errors?
- Make sure `@tanstack/react-query` is installed
- Check that `QueryProvider` is in your root layout
- Verify React version compatibility (requires React 18+)

## Support

If you encounter any issues, check:
1. Package versions match requirements
2. All imports are correct
3. Providers are properly set up in layout
4. No console errors

