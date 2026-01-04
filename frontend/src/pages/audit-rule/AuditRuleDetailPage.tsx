import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Descriptions,
  Tabs,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Input,
  message,
  Popconfirm,
  Tag,
  Spin,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  auditRuleApi,
  auditRuleFieldLinkApi,
  auditRuleLawLinkApi,
  auditRuleExampleApi,
  docTypeApi,
  docFieldDefApi,
  lawDocumentApi,
  lawClauseApi,
  AuditRuleFieldLink,
  AuditRuleLawLink,
  AuditRuleExample,
} from '../../services/api';

export default function AuditRuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ruleId = Number(id);

  const [fieldLinkModalOpen, setFieldLinkModalOpen] = useState(false);
  const [lawLinkModalOpen, setLawLinkModalOpen] = useState(false);
  const [exampleModalOpen, setExampleModalOpen] = useState(false);
  const [fieldLinkForm] = Form.useForm();
  const [lawLinkForm] = Form.useForm();
  const [exampleForm] = Form.useForm();
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<number | null>(null);
  const [selectedLawDocumentId, setSelectedLawDocumentId] = useState<number | null>(null);

  const { data: rule, isLoading } = useQuery({
    queryKey: ['auditRule', ruleId],
    queryFn: () => auditRuleApi.get(ruleId),
  });

  const { data: docTypes } = useQuery({
    queryKey: ['docTypesAll'],
    queryFn: () => docTypeApi.all(),
  });

  const { data: docFields } = useQuery({
    queryKey: ['docFields', selectedDocTypeId],
    queryFn: () => selectedDocTypeId ? docFieldDefApi.byDocType(selectedDocTypeId) : Promise.resolve([]),
    enabled: !!selectedDocTypeId,
  });

  const { data: lawDocuments } = useQuery({
    queryKey: ['lawDocumentsAll'],
    queryFn: () => lawDocumentApi.all(),
  });

  const { data: lawClauses } = useQuery({
    queryKey: ['lawClauses', selectedLawDocumentId],
    queryFn: () => selectedLawDocumentId ? lawClauseApi.byLaw(selectedLawDocumentId) : Promise.resolve([]),
    enabled: !!selectedLawDocumentId,
  });

  const createFieldLinkMutation = useMutation({
    mutationFn: (data: Partial<AuditRuleFieldLink>) => auditRuleFieldLinkApi.create(data),
    onSuccess: () => {
      message.success('添加成功');
      setFieldLinkModalOpen(false);
      fieldLinkForm.resetFields();
      setSelectedDocTypeId(null);
      queryClient.invalidateQueries({ queryKey: ['auditRule', ruleId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || '添加失败'),
  });

  const deleteFieldLinkMutation = useMutation({
    mutationFn: (id: number) => auditRuleFieldLinkApi.delete(id),
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['auditRule', ruleId] });
    },
  });

  const createLawLinkMutation = useMutation({
    mutationFn: (data: Partial<AuditRuleLawLink>) => auditRuleLawLinkApi.create(data),
    onSuccess: () => {
      message.success('添加成功');
      setLawLinkModalOpen(false);
      lawLinkForm.resetFields();
      setSelectedLawDocumentId(null);
      queryClient.invalidateQueries({ queryKey: ['auditRule', ruleId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || '添加失败'),
  });

  const deleteLawLinkMutation = useMutation({
    mutationFn: (id: number) => auditRuleLawLinkApi.delete(id),
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['auditRule', ruleId] });
    },
  });

  const createExampleMutation = useMutation({
    mutationFn: (data: Partial<AuditRuleExample>) => auditRuleExampleApi.create(data),
    onSuccess: () => {
      message.success('添加成功');
      setExampleModalOpen(false);
      exampleForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['auditRule', ruleId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || '添加失败'),
  });

  const deleteExampleMutation = useMutation({
    mutationFn: (id: number) => auditRuleExampleApi.delete(id),
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['auditRule', ruleId] });
    },
  });

  const handleAddFieldLink = async () => {
    try {
      const values = await fieldLinkForm.validateFields();
      createFieldLinkMutation.mutate({
        ruleId,
        docTypeId: values.docTypeId,
        docFieldId: values.docFieldId,
        requiredFlag: values.requiredFlag || 0,
        remark: values.remark,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleAddLawLink = async () => {
    try {
      const values = await lawLinkForm.validateFields();
      const lawDocument = lawDocuments?.find(d => d.id === values.lawDocumentId);
      const lawClause = lawClauses?.find(c => c.id === values.lawClauseId);
      createLawLinkMutation.mutate({
        ruleId,
        lawDocumentId: values.lawDocumentId,
        lawClauseId: values.lawClauseId,
        lawCode: lawDocument?.lawCode,
        lawName: lawDocument?.lawName,
        clauseNo: lawClause?.clauseNo,
        referenceDescription: values.referenceDescription,
        remark: values.remark,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleAddExample = async () => {
    try {
      const values = await exampleForm.validateFields();
      createExampleMutation.mutate({
        ruleId,
        ...values,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const fieldLinkColumns: ColumnsType<AuditRuleFieldLink> = [
    { title: '文件类型', dataIndex: ['docType', 'name'], key: 'docType', width: 150 },
    { title: '字段编码', dataIndex: ['docField', 'fieldCode'], key: 'fieldCode', width: 150 },
    { title: '字段名称', dataIndex: ['docField', 'fieldName'], key: 'fieldName', width: 150 },
    {
      title: '是否必需',
      dataIndex: 'requiredFlag',
      key: 'requiredFlag',
      width: 100,
      render: (v) => v === 1 ? <Tag color="red">是</Tag> : <Tag>否</Tag>,
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除该关联吗？"
          onConfirm={() => deleteFieldLinkMutation.mutate(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const lawLinkColumns: ColumnsType<AuditRuleLawLink> = [
    { title: '法规编号', dataIndex: 'lawCode', key: 'lawCode', width: 150 },
    { title: '法规名称', dataIndex: 'lawName', key: 'lawName', width: 200 },
    { title: '条款编号', dataIndex: 'clauseNo', key: 'clauseNo', width: 100 },
    { title: '引用说明', dataIndex: 'referenceDescription', key: 'referenceDescription', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除该关联吗？"
          onConfirm={() => deleteLawLinkMutation.mutate(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const exampleColumns: ColumnsType<AuditRuleExample> = [
    { title: '案例名称', dataIndex: 'exampleName', key: 'exampleName', width: 200 },
    { title: '案例背景', dataIndex: 'background', key: 'background', ellipsis: true },
    { title: '审计结论', dataIndex: 'conclusionExample', key: 'conclusionExample', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除该案例吗？"
          onConfirm={() => deleteExampleMutation.mutate(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!rule) {
    return <div>规则不存在</div>;
  }

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/audit-rules')}>
            返回
          </Button>
          <h2 style={{ margin: 0 }}>{rule.ruleName}</h2>
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={3}>
          <Descriptions.Item label="规则编码">{rule.ruleCode}</Descriptions.Item>
          <Descriptions.Item label="规则分类">{rule.ruleCategory}</Descriptions.Item>
          <Descriptions.Item label="风险等级">
            <Tag color={rule.riskLevel === '高' ? 'red' : rule.riskLevel === '中' ? 'orange' : 'green'}>
              {rule.riskLevel}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="适用阶段">{rule.projectPhase}</Descriptions.Item>
          <Descriptions.Item label="适用类型">{rule.projectType}</Descriptions.Item>
          <Descriptions.Item label="版本号">{rule.version}</Descriptions.Item>
          <Descriptions.Item label="业务说明" span={3}>{rule.bizDescription}</Descriptions.Item>
          <Descriptions.Item label="比对方法" span={3}>{rule.compareMethod}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Tabs
          items={[
            {
              key: 'fields',
              label: '关联字段',
              children: (
                <>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                    onClick={() => setFieldLinkModalOpen(true)}
                  >
                    添加关联字段
                  </Button>
                  <Table
                    columns={fieldLinkColumns}
                    dataSource={rule.fieldLinks?.filter(l => l.status === 1)}
                    rowKey="id"
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'laws',
              label: '法规依据',
              children: (
                <>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                    onClick={() => setLawLinkModalOpen(true)}
                  >
                    添加法规依据
                  </Button>
                  <Table
                    columns={lawLinkColumns}
                    dataSource={rule.lawLinks?.filter(l => l.status === 1)}
                    rowKey="id"
                    pagination={false}
                  />
                </>
              ),
            },
            {
              key: 'examples',
              label: '案例',
              children: (
                <>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                    onClick={() => setExampleModalOpen(true)}
                  >
                    添加案例
                  </Button>
                  <Table
                    columns={exampleColumns}
                    dataSource={rule.examples?.filter(e => e.status === 1)}
                    rowKey="id"
                    pagination={false}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="添加关联字段"
        open={fieldLinkModalOpen}
        onCancel={() => {
          setFieldLinkModalOpen(false);
          fieldLinkForm.resetFields();
          setSelectedDocTypeId(null);
        }}
        onOk={handleAddFieldLink}
        confirmLoading={createFieldLinkMutation.isPending}
      >
        <Form form={fieldLinkForm} layout="vertical">
          <Form.Item name="docTypeId" label="文件类型" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="选择文件类型"
              options={docTypes?.map(d => ({ label: `${d.code} - ${d.name}`, value: d.id }))}
              onChange={(v) => setSelectedDocTypeId(v)}
            />
          </Form.Item>
          <Form.Item name="docFieldId" label="字段" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="选择字段"
              options={docFields?.map(f => ({ label: `${f.fieldCode} - ${f.fieldName}`, value: f.id }))}
              disabled={!selectedDocTypeId}
            />
          </Form.Item>
          <Form.Item name="requiredFlag" label="是否必需">
            <Select
              options={[
                { label: '是', value: 1 },
                { label: '否', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加法规依据"
        open={lawLinkModalOpen}
        onCancel={() => {
          setLawLinkModalOpen(false);
          lawLinkForm.resetFields();
          setSelectedLawDocumentId(null);
        }}
        onOk={handleAddLawLink}
        confirmLoading={createLawLinkMutation.isPending}
      >
        <Form form={lawLinkForm} layout="vertical">
          <Form.Item name="lawDocumentId" label="法规" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="选择法规"
              options={lawDocuments?.map(d => ({ label: `${d.lawCode} - ${d.lawName}`, value: d.id }))}
              onChange={(v) => setSelectedLawDocumentId(v)}
            />
          </Form.Item>
          <Form.Item name="lawClauseId" label="条款">
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="选择条款"
              options={lawClauses?.map(c => ({ label: `${c.clauseNo} - ${c.clauseTitle || c.clauseText?.substring(0, 30)}`, value: c.id }))}
              disabled={!selectedLawDocumentId}
            />
          </Form.Item>
          <Form.Item name="referenceDescription" label="引用说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加案例"
        open={exampleModalOpen}
        onCancel={() => {
          setExampleModalOpen(false);
          exampleForm.resetFields();
        }}
        onOk={handleAddExample}
        confirmLoading={createExampleMutation.isPending}
        width={600}
      >
        <Form form={exampleForm} layout="vertical">
          <Form.Item name="exampleName" label="案例名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="background" label="案例背景">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="inputExample" label="输入示例">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="conclusionExample" label="审计结论">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="experience" label="经验说明">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


