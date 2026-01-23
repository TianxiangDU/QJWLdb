import { ResourcePage } from "@/components/resource/ResourcePage"
import { docTypeConfig, DocType } from "@/config/resources"
import { createResourceApi } from "@/services/api-client"

const api = createResourceApi<DocType>(docTypeConfig.apiPath)

export function DocTypesPage() {
  return <ResourcePage config={docTypeConfig} api={api} />
}
