import { Helmet } from 'react-helmet-async';
// sections
import { HistoryCreateView } from 'src/sections/history/view';

// ----------------------------------------------------------------------

export default function HistoryCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create</title>
      </Helmet>

      <HistoryCreateView />
    </>
  );
}
