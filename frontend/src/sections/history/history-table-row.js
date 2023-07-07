import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function HistoryTableRow({
  row,
  selected,
  onDeleteRow,
}) {
  const { amount, category, description, date, type } = row;
  const confirm = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        

        <TableCell>
          <ListItemText
            disableTypography
            primary={
              <Typography variant="body2" noWrap>
                {category}
              </Typography>
            }
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={description}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(date), 'dd MMM yyyy')}
            primaryTypographyProps={{ variant: 'subtitle2', noWrap: true }}
          />
        </TableCell>

        <TableCell>{fCurrency(amount)}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (type === 'income' && 'success') ||
              (type === 'unspecified' && 'warning') ||
              (type === 'expense' && 'error') ||
              'default'
            }
          >
            {type}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>

        }
      />
    </>
  );
}


HistoryTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};