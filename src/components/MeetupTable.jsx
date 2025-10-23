import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Card,
  Descriptions,
  List,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useEvents } from '../hooks/useEvents';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const MeetupTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeetup, setEditingMeetup] = useState(null);
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [form] = Form.useForm();
  const { events, addEvent, updateEvent } = useEvents();

  // // 선택된 모임이 변경될 때 스크롤을 페이지 상단으로 이동
  // useEffect(() => {
  //   if (selectedMeetup) {
  //     setTimeout(() => {
  //       window.scrollTo({
  //         top: 0,
  //         behavior: 'smooth',
  //         block: 'nearest',
  //       });
  //     }, 100);
  //   }
  // }, [selectedMeetup]);

  const handleAdd = () => {
    setEditingMeetup(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const meetupData = {
        date: values.date.format('YYYY-MM-DD'),
        start_time: values.start_time
          ? values.start_time.format('HH:mm:ss')
          : null,
        title: values.title,
        leader_member_id: values.leader_id,
        leader_nickname: values.leader_nickname,
        course: values.course || null,
        type: values.type,
        level: values.level || null,
        status: values.status,
        cancel_reason: values.cancel_reason || null,
        review: values.review || null,
        attendees: values.attendees || [],
      };

      if (editingMeetup) {
        await updateEvent(editingMeetup.id, meetupData);
      } else {
        await addEvent(meetupData);
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

  const columns = [
    {
      title: '제목',
      dataIndex: ['resource', 'title'],
      key: 'title',
      width: 200,
    },
    {
      title: '날짜',
      dataIndex: ['resource', 'date'],
      key: 'date',
      width: 120,
      render: date => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: '시간',
      dataIndex: ['resource', 'start_time'],
      key: 'start_time',
      width: 100,
      render: time => time || '-',
    },
    {
      title: '리딩자',
      dataIndex: ['resource', 'leader_nickname'],
      key: 'leader_nickname',
      width: 100,
    },
    {
      title: '활동 유형',
      dataIndex: ['resource', 'type'],
      key: 'type',
      width: 100,
      render: type => (
        <Tag
          color={
            type === '등산'
              ? 'blue'
              : type === '산책'
                ? 'green'
                : type === '러닝'
                  ? 'orange'
                  : 'default'
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: '난이도',
      dataIndex: ['resource', 'level'],
      key: 'level',
      width: 80,
      render: level => level || '-',
    },
    {
      title: '상태',
      dataIndex: ['resource', 'status'],
      key: 'status',
      width: 100,
      render: status => (
        <Tag
          color={
            status === '완료' ? 'green' : status === '취소' ? 'red' : 'blue'
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: '참가자 수',
      key: 'attendees_count',
      width: 100,
      render: (_, record) => record.resource.attendees?.length || 0,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2>모임 관리</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          모임 추가
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        onRow={record => ({
          onClick: () => setSelectedMeetup(record),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}개`,
        }}
        // scroll={{ x: 1200, y: 400 }}
      />

      {selectedMeetup && (
        <Card
          title={
            <Space>
              <TeamOutlined />
              선택된 모임 상세 정보
            </Space>
          }
          style={{ marginTop: '24px' }}
          extra={<Button onClick={() => setSelectedMeetup(null)}>닫기</Button>}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="제목" span={2}>
                  {selectedMeetup.resource.title}
                </Descriptions.Item>
                <Descriptions.Item label="날짜">
                  <Space>
                    <CalendarOutlined />
                    {moment(selectedMeetup.resource.date).format('YYYY-MM-DD')}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="시간">
                  <Space>
                    <ClockCircleOutlined />
                    {selectedMeetup.resource.start_time || '미정'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="리딩자">
                  <Space>
                    <UserOutlined />
                    {selectedMeetup.resource.leader_nickname}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="활동 유형">
                  <Tag
                    color={
                      selectedMeetup.resource.type === '등산'
                        ? 'blue'
                        : selectedMeetup.resource.type === '산책'
                          ? 'green'
                          : selectedMeetup.resource.type === '러닝'
                            ? 'orange'
                            : 'default'
                    }
                  >
                    {selectedMeetup.resource.type}
                  </Tag>
                </Descriptions.Item>
                {selectedMeetup.resource.level && (
                  <Descriptions.Item label="난이도">
                    {selectedMeetup.resource.level}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="상태">
                  <Tag
                    color={
                      selectedMeetup.resource.status === '완료'
                        ? 'green'
                        : selectedMeetup.resource.status === '취소'
                          ? 'red'
                          : 'blue'
                    }
                  >
                    {selectedMeetup.resource.status}
                  </Tag>
                </Descriptions.Item>
                {selectedMeetup.resource.course && (
                  <Descriptions.Item label="설명" span={2}>
                    {selectedMeetup.resource.course}
                  </Descriptions.Item>
                )}
                {selectedMeetup.resource.cancel_reason && (
                  <Descriptions.Item label="취소 사유" span={2}>
                    {selectedMeetup.resource.cancel_reason}
                  </Descriptions.Item>
                )}
                {selectedMeetup.resource.review && (
                  <Descriptions.Item label="소감" span={2}>
                    {selectedMeetup.resource.review}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <TeamOutlined />
                    참가자 ({selectedMeetup.resource.attendees?.length || 0}명)
                  </Space>
                }
                size="small"
              >
                {selectedMeetup.resource.attendees &&
                selectedMeetup.resource.attendees.length > 0 ? (
                  <List
                    dataSource={selectedMeetup.resource.attendees}
                    renderItem={attendee => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={attendee.nickname}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">참가자가 없습니다.</Text>
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      <Modal
        title={editingMeetup ? '모임 수정' : '모임 추가'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="저장"
        cancelText="취소"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: '진행 전',
          }}
        >
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: '제목을 입력해주세요' }]}
          >
            <Input placeholder="제목을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="leader_nickname"
            label="리딩자"
            rules={[{ required: true, message: '모임 리딩자를 입력해주세요' }]}
          >
            <Input placeholder="리딩자 닉네임을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="date"
            label="날짜"
            rules={[{ required: true, message: '날짜를 선택해주세요' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="start_time" label="시간">
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item name="course" label="설명">
            <Input placeholder="설명을 입력하세요(선택사항)" />
          </Form.Item>

          <Form.Item
            name="type"
            label="활동 유형"
            rules={[{ required: true, message: '활동 유형을 선택해주세요' }]}
          >
            <Select placeholder="활동 유형을 선택하세요">
              <Option value="등산">등산</Option>
              <Option value="산책">산책</Option>
              <Option value="러닝">러닝</Option>
              <Option value="기타">기타</Option>
            </Select>
          </Form.Item>

          <Form.Item name="level" label="난이도">
            <Select placeholder="난이도를 선택하세요">
              <Option value="초급">초급</Option>
              <Option value="중급">중급</Option>
              <Option value="고급">고급</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="모임 진행 상태">
            <Select>
              <Option value="진행 전">진행 전</Option>
              <Option value="완료">완료</Option>
              <Option value="취소">취소</Option>
            </Select>
          </Form.Item>

          <Form.Item name="cancel_reason" label="취소 사유">
            <TextArea placeholder="취소 사유를 입력하세요" rows={3} />
          </Form.Item>

          <Form.Item name="review" label="소감">
            <TextArea placeholder="모임 소감을 입력하세요" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MeetupTable;
