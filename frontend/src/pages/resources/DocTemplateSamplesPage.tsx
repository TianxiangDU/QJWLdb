import { ResourcePage } from "@/components/resource/ResourcePage"
import { docTemplateSampleConfig, DocTemplateSample } from "@/config/resources"
import { createResourceApi } from "@/services/api-client"

const api = createResourceApi<DocTemplateSample>(docTemplateSampleConfig.apiPath)

export function DocTemplateSamplesPage() {
  return <ResourcePage config={docTemplateSampleConfig} api={api} />
}
