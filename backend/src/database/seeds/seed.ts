import { DataSource } from 'typeorm';
import { DocType } from '../../modules/doc-type/entities/doc-type.entity';
import { DocFieldDef } from '../../modules/doc-field-def/entities/doc-field-def.entity';
import { AuditRule } from '../../modules/audit-rule/entities/audit-rule.entity';
import { AuditRuleFieldLink } from '../../modules/audit-rule-field-link/entities/audit-rule-field-link.entity';
import { LawDocument } from '../../modules/law-document/entities/law-document.entity';
import { LawClause } from '../../modules/law-clause/entities/law-clause.entity';
import { AuditRuleLawLink } from '../../modules/audit-rule-law-link/entities/audit-rule-law-link.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'qjwl_db',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('数据库连接成功');

  // 1. 插入文件类型
  const docTypeRepo = dataSource.getRepository(DocType);
  
  const docTypes = [
    {
      code: 'LXPF',
      name: '立项批复',
      projectPhase: '立项阶段',
      projectType: '房建,市政,公路',
      region: '全国',
      requiredFlag: 1,
      bizDescription: '政府投资项目立项审批文件，用于确定项目可行性及投资规模。',
    },
    {
      code: 'SGHT',
      name: '施工合同',
      projectPhase: '施工阶段',
      projectType: '房建,市政,公路',
      region: '全国',
      requiredFlag: 1,
      bizDescription: '建设单位与施工单位签订的工程承包合同，明确工程范围、工期、造价等核心条款。',
    },
    {
      code: 'JGYS',
      name: '竣工验收报告',
      projectPhase: '竣工阶段',
      projectType: '房建,市政,公路',
      region: '全国',
      requiredFlag: 1,
      bizDescription: '工程竣工后的综合验收报告，确认工程质量达标可交付使用。',
    },
  ];

  for (const dt of docTypes) {
    const existing = await docTypeRepo.findOne({ where: { code: dt.code } });
    if (!existing) {
      await docTypeRepo.save(docTypeRepo.create(dt));
      console.log(`创建文件类型: ${dt.name}`);
    }
  }

  // 2. 插入文件字段定义
  const docFieldRepo = dataSource.getRepository(DocFieldDef);
  const sghtDocType = await docTypeRepo.findOne({ where: { code: 'SGHT' } });
  
  if (sghtDocType) {
    const fields = [
      {
        docTypeId: sghtDocType.id,
        fieldCode: 'CONTRACT_NO',
        fieldName: '合同编号',
        fieldCategory: '文字',
        requiredFlag: 1,
        fieldDescription: '施工合同的唯一编号',
        valueSource: '人工录入',
        sortOrder: 1,
      },
      {
        docTypeId: sghtDocType.id,
        fieldCode: 'CONTRACT_AMOUNT',
        fieldName: '合同金额',
        fieldCategory: '金额',
        requiredFlag: 1,
        fieldDescription: '合同约定的工程总价款（万元）',
        valueSource: '人工录入',
        sortOrder: 2,
      },
      {
        docTypeId: sghtDocType.id,
        fieldCode: 'SIGN_DATE',
        fieldName: '签订日期',
        fieldCategory: '日期',
        requiredFlag: 1,
        fieldDescription: '合同签订的日期',
        valueSource: '人工录入',
        sortOrder: 3,
      },
      {
        docTypeId: sghtDocType.id,
        fieldCode: 'CONSTRUCTION_PERIOD',
        fieldName: '工期',
        fieldCategory: '数量',
        requiredFlag: 1,
        fieldDescription: '合同约定的工程建设周期（天）',
        valueSource: '人工录入',
        sortOrder: 4,
      },
    ];

    for (const f of fields) {
      const existing = await docFieldRepo.findOne({
        where: { docTypeId: f.docTypeId, fieldCode: f.fieldCode },
      });
      if (!existing) {
        await docFieldRepo.save(docFieldRepo.create(f));
        console.log(`创建字段定义: ${f.fieldName}`);
      }
    }
  }

  // 3. 插入法规
  const lawDocRepo = dataSource.getRepository(LawDocument);
  
  const laws = [
    {
      lawCode: 'GB50500-2013',
      lawName: '建设工程工程量清单计价规范',
      lawCategory: '国家标准',
      issueOrg: '住房和城乡建设部',
      issueDate: new Date('2013-04-01'),
      effectiveDate: new Date('2013-07-01'),
      regionScope: '全国',
      industryScope: '建设工程',
      lawStatus: '有效',
      summary: '规定了建设工程工程量清单的编制方法、计价规则等内容，是工程造价管理的重要依据。',
    },
  ];

  for (const law of laws) {
    const existing = await lawDocRepo.findOne({ where: { lawCode: law.lawCode } });
    if (!existing) {
      await lawDocRepo.save(lawDocRepo.create(law));
      console.log(`创建法规: ${law.lawName}`);
    }
  }

  // 4. 插入法规条款
  const lawClauseRepo = dataSource.getRepository(LawClause);
  const gb50500 = await lawDocRepo.findOne({ where: { lawCode: 'GB50500-2013' } });
  
  if (gb50500) {
    const clauses = [
      {
        lawDocumentId: gb50500.id,
        lawCode: 'GB50500-2013',
        lawName: '建设工程工程量清单计价规范',
        clauseNo: '3.1.1',
        clauseTitle: '工程量清单',
        clauseText: '工程量清单应由具有编制能力的招标人或受其委托具有相应资质的工程造价咨询人编制。',
        clauseSummary: '明确工程量清单的编制主体资质要求',
        levelLabel: '条',
        importanceLevel: '重要',
      },
      {
        lawDocumentId: gb50500.id,
        lawCode: 'GB50500-2013',
        lawName: '建设工程工程量清单计价规范',
        clauseNo: '4.1.2',
        clauseTitle: '招标控制价',
        clauseText: '招标人应根据国家或省级建设主管部门发布的计价依据和规定编制招标控制价。',
        clauseSummary: '招标控制价的编制依据要求',
        levelLabel: '条',
        importanceLevel: '关键',
      },
    ];

    for (const c of clauses) {
      const existing = await lawClauseRepo.findOne({
        where: { lawDocumentId: c.lawDocumentId, clauseNo: c.clauseNo },
      });
      if (!existing) {
        await lawClauseRepo.save(lawClauseRepo.create(c));
        console.log(`创建法规条款: ${c.clauseNo}`);
      }
    }
  }

  // 5. 插入审计规则
  const auditRuleRepo = dataSource.getRepository(AuditRule);
  
  const rules = [
    {
      ruleCode: 'AR-HT-001',
      ruleName: '合同金额不得超过控制价',
      ruleCategory: '合同',
      bizDescription: '施工合同签订金额不得超过经审批的招标控制价，否则存在超概算风险。',
      compareMethod: '比对合同金额与招标控制价，如合同金额>控制价，则触发风险预警。',
      riskLevel: '高',
      projectPhase: '施工阶段',
      projectType: '房建,市政,公路',
      version: 1,
    },
    {
      ruleCode: 'AR-BG-001',
      ruleName: '变更超比例审批',
      ruleCategory: '变更',
      bizDescription: '工程变更累计金额超过合同价款一定比例时，需按规定程序报批。',
      compareMethod: '计算变更累计金额/合同金额比例，超过阈值（如10%）时预警。',
      riskLevel: '中',
      projectPhase: '施工阶段',
      projectType: '房建,市政,公路',
      version: 1,
    },
  ];

  for (const r of rules) {
    const existing = await auditRuleRepo.findOne({ where: { ruleCode: r.ruleCode } });
    if (!existing) {
      await auditRuleRepo.save(auditRuleRepo.create(r));
      console.log(`创建审计规则: ${r.ruleName}`);
    }
  }

  // 6. 关联审计规则与字段
  const ruleFieldLinkRepo = dataSource.getRepository(AuditRuleFieldLink);
  const rule1 = await auditRuleRepo.findOne({ where: { ruleCode: 'AR-HT-001' } });
  const contractAmountField = await docFieldRepo.findOne({
    where: { fieldCode: 'CONTRACT_AMOUNT' },
  });

  if (rule1 && sghtDocType && contractAmountField) {
    const existing = await ruleFieldLinkRepo.findOne({
      where: { ruleId: rule1.id, docFieldId: contractAmountField.id },
    });
    if (!existing) {
      await ruleFieldLinkRepo.save(
        ruleFieldLinkRepo.create({
          ruleId: rule1.id,
          docTypeId: sghtDocType.id,
          docFieldId: contractAmountField.id,
          requiredFlag: 1,
          remark: '用于比对是否超过控制价',
        }),
      );
      console.log('创建规则字段关联');
    }
  }

  // 7. 关联审计规则与法规条款
  const ruleLawLinkRepo = dataSource.getRepository(AuditRuleLawLink);
  const clause412 = await lawClauseRepo.findOne({ where: { clauseNo: '4.1.2' } });

  if (rule1 && gb50500 && clause412) {
    const existing = await ruleLawLinkRepo.findOne({
      where: { ruleId: rule1.id, lawClauseId: clause412.id },
    });
    if (!existing) {
      await ruleLawLinkRepo.save(
        ruleLawLinkRepo.create({
          ruleId: rule1.id,
          lawDocumentId: gb50500.id,
          lawClauseId: clause412.id,
          lawCode: gb50500.lawCode,
          lawName: gb50500.lawName,
          clauseNo: clause412.clauseNo,
          referenceDescription: '依据该条款，招标控制价为合同签约上限',
        }),
      );
      console.log('创建规则法规关联');
    }
  }

  await dataSource.destroy();
  console.log('种子数据插入完成');
}

seed().catch((err) => {
  console.error('种子数据插入失败:', err);
  process.exit(1);
});


