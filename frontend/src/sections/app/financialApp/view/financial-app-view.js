// @mui
import { useTheme } from '@mui/material/styles';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// components
import { useSettingsContext } from 'src/components/settings';

// assets
import { SeoIllustration } from 'src/assets/illustrations';
//
import AppWelcome from '../app-welcome';
import AppNewSpending from '../app-new-spending';
// ----------------------------------------------------------------------

export default function FinAppView() {
  const { user } = useAuthContext();

  const theme = useTheme();

  const settings = useSettingsContext();
  const recentSpendingHistory = user?.spendingHistory?.slice(-7);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <AppWelcome
            title={`Welcome back 👋 \n ${user?.username}`}
            
            img={<SeoIllustration />}

          />
        </Grid>

        <Grid xs={12} lg={8}>
          {user?.spendingHistory && (
            <AppNewSpending
              title="Spending History"
              tableData={recentSpendingHistory} // assuming 'user' is the object returned from UserController.get_user
              tableLabels={[
                { id: 'amount', label: 'Amount' },
                { id: 'category', label: 'Category' },
                { id: 'description', label: 'Description' },
                { id: 'date', label: 'Date' },
                { id: 'type', label: 'Type' },
              ]}
            />
          )}
        </Grid>

      </Grid>



    </Container>
  );
}
