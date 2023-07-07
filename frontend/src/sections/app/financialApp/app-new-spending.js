import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { TableHeadCustom } from 'src/components/table';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export default function AppNewSpending({ title, subheader, tableData, tableLabels, ...other }) {
  

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 680 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row) => (
                <AppNewSpendingRow key={row._id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          component={RouterLink}
          to={paths.dashboard.history.root}
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
        >
          View All
        </Button>
      </Box>
    </Card>
  );
}

AppNewSpending.propTypes = {
  subheader: PropTypes.string,
  tableData: PropTypes.array,
  tableLabels: PropTypes.array,
  title: PropTypes.string,
};


AppNewSpending.propTypes = {
  subheader: PropTypes.string,
  tableData: PropTypes.array,
  tableLabels: PropTypes.array,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function AppNewSpendingRow({ row }) {
  const dateObject = new Date(row.date);
  // Format the date
  const formattedDate = `${dateObject.getFullYear()}-${(dateObject.getMonth() + 1).toString().padStart(2, '0')}-${dateObject.getDate().toString().padStart(2, '0')}`;

  return (
    <TableRow>
      <TableCell>{fCurrency(row.amount)}</TableCell>
      <TableCell>{row.category}</TableCell>
      <TableCell>{row.description}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            (row.type === 'unspecified' && 'warning') ||
            (row.type === 'expense' && 'error') ||
            'success'
          }
        >
          {row.type}
        </Label>
      </TableCell>
    </TableRow>
  );
}

AppNewSpendingRow.propTypes = {
  row: PropTypes.object,
};
