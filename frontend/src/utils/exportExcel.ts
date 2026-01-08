/**
 * 将数据导出为Excel文件
 * @param data 要导出的数据数组
 * @param columns 列配置 { key, title }
 * @param filename 文件名（不含扩展名）
 */
export function exportToExcel(
  data: any[],
  columns: { key: string; title: string }[],
  filename: string
) {
  // 创建CSV内容（使用CSV兼容Excel，无需额外依赖）
  const BOM = '\uFEFF'; // UTF-8 BOM，确保Excel正确显示中文
  
  // 表头
  const headerRow = columns.map(col => `"${col.title}"`).join(',');
  
  // 数据行
  const dataRows = data.map(row => 
    columns.map(col => {
      let value = row[col.key];
      // 处理嵌套属性，如 docType.name
      if (col.key.includes('.')) {
        const keys = col.key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], row);
      }
      // 处理null/undefined
      if (value === null || value === undefined) {
        value = '';
      }
      // 转换为字符串并转义双引号
      const strValue = String(value).replace(/"/g, '""');
      return `"${strValue}"`;
    }).join(',')
  ).join('\n');
  
  const csvContent = BOM + headerRow + '\n' + dataRows;
  
  // 创建Blob并下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 文件类型导出列配置
export const docTypeExportColumns = [
  { key: 'name', title: '文件类型名称' },
  { key: 'code', title: '文件类型编码' },
  { key: 'projectPhase', title: '所属项目阶段' },
  { key: 'majorCategory', title: '所属大类' },
  { key: 'minorCategory', title: '所属小类' },
  { key: 'projectType', title: '适用项目类型' },
  { key: 'region', title: '适用地区' },
  { key: 'ownerOrg', title: '适用业主' },
  { key: 'bizDescription', title: '业务说明/使用场景' },
  { key: 'fileFeature', title: '文件特征信息' },
  { key: 'remark', title: '备注' },
];

// 关键信息字段导出列配置
export const docFieldDefExportColumns = [
  { key: 'fieldName', title: '字段名称' },
  { key: 'fieldCode', title: '字段编码' },
  { key: 'docType.name', title: '所属文件类型名称' },
  { key: 'docType.code', title: '所属文件类型编码' },
  { key: 'fieldCategory', title: '字段类别' },
  { key: 'requiredFlag', title: '是否必填' },
  { key: 'valueSource', title: '取值方式' },
  { key: 'anchorWord', title: '定位词' },
  { key: 'enumOptions', title: '枚举值' },
  { key: 'exampleValue', title: '示例数据' },
  { key: 'fieldDescription', title: '字段说明' },
];

// 文件模板/示例导出列配置
export const docTemplateSampleExportColumns = [
  { key: 'fileName', title: '文件名称' },
  { key: 'docType.name', title: '所属文件类型' },
  { key: 'docType.code', title: '所属文件类型编码' },
  { key: 'description', title: '说明' },
  { key: 'filePath', title: '文件路径' },
];

// 审计规则导出列配置
export const auditRuleExportColumns = [
  { key: 'ruleCode', title: '规则编码' },
  { key: 'ruleName', title: '规则名称' },
  { key: 'ruleCategory', title: '规则类别' },
  { key: 'bizDescription', title: '业务说明' },
  { key: 'compareMethod', title: '比对方法' },
  { key: 'riskLevel', title: '风险等级' },
  { key: 'projectPhase', title: '适用阶段' },
  { key: 'projectType', title: '适用项目类型' },
];

// 法规与标准导出列配置
export const lawDocumentExportColumns = [
  { key: 'lawCode', title: '法规编号' },
  { key: 'lawName', title: '法规名称' },
  { key: 'lawCategory', title: '法规类别' },
  { key: 'issueOrg', title: '发布机构' },
  { key: 'issueDate', title: '发布日期' },
  { key: 'effectiveDate', title: '生效日期' },
  { key: 'status', title: '状态' },
  { key: 'summary', title: '摘要' },
];

// 法规条款导出列配置
export const lawClauseExportColumns = [
  { key: 'lawCode', title: '法规编号' },
  { key: 'lawName', title: '法规名称' },
  { key: 'clauseNo', title: '条款号' },
  { key: 'clauseTitle', title: '条款标题' },
  { key: 'clauseText', title: '条款内容' },
  { key: 'clauseSummary', title: '条款摘要' },
  { key: 'keywords', title: '关键词' },
];


