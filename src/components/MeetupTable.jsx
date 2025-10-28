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
import MemberAutoComplete from './MemberAutoComplete';
import AttendeeManager from './AttendeeManager';
import MeetupFormModal from './MeetupModal';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const MeetupTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeetup, setEditingMeetup] = useState(null);
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [isEditingAll, setIsEditingAll] = useState(false);
  const [tempAttendees, setTempAttendees] = useState([]);
  const [editAllForm] = Form.useForm();
  const { events, addEvent, updateEvent } = useEvents();

  // 선택된 모임이 변경될 때 상세 정보로 스크롤 이동
  useEffect(() => {
    if (selectedMeetup) {
      setTimeout(() => {
        const detailCard = document.querySelector('[data-meetup-detail]');
        if (detailCard) {
          detailCard.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }, [selectedMeetup]);

  const handleAdd = () => {
    setEditingMeetup(null);
    setIsModalVisible(true);
  };

  const handleModalOk = async values => {
    try {
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
        // 선택된 모임이 수정된 경우 상세 정보도 업데이트
        if (selectedMeetup && selectedMeetup.id === editingMeetup.id) {
          setSelectedMeetup({
            ...selectedMeetup,
            resource: {
              ...selectedMeetup.resource,
              ...meetupData,
            },
          });
        }
      } else {
        await addEvent(meetupData);
      }

      setIsModalVisible(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMeetup(null);
  };

  const handleEditAll = () => {
    setIsEditingAll(true);
    // 현재 선택된 모임의 데이터로 폼 초기화
    const meetupData = selectedMeetup.resource;
    editAllForm.setFieldsValue({
      title: meetupData.title,
      date: meetupData.date ? dayjs(meetupData.date) : null,
      start_time: meetupData.start_time
        ? dayjs(meetupData.start_time, 'HH:mm:ss')
        : null,
      leader_nickname: meetupData.leader_nickname,
      type: meetupData.type,
      level: meetupData.level,
      status: meetupData.status,
      course: meetupData.course,
      cancel_reason: meetupData.cancel_reason,
      review: meetupData.review,
    });
    // 참가자 데이터도 임시 상태로 복사
    setTempAttendees([...(meetupData.attendees || [])]);
  };

  const handleSaveAll = async () => {
    try {
      const values = await editAllForm.validateFields();

      const meetupData = {
        title: values.title,
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
        start_time: values.start_time
          ? values.start_time.format('HH:mm:ss')
          : null,
        leader_nickname: values.leader_nickname,
        type: values.type,
        level: values.level,
        status: values.status,
        course: values.course,
        cancel_reason: values.cancel_reason,
        review: values.review,
        attendees: tempAttendees,
      };

      await updateEvent(selectedMeetup.id, meetupData);

      // 선택된 모임 정보 업데이트
      setSelectedMeetup({
        ...selectedMeetup,
        resource: {
          ...selectedMeetup.resource,
          ...meetupData,
        },
      });

      setIsEditingAll(false);
      editAllForm.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancelAll = () => {
    setIsEditingAll(false);
    editAllForm.resetFields();
    setTempAttendees([]);
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
      render: date => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) =>
        dayjs(a.resource.date).valueOf() - dayjs(b.resource.date).valueOf(),
      defaultSortOrder: 'ascending',
    },
    {
      title: '시간',
      dataIndex: ['resource', 'start_time'],
      key: 'start_time',
      width: 100,
      render: time => {
        if (!time) return '-';
        // HH:mm:ss 형식을 HH:mm으로 변환
        return time.substring(0, 5);
      },
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
          pageSize: 5,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}개`,
        }}
      />

      {selectedMeetup && (
        <Card
          data-meetup-detail
          title={
            <Space>
              <TeamOutlined />
              선택된 모임 상세 정보
            </Space>
          }
          style={{ marginTop: '24px' }}
          extra={
            <Space>
              {isEditingAll ? (
                <>
                  <Button type="primary" onClick={handleSaveAll}>
                    저장
                  </Button>
                  <Button onClick={handleCancelAll}>취소</Button>
                </>
              ) : (
                <Button onClick={handleEditAll}>수정</Button>
              )}
              <Button onClick={() => setSelectedMeetup(null)}>닫기</Button>
            </Space>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="제목" span={2}>
                  {isEditingAll ? (
                    <Form
                      form={editAllForm}
                      layout="inline"
                      style={{ width: '100%' }}
                    >
                      <Form.Item
                        name="title"
                        rules={[
                          { required: true, message: '제목을 입력해주세요' },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Input />
                      </Form.Item>
                    </Form>
                  ) : (
                    <span>{selectedMeetup.resource.title}</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="날짜">
                  <Space>
                    <CalendarOutlined />
                    {isEditingAll ? (
                      <Form form={editAllForm} layout="inline">
                        <Form.Item
                          name="date"
                          rules={[
                            { required: true, message: '날짜를 선택해주세요' },
                          ]}
                        >
                          <DatePicker />
                        </Form.Item>
                      </Form>
                    ) : (
                      <span>
                        {dayjs(selectedMeetup.resource.date).format(
                          'YYYY-MM-DD'
                        )}
                      </span>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="시간">
                  <Space>
                    <ClockCircleOutlined />
                    {isEditingAll ? (
                      <Form form={editAllForm} layout="inline">
                        <Form.Item name="start_time">
                          <TimePicker
                            format="HH:mm"
                            minuteStep={5}
                            inputReadOnly
                          />
                        </Form.Item>
                      </Form>
                    ) : (
                      <span>
                        {selectedMeetup.resource.start_time
                          ? selectedMeetup.resource.start_time.substring(0, 5)
                          : '미정'}
                      </span>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="리딩자">
                  <Space>
                    <UserOutlined />
                    {isEditingAll ? (
                      <Form form={editAllForm} layout="inline">
                        <Form.Item
                          name="leader_nickname"
                          rules={[
                            {
                              required: true,
                              message: '리딩자를 입력해주세요',
                            },
                          ]}
                        >
                          <MemberAutoComplete
                            placeholder="리딩자 닉네임을 입력하세요"
                            style={{ width: 200 }}
                          />
                        </Form.Item>
                      </Form>
                    ) : (
                      <span>{selectedMeetup.resource.leader_nickname}</span>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="활동 유형">
                  {isEditingAll ? (
                    <Form form={editAllForm} layout="inline">
                      <Form.Item
                        name="type"
                        rules={[
                          {
                            required: true,
                            message: '활동 유형을 선택해주세요',
                          },
                        ]}
                      >
                        <Select style={{ width: 120 }}>
                          <Option value="등산">등산</Option>
                          <Option value="산책">산책</Option>
                          <Option value="러닝">러닝</Option>
                          <Option value="기타">기타</Option>
                        </Select>
                      </Form.Item>
                    </Form>
                  ) : (
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
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="난이도">
                  {isEditingAll ? (
                    <Form form={editAllForm} layout="inline">
                      <Form.Item name="level">
                        <Select
                          placeholder="난이도를 선택하세요"
                          style={{ width: 120 }}
                        >
                          <Option value="초급">초급</Option>
                          <Option value="중급">중급</Option>
                          <Option value="고급">고급</Option>
                        </Select>
                      </Form.Item>
                    </Form>
                  ) : (
                    <span>{selectedMeetup.resource.level || '-'}</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="상태">
                  {isEditingAll ? (
                    <Form form={editAllForm} layout="inline">
                      <Form.Item name="status">
                        <Select style={{ width: 120 }}>
                          <Option value="진행 전">진행 전</Option>
                          <Option value="완료">완료</Option>
                          <Option value="취소">취소</Option>
                        </Select>
                      </Form.Item>
                    </Form>
                  ) : (
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
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="설명" span={2}>
                  {isEditingAll ? (
                    <Form form={editAllForm} layout="vertical">
                      <Form.Item name="course">
                        <Input placeholder="설명을 입력하세요" />
                      </Form.Item>
                    </Form>
                  ) : (
                    <span>{selectedMeetup.resource.course || '-'}</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="취소 사유" span={2}>
                  {isEditingAll ? (
                    <Form form={editAllForm} layout="vertical">
                      <Form.Item name="cancel_reason">
                        <TextArea
                          placeholder="취소 사유를 입력하세요"
                          rows={3}
                        />
                      </Form.Item>
                    </Form>
                  ) : (
                    <span>{selectedMeetup.resource.cancel_reason || '-'}</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="소감" span={2}>
                  {isEditingAll ? (
                    <Form form={editAllForm} layout="vertical">
                      <Form.Item name="review">
                        <TextArea
                          placeholder="모임 소감을 입력하세요"
                          rows={4}
                        />
                      </Form.Item>
                    </Form>
                  ) : (
                    <span>{selectedMeetup.resource.review || '-'}</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <TeamOutlined />
                    참가자 (
                    {isEditingAll
                      ? tempAttendees.length
                      : selectedMeetup.resource.attendees?.length || 0}
                    명)
                  </Space>
                }
                size="small"
              >
                {isEditingAll ? (
                  <AttendeeManager
                    attendees={tempAttendees}
                    onAttendeesChange={setTempAttendees}
                    disabled={false}
                  />
                ) : selectedMeetup.resource.attendees &&
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

      <MeetupFormModal
        isVisible={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        editingEvent={editingMeetup}
        title={editingMeetup ? '모임 수정' : '모임 추가'}
        showDeleteButton={false}
        showAttendeeManager={false}
        showLevelField={true}
        showStatusFields={true}
      />
    </div>
  );
};

export default MeetupTable;
