import PlaceholderPage from './PlaceholderPage';
import { bizProcessApi } from '../../services/api';

export default function BizProcessPage() {
  return (
    <PlaceholderPage
      title="工程咨询业务流程库"
      api={bizProcessApi}
      queryKey="bizProcesses"
    />
  );
}


