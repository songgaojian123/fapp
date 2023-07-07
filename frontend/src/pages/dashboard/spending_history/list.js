import { Helmet } from 'react-helmet-async';
// sections
import { HistoryListView } from 'src/sections/history/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Spending History</title>
      </Helmet>

      <HistoryListView />
    </>
  );
}
