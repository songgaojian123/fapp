// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import HistoryNewEditForm from '../history-new-edit-form';

// ----------------------------------------------------------------------

export default function InvoiceCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new transaction"
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
            name: 'New Spending History',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HistoryNewEditForm />
    </Container>
  );
}
