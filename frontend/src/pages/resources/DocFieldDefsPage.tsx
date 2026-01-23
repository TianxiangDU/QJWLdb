import { ResourcePage } from "@/components/resource/ResourcePage"
import { docFieldDefConfig, DocFieldDef } from "@/config/resources"
import { createResourceApi } from "@/services/api-client"

const api = createResourceApi<DocFieldDef>(docFieldDefConfig.apiPath)

export function DocFieldDefsPage() {
  return <ResourcePage config={docFieldDefConfig} api={api} />
}
