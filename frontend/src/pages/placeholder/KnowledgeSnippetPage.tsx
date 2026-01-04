import PlaceholderPage from './PlaceholderPage';
import { knowledgeSnippetApi } from '../../services/api';

export default function KnowledgeSnippetPage() {
  return (
    <PlaceholderPage
      title="工程碎片知识库"
      api={knowledgeSnippetApi}
      queryKey="knowledgeSnippets"
    />
  );
}


