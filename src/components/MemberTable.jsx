import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMembers } from '../hooks/useMembers';

const { Option } = Select;

const MemberTable = () => {
  const { members, loading, addMember, updateMember } = useMembers();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 검색 필터링된 데이터
  const filteredMembers = (() => {
    if (!searchText.trim()) {
      return members;
    }

    const searchLower = searchText.toLowerCase();
    return members.filter(member => {
      return (
        (member.name && member.name.toLowerCase().includes(searchLower)) ||
        (member.nickname &&
          member.nickname.toLowerCase().includes(searchLower)) ||
        (member.baby_name &&
          member.baby_name.toLowerCase().includes(searchLower)) ||
        (member.region && member.region.toLowerCase().includes(searchLower)) ||
        (member.naver_id && member.naver_id.toLowerCase().includes(searchLower))
      );
    });
  })();

  const handleEdit = record => {
    setEditingMember(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // 모든 컬럼 정의
  const allColumns = [
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
      title: '닉네임',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 200,
    },
    {
      title: '아기이름',
      dataIndex: 'baby_name',
      key: 'baby_name',
      width: 120,
    },
    {
      title: '지역',
      dataIndex: 'region',
      key: 'region',
      width: 120,
    },
    {
      title: 'Naver ID',
      dataIndex: 'naver_id',
      key: 'naver_id',
      width: 150,
    },
    {
      title: '가입일',
      dataIndex: 'joined_at',
      key: 'joined_at',
      width: 120,
      render: date => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: '액션',
      key: 'action',
      width: 100,
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
        </Space>
      ),
    },
  ];

  // 모바일에서는 '이름', '닉네임', '액션'만 표시
  const columns = isMobile
    ? allColumns.filter(
        col =>
          col.key === 'name' || col.key === 'nickname' || col.key === 'action'
      )
    : allColumns;

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
    <div className="table-container">
      <div className="table-header">
        <h2>회원 관리</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          회원 추가
        </Button>
      </div>

      <div className="search-container">
        <Input
          placeholder="이름, 닉네임, 아기이름, 지역, Naver ID로 검색..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredMembers}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / 총 ${total}개`,
        }}
        scroll={isMobile ? { x: 400 } : { x: 800 }}
        bordered
        size="small"
      />

      <Modal
        title={editingMember ? '회원 수정' : '회원 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '이름을 입력해주세요' }]}
          >
            <Input placeholder="이름을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="nickname"
            label="닉네임"
            rules={[{ required: true, message: '닉네임을 입력해주세요' }]}
          >
            <Input placeholder="닉네임을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="baby_name"
            label="아기이름"
            rules={[{ required: true, message: '아기이름을 입력해주세요' }]}
          >
            <Input placeholder="아기이름을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="region"
            label="지역"
            rules={[{ required: true, message: '지역을 입력해주세요' }]}
          >
            <Input placeholder="지역을 입력하세요" />
          </Form.Item>

          <Form.Item name="naver_id" label="Naver ID">
            <Input placeholder="Naver ID를 입력하세요 (선택사항)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberTable;
