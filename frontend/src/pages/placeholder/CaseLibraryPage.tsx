import PlaceholderPage from './PlaceholderPage';
import { caseLibraryApi } from '../../services/api';

export default function CaseLibraryPage() {
  return (
    <PlaceholderPage
      title="工程案例库"
      api={caseLibraryApi}
      queryKey="caseLibraries"
    />
  );
}


