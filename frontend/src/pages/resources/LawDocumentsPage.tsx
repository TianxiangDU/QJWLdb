import { ResourcePage } from "@/components/resource/ResourcePage"
import { lawDocumentConfig, LawDocument } from "@/config/resources"
import { createResourceApi } from "@/services/api-client"

const api = createResourceApi<LawDocument>(lawDocumentConfig.apiPath)

export function LawDocumentsPage() {
  return <ResourcePage config={lawDocumentConfig} api={api} />
}
