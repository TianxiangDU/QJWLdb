import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { MainLayout } from "@/layouts/MainLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { HomePage } from "@/pages/home/HomePage"
import { DocTypesPage } from "@/pages/resources/DocTypesPage"
import { DocFieldDefsPage } from "@/pages/resources/DocFieldDefsPage"
import { AuditRulesPage } from "@/pages/resources/AuditRulesPage"
import { LawDocumentsPage } from "@/pages/resources/LawDocumentsPage"
import { LawClausesPage } from "@/pages/resources/LawClausesPage"
import { SchemaExplorerPage } from "@/pages/schema/SchemaExplorerPage"
import { getToken } from "@/services/api-client"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
})

// 路由守卫
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="doc-types" element={<DocTypesPage />} />
            <Route path="doc-field-defs" element={<DocFieldDefsPage />} />
            <Route path="doc-template-samples" element={<DocTypesPage />} />
            <Route path="audit-rules" element={<AuditRulesPage />} />
            <Route path="law-documents" element={<LawDocumentsPage />} />
            <Route path="law-clauses" element={<LawClausesPage />} />
            <Route path="schema" element={<SchemaExplorerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
