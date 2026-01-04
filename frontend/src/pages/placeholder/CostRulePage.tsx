import PlaceholderPage from './PlaceholderPage';
import { costRuleApi } from '../../services/api';

export default function CostRulePage() {
  return (
    <PlaceholderPage
      title="工程造价规则库"
      api={costRuleApi}
      queryKey="costRules"
    />
  );
}


