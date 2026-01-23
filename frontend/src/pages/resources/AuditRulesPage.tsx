import { ResourcePage } from "@/components/resource/ResourcePage"
import { auditRuleConfig, AuditRule } from "@/config/resources"
import { createResourceApi } from "@/services/api-client"

const api = createResourceApi<AuditRule>(auditRuleConfig.apiPath)

export function AuditRulesPage() {
  return <ResourcePage config={auditRuleConfig} api={api} />
}
