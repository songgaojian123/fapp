// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// routes
// import { paths } from 'src/routes/paths';
// locales
// components
// import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const { user } = useAuthContext();

  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar src={user?.photoURL} alt={user?.name} sx={{ width: 48, height: 48 }} />

        </Box>

        <Stack spacing={0.5} sx={{ mt: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.name}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
            {user?.email}
          </Typography>
        </Stack>


      </Stack>
    </Stack>
  );
}
