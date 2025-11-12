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
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { useEvents } from '../hooks/useEvents';
import { useMembers } from '../hooks/useMembers';
import MemberAutoComplete from './MemberAutoComplete';
import AttendeeManager from './AttendeeManager';
import MeetupFormModal from './MeetupModal';
import {
  MEETUP_TYPE_OPTIONS,
  MEETUP_LEVEL_OPTIONS,
  getTypeColor,
} from '../utils/meetupTypes';
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
  const [tempSubLeaders, setTempSubLeaders] = useState([]); // memberId 배열
  const [editAllForm] = Form.useForm();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { members } = useMembers();

  // 검색 상태 관리
  const [searchFilters, setSearchFilters] = useState({
    title: '',
    leader: '',
    type: [],
    level: [],
    status: [],
    dateRange: null,
  });
  const [filteredEvents, setFilteredEvents] = useState(events);

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

  // 검색 필터링 로직
  useEffect(() => {
    let filtered = events;

    if (searchFilters.title) {
      filtered = filtered.filter(
        event =>
          event.resource.title &&
          event.resource.title
            .toLowerCase()
            .includes(searchFilters.title.toLowerCase())
      );
    }

    if (searchFilters.leader) {
      filtered = filtered.filter(
        event =>
          event.resource.leader_nickname &&
          event.resource.leader_nickname
            .toLowerCase()
            .includes(searchFilters.leader.toLowerCase())
      );
    }

    if (searchFilters.type && searchFilters.type.length > 0) {
      filtered = filtered.filter(event =>
        searchFilters.type.includes(event.resource.type)
      );
    }

    if (searchFilters.level && searchFilters.level.length > 0) {
      filtered = filtered.filter(event =>
        searchFilters.level.includes(event.resource.level)
      );
    }

    if (searchFilters.status && searchFilters.status.length > 0) {
      filtered = filtered.filter(event =>
        searchFilters.status.includes(event.resource.status)
      );
    }

    if (searchFilters.dateRange && searchFilters.dateRange.length === 2) {
      const [startDate, endDate] = searchFilters.dateRange;
      filtered = filtered.filter(event => {
        const eventDate = dayjs(event.resource.date);
        return (
          eventDate.isAfter(startDate.subtract(1, 'day')) &&
          eventDate.isBefore(endDate.add(1, 'day'))
        );
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchFilters]);

  // 검색 핸들러 함수들
  const handleSearchChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearSearch = () => {
    setSearchFilters({
      title: '',
      leader: '',
      type: [],
      level: [],
      status: [],
      dateRange: null,
    });
  };

  const handleAdd = () => {
    setEditingMeetup(null);
    setIsModalVisible(true);
  };

  const handleModalOk = async values => {
    try {
      const attendees = values.attendees || [];
      const meetupData = {
        date: values.date.format('YYYY-MM-DD'),
        start_time: values.start_time
          ? values.start_time.format('HH:mm:ss')
          : null,
        title: values.title,
        leader_member_id: values.leader_id,
        leader_nickname: values.leader_nickname,
        sub_leader_member_ids: (values.sub_leader_member_ids || []).map(id =>
          typeof id === 'string' ? Number(id) : id
        ),
        course: values.course || null,
        type: values.type,
        level: values.level || null,
        status: values.status,
        cancel_reason: values.cancel_reason || null,
        review: values.review || null,
        attendees, // 참석자 정보는 별도로 처리하기 위해 전달
      };

      if (editingMeetup) {
        await updateEvent(editingMeetup.id, meetupData);
        // 참석자는 useEvents에서 자동으로 처리됨

        // 선택된 모임이 수정된 경우 상세 정보도 업데이트
        if (selectedMeetup && selectedMeetup.id === editingMeetup.id) {
          setSelectedMeetup({
            ...selectedMeetup,
            resource: {
              ...selectedMeetup.resource,
              ...meetupData,
              attendees,
            },
          });
        }
      } else {
        // 일정 추가 (참석자는 useEvents에서 자동으로 처리됨)
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
    setTempSubLeaders([...(meetupData.sub_leader_member_ids || [])]);
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
        sub_leader_member_ids: tempSubLeaders,
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
    setTempSubLeaders([]);
  };

  const handleDelete = async () => {
    if (!selectedMeetup) return;

    Modal.confirm({
      title: '모임 삭제',
      content: '정말로 이 모임을 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteEvent(selectedMeetup.id);
          setSelectedMeetup(null);
        } catch (error) {
          console.error('Error deleting meetup:', error);
        }
      },
    });
  };

  const handleRowClick = record => {
    // 수정 중인 경우 확인 팝업 표시
    if (isEditingAll) {
      Modal.confirm({
        title: '수정 중단',
        content: '현재 수정 중입니다. 다른 모임을 선택하시겠습니까?',
        okText: '예',
        cancelText: '아니오',
        onOk: () => {
          // 수정 모드 종료
          setIsEditingAll(false);
          editAllForm.resetFields();
          setTempAttendees([]);
          // 새로운 모임 선택
          setSelectedMeetup(record);
        },
      });
    } else {
      // 수정 중이 아닌 경우 바로 선택
      setSelectedMeetup(record);
    }
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
      render: type => <Tag color={getTypeColor(type)}>{type}</Tag>,
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
    <div className="table-container">
      <div className="table-header">
        <h2>모임 관리</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          모임 추가
        </Button>
      </div>

      {/* 검색 필터 영역 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6} md={4} lg={3}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              제목 검색
            </Text>
          </Col>
          <Col xs={24} sm={18} md={20} lg={21}>
            <Input
              placeholder="제목을 입력하세요"
              value={searchFilters.title}
              onChange={e => handleSearchChange('title', e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={6} md={4} lg={3}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              리딩자 검색
            </Text>
          </Col>
          <Col xs={24} sm={18} md={20} lg={21}>
            <Input
              placeholder="리딩자를 입력하세요"
              value={searchFilters.leader}
              onChange={e => handleSearchChange('leader', e.target.value)}
              prefix={<UserOutlined />}
              allowClear
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={6} md={4} lg={3}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              날짜 범위
            </Text>
          </Col>
          <Col xs={24} sm={18} md={20} lg={21}>
            <DatePicker.RangePicker
              placeholder={['시작일', '종료일']}
              value={searchFilters.dateRange}
              onChange={dates => handleSearchChange('dateRange', dates)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={6} md={4} lg={3}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              활동 유형
            </Text>
          </Col>
          <Col xs={24} sm={18} md={20} lg={21}>
            <Checkbox.Group
              value={searchFilters.type}
              onChange={value => handleSearchChange('type', value)}
              style={{ width: '100%' }}
            >
              <Space direction="horizontal" size="small" wrap>
                {MEETUP_TYPE_OPTIONS.map(option => (
                  <Checkbox key={option.value} value={option.value}>
                    {option.label}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={6} md={4} lg={3}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              난이도
            </Text>
          </Col>
          <Col xs={24} sm={18} md={20} lg={21}>
            <Checkbox.Group
              value={searchFilters.level}
              onChange={value => handleSearchChange('level', value)}
              style={{ width: '100%' }}
            >
              <Space direction="horizontal" size="small" wrap>
                {MEETUP_LEVEL_OPTIONS.map(option => (
                  <Checkbox key={option.value} value={option.value}>
                    {option.label}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={6} md={4} lg={3}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              상태
            </Text>
          </Col>
          <Col xs={24} sm={18} md={20} lg={21}>
            <Checkbox.Group
              value={searchFilters.status}
              onChange={value => handleSearchChange('status', value)}
              style={{ width: '100%' }}
            >
              <Space direction="horizontal" size="small" wrap>
                <Checkbox value="진행 전">진행 전</Checkbox>
                <Checkbox value="완료">완료</Checkbox>
                <Checkbox value="취소">취소</Checkbox>
              </Space>
            </Checkbox.Group>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={18} md={20} lg={21}>
            <Space>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearSearch}
                type="default"
              >
                검색 초기화
              </Button>
              <Text type="secondary">{filteredEvents.length}개</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredEvents}
        rowKey="id"
        onRow={record => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
        pagination={{
          pageSize: 5,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}개`,
        }}
        scroll={{ x: 600 }}
        size="small"
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
              <Button danger onClick={handleDelete}>
                삭제
              </Button>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Descriptions
                column={1}
                bordered
                size="small"
                className="meetup-descriptions"
              >
                <Descriptions.Item label="제목" span={1}>
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
                <Descriptions.Item label="서브 리딩자">
                  {isEditingAll ? (
                    <AttendeeManager
                      attendees={tempSubLeaders}
                      onAttendeesChange={setTempSubLeaders}
                      disabled={false}
                      storeAsIds={true}
                    />
                  ) : selectedMeetup.resource.sub_leader_member_ids &&
                    selectedMeetup.resource.sub_leader_member_ids.length > 0 ? (
                    <Space wrap>
                      {selectedMeetup.resource.sub_leader_member_ids.map(id => (
                        <Tag key={id}>
                          {members.find(m => m.id === id)?.nickname || `#${id}`}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <span>-</span>
                  )}
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
                          {MEETUP_TYPE_OPTIONS.map(option => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Form>
                  ) : (
                    <Tag color={getTypeColor(selectedMeetup.resource.type)}>
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
                          {MEETUP_LEVEL_OPTIONS.map(option => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
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
                <Descriptions.Item label="설명" span={1}>
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
                <Descriptions.Item label="취소 사유" span={1}>
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
                <Descriptions.Item label="소감" span={1}>
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
