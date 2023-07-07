import sum from 'lodash/sum';
import { useCallback, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { inputBaseClasses } from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
// utils
import { fCurrency } from 'src/utils/format-number';
// _mock
import { INVOICE_SERVICE_OPTIONS } from 'src/_mock';

// components
import Iconify from 'src/components/iconify';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function TransactionNewEditDetails() {
  const { setValue, watch } = useFormContext();

  const values = watch();

  const handleChangeAmount = useCallback(
    (event) => {
      setValue('amount', Number(event.target.value));
    },
    [setValue]
  );

  function formatDate(date) {
    const d = new Date(date);
    let month = `${d.getMonth() + 1}`;
    let day = `${d.getDate()}`;
    const year = d.getFullYear();

    if (month.length < 2) {
      month = `0${month}`;
    }
    if (day.length < 2) {
      day = `0${day}`;
    }

    return `${year}-${month}-${day}`;
  }


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Details:
      </Typography>

      <Stack direction="row" spacing={2}>
        <RHFTextField
          size="small"
          name="amount"
          label="Amount"
          type="number"
          onChange={handleChangeAmount}
          InputLabelProps={{ shrink: true }}
          placeholder="$0.00"
          sx={{ maxWidth: { md: 96 } }}
        />

        <RHFTextField
          size="small"
          name="category"
          label="Category"
          InputLabelProps={{ shrink: true }}
          sx={{ maxWidth: { md: 200 } }}
        />

        <RHFTextField
          size="small"
          name="description"
          label="Description"
          InputLabelProps={{ shrink: true }}
          sx={{ maxWidth: { md: 200 } }}
        />

        <RHFTextField
          size="small"
          name="date"
          label="Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          sx={{ maxWidth: { md: 200 } }}
          value={formatDate(values.date)}
        />


        <RHFTextField
          size="small"
          name="type"
          label="Type"
          select
          InputLabelProps={{ shrink: true }}
          sx={{ maxWidth: { md: 200 } }}
        >
          <MenuItem value="unspecified">Unspecified</MenuItem>
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="expense">Expense</MenuItem>
        </RHFTextField>
      </Stack>
    </Box>
  );
}