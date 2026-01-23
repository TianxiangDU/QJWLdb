import { ResourcePage } from "@/components/resource/ResourcePage"
import { lawClauseConfig, LawClause } from "@/config/resources"
import { createResourceApi } from "@/services/api-client"

const api = createResourceApi<LawClause>(lawClauseConfig.apiPath)

export function LawClausesPage() {
  return <ResourcePage config={lawClauseConfig} api={api} />
}
