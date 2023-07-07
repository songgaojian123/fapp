import { Helmet } from 'react-helmet-async';
// sections
import { FinAppView } from 'src/sections/app/financialApp/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Personal Financial Management</title>
      </Helmet>

      <FinAppView />
    </>
  );
}
