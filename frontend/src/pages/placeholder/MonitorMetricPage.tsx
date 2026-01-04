import PlaceholderPage from './PlaceholderPage';
import { monitorMetricApi } from '../../services/api';

export default function MonitorMetricPage() {
  return (
    <PlaceholderPage
      title="工程数据监测"
      api={monitorMetricApi}
      queryKey="monitorMetrics"
    />
  );
}


