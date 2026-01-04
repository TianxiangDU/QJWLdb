import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthGuard from './components/AuthGuard';
import LoginPage from './pages/login/LoginPage';
import SearchPage from './pages/search/SearchPage';
import DocTypePage from './pages/doc-type/DocTypePage';
import DocFieldDefPage from './pages/doc-field-def/DocFieldDefPage';
import DocTemplateSamplePage from './pages/doc-template-sample/DocTemplateSamplePage';
import AuditRulePage from './pages/audit-rule/AuditRulePage';
import AuditRuleDetailPage from './pages/audit-rule/AuditRuleDetailPage';
import LawDocumentPage from './pages/law-document/LawDocumentPage';
import LawClausePage from './pages/law-clause/LawClausePage';
import LawClauseDocTypeLinkPage from './pages/law-clause-doc-type-link/LawClauseDocTypeLinkPage';
import CostRulePage from './pages/placeholder/CostRulePage';
import BizProcessPage from './pages/placeholder/BizProcessPage';
import CaseLibraryPage from './pages/placeholder/CaseLibraryPage';
import KnowledgeSnippetPage from './pages/placeholder/KnowledgeSnippetPage';
import MonitorMetricPage from './pages/placeholder/MonitorMetricPage';

function App() {
  return (
    <Routes>
      {/* 登录页 - 无需认证 */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* 受保护的路由 - 需要登录 */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/search" replace />} />
        {/* 搜索主页 */}
        <Route path="search" element={<SearchPage />} />
        {/* 文件体系库 */}
        <Route path="doc-types" element={<DocTypePage />} />
        <Route path="doc-field-defs" element={<DocFieldDefPage />} />
        <Route path="doc-template-samples" element={<DocTemplateSamplePage />} />
        {/* 审计逻辑库 */}
        <Route path="audit-rules" element={<AuditRulePage />} />
        <Route path="audit-rules/:id" element={<AuditRuleDetailPage />} />
        {/* 法律法规库 */}
        <Route path="law-documents" element={<LawDocumentPage />} />
        <Route path="law-clauses" element={<LawClausePage />} />
        <Route path="law-clause-doc-type-links" element={<LawClauseDocTypeLinkPage />} />
        {/* 占位模块 */}
        <Route path="cost-rules" element={<CostRulePage />} />
        <Route path="biz-processes" element={<BizProcessPage />} />
        <Route path="case-libraries" element={<CaseLibraryPage />} />
        <Route path="knowledge-snippets" element={<KnowledgeSnippetPage />} />
        <Route path="monitor-metrics" element={<MonitorMetricPage />} />
      </Route>
      
      {/* 404 重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
