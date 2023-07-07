import PropTypes from 'prop-types';
import { useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import FormProvider from 'src/components/hook-form';
import axios, { endpoints } from 'src/utils/axios';

// You may need to create these components based on your form design
import TransactionNewEditDetails from './history-new-edit-details';


const NewTransactionSchema = Yup.object().shape({
  amount: Yup.number().required('Amount is required').min(0),
  category: Yup.string().required('Category is required').trim().min(2).max(100),
  description: Yup.string().trim().max(500),
  date: Yup.date(),
  type: Yup.string().oneOf(['unspecified', 'income', 'expense'], 'Invalid type').default('unspecified'),
});

export default function HistoryNewEditForm({ currentTransaction }) {
  const router = useRouter();
  const loading = useBoolean();
  const { user } = useAuthContext();

  const defaultValues = useMemo(
    () => ({
      amount: currentTransaction?.amount || 0,
      category: currentTransaction?.category || '',
      description: currentTransaction?.description || '',
      date: currentTransaction?.date || new Date(),
      type: currentTransaction?.type || 'unspecified',
    }),
    [currentTransaction]
  );

  const methods = useForm({
    resolver: yupResolver(NewTransactionSchema),
    defaultValues,
  });

  const { reset, handleSubmit, formState: { isSubmitting } } = methods;

  const handleCreate = handleSubmit(async (data) => {
    loading.onTrue();

    try {
      await axios.post(endpoints.history.create(user.id), data); // You need to add 'history' endpoint in your axios.js
      reset();
      loading.onFalse();
      router.push(paths.dashboard.history.root); // You need to define this path in your routes
      console.info('DATA', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      loading.onFalse();
    }
  });

  return (
    <FormProvider methods={methods}>
      <Card>
        <TransactionNewEditDetails />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          size="large"
          variant="contained"
          loading={loading.value && isSubmitting}
          onClick={handleCreate}
        >
          {currentTransaction ? 'Update' : 'Create'}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

HistoryNewEditForm.propTypes = {
  currentTransaction: PropTypes.object,
};

