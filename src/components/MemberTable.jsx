import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMembers } from '../hooks/useMembers';

const { Option } = Select;

const MemberTable = () => {
  const { members, loading, addMember, updateMember, deleteMember } = useMembers();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '전화번호',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: '가입일',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '액션',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            수정
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setEditingMember(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '회원 삭제',
      content: `${record.name} 회원을 삭제하시겠습니까?`,
      onOk: () => deleteMember(record.id),
    });
  };

  const handleAdd = () => {
    setEditingMember(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingMember) {
        await updateMember(editingMember.id, values);
      } else {
        await addMember(values);
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px' 
      }}>
        <h2 style={{ margin: 0 }}>회원 관리</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          회원 추가
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={members}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} / 총 ${total}개`,
        }}
        scroll={{ x: 800 }}
        bordered
      />

      <Modal
        title={editingMember ? '회원 수정' : '회원 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '이름을 입력해주세요' }]}
          >
            <Input placeholder="이름을 입력하세요" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력해주세요' },
              { type: 'email', message: '올바른 이메일 형식을 입력해주세요' }
            ]}
          >
            <Input placeholder="이메일을 입력하세요" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="전화번호"
            rules={[{ required: true, message: '전화번호를 입력해주세요' }]}
          >
            <Input placeholder="전화번호를 입력하세요" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="상태"
            rules={[{ required: true, message: '상태를 선택해주세요' }]}
          >
            <Select placeholder="상태를 선택하세요">
              <Option value="active">활성</Option>
              <Option value="inactive">비활성</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberTable;
