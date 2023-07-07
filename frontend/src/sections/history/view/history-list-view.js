import sumBy from 'lodash/sumBy';
import { useState, useCallback } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
import axios, { endpoints } from 'src/utils/axios';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';
// utils
import { fTimestamp } from 'src/utils/format-time';
// _mock
import { INVOICE_SERVICE_OPTIONS } from 'src/_mock';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import InvoiceAnalytic from '../history-analytic';
import HistoryTableRow from '../history-table-row';
import InvoiceTableToolbar from '../history-table-toolbar';
import InvoiceTableFiltersResult from '../history-table-filters-result';

// ----------------------------------------------------------------------


const TABLE_HEAD = [
  { id: 'category', label: 'Category' },
  { id: 'description', label: 'Description' },
  { id: 'date', label: 'Date' },
  { id: 'amount', label: 'Amount' },
  { id: 'type', label: 'Type' },
  { id: '' },
];

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function HistoryListView() {
  const theme = useTheme();

  const settings = useSettingsContext();

  const { user } = useAuthContext();

  const spendingHistory = user?.spendingHistory;

  const router = useRouter();

  const table = useTable({ defaultOrderBy: 'createDate' });

  const confirm = useBoolean();

  const [tableData, setTableData] = useState(spendingHistory);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 76;

  const canReset =
    !!filters.name ||
    !!filters.service.length ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getHistoryLength = (type) => tableData.filter((item) => item.type === type).length;


  const getTotalAmount = (type) =>
    sumBy(
      tableData.filter((item) => item.type === type),
      'amount'
    );

  const getTransactionCount = (type) =>
    tableData.filter((item) => item.type === type).length;





  const totalUnspecifiedAmount = getTotalAmount('unspecified');
  const totalIncomeAmount = getTotalAmount('income');
  const totalExpenseAmount = getTotalAmount('expense');
  const totalAllTypesAmount = totalUnspecifiedAmount + totalIncomeAmount + totalExpenseAmount;



  const TABS = [
    { value: 'all', label: 'All', color: 'default', count: tableData.length },
    { value: 'income', label: 'Income', color: 'success', count: getHistoryLength('income') },
    { value: 'expense', label: 'Expense', color: 'warning', count: getHistoryLength('expense') },
    { value: 'unspecified', label: 'Unspecified', color: 'error', count: getHistoryLength('unspecified') },
  ];

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );


  const handleDeleteRow = useCallback(
    async (transactionId) => {
      try {
        await axios.delete(endpoints.history.delete(user.id, transactionId));
        const deleteRow = tableData.filter((row) => row._id !== transactionId);
        setTableData(deleteRow);
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    },
    [dataInPage.length, table, tableData, user.id]
  );


  const handleDeleteRows = useCallback(() => {
    
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Your Spending History"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Spending History',
              href: paths.dashboard.history.root,
            },
            {
              name: 'List',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.history.create}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Transaction
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <InvoiceAnalytic
                title="Expense"
                total={getTransactionCount('expense')}
                percent={totalExpenseAmount / totalAllTypesAmount * 100}
                price={totalExpenseAmount}
                icon="solar:hand-money-linear"
                color={theme.palette.info.main}
              />

              <InvoiceAnalytic
                title="Income"
                total={getTransactionCount('income')}
                percent={totalIncomeAmount / totalAllTypesAmount * 100}
                price={totalIncomeAmount}
                icon="solar:wallet-money-linear"
                color={theme.palette.success.main}
              />

              <InvoiceAnalytic
                title="Unspecified"
                total={getTransactionCount('unspecified')}
                percent={totalUnspecifiedAmount / totalAllTypesAmount * 100}
                price={totalUnspecifiedAmount}
                icon="solar:danger-triangle-linear"
                color={theme.palette.warning.main}
              />


            </Stack>
          </Scrollbar>
        </Card>

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <InvoiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
            serviceOptions={INVOICE_SERVICE_OPTIONS.map((option) => option.name)}
          />

          {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}

                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row, index) => (
                      <HistoryTableRow
                        key={index}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
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

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (transaction) =>
        (transaction.category && transaction.category.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (transaction.description && transaction.description.toLowerCase().indexOf(name.toLowerCase()) !== -1)
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((transaction) => transaction.type === status);
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (transaction) =>
          new Date(transaction.date) >= new Date(startDate) &&
          new Date(transaction.date) <= new Date(endDate)
      );
    }
  }

  return inputData;
}

