import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  InputNumber,
  Space,
  AutoComplete,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { useMembers } from '../hooks/useMembers';

const { Option } = Select;
const { TextArea } = Input;

const MeetupModal = ({ isVisible, onCancel, onOk, editingEvent, onDelete }) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [leaderOptions, setLeaderOptions] = useState([]);
  const [attendeeOptions, setAttendeeOptions] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [attendeeInputValue, setAttendeeInputValue] = useState('');
  const { members } = useMembers();

  // nickname으로 member id를 찾는 함수
  const findMemberIdByNickname = nickname => {
    const matchingMembers = members.filter(
      m => m.nickname && m.nickname.includes(nickname)
    );
    return matchingMembers.length > 0 ? matchingMembers[0].id : null;
  };

  // 자동완성을 위한 옵션 생성 함수
  const getLeaderOptions = nickname => {
    if (!nickname || nickname.length < 1) {
      setLeaderOptions([]);
      return;
    }

    const matchingMembers = members.filter(
      m => m.nickname && m.nickname.includes(nickname)
    );

    const options = matchingMembers.map(member => ({
      value: member.nickname,
      label: member.nickname,
      memberId: member.id,
    }));

    setLeaderOptions(options);
  };

  // 참가자 자동완성을 위한 옵션 생성 함수
  const getAttendeeOptions = nickname => {
    if (!nickname || nickname.length < 1) {
      setAttendeeOptions([]);
      return;
    }

    const matchingMembers = members.filter(
      m => m.nickname && m.nickname.includes(nickname)
    );

    const options = matchingMembers.map(member => ({
      value: member.nickname,
      label: member.nickname,
      memberId: member.id,
    }));

    setAttendeeOptions(options);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values);

      // 폼 값 초기화
      form.resetFields();
      setSelectedType(null);
      setSelectedStatus(null);
      setLeaderOptions([]);
      setAttendeeOptions([]);
      setSelectedAttendees([]);
      setAttendeeInputValue('');
    } catch (error) {
      console.error('Error saving meetup:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedType(null);
    setSelectedStatus(null);
    setSelectedAttendees([]);
    setAttendeeInputValue('');
    onCancel();
  };

  // editingEvent가 변경될 때 폼 데이터 설정
  useEffect(() => {
    if (editingEvent) {
      const meetup = editingEvent.resource;
      form.setFieldsValue({
        date: moment(meetup.date),
        start_time: meetup.start_time
          ? moment(meetup.start_time, 'HH:mm:ss')
          : null,
        title: meetup.title,
        leader_nickname: meetup.leader_nickname,
        leader_id: meetup.leader_id,
        course: meetup.course,
        type: meetup.type,
        level: meetup.level,
        status: meetup.status,
        cancel_reason: meetup.cancel_reason,
        total_donation: meetup.total_donation,
        attendees: meetup.attendees || [],
        review: meetup.review,
      });
      setSelectedType(meetup.type);
      setSelectedStatus(meetup.status);
      setSelectedAttendees(meetup.attendees || []);
    } else {
      // 새 이벤트 생성 시 기본값 설정
      form.setFieldsValue({
        date: moment(),
        start_time: moment('09:00', 'HH:mm'),
        status: 'pending',
        total_donation: 0,
      });
      setSelectedType(null);
      setSelectedStatus('pending');
    }
  }, [editingEvent, form]);

  return (
    <Modal
      title={editingEvent ? '일정 수정' : '일정 추가'}
      open={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText="저장"
      cancelText="취소"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: '진행 전',
          total_donation: 0,
        }}
        onValuesChange={changedValues => {
          // eslint-disable-next-line no-prototype-builtins
          if (changedValues.hasOwnProperty('status')) {
            console.log('status changed:', changedValues.status);
            setSelectedStatus(changedValues.status);
          }
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
          <AutoComplete
            options={leaderOptions}
            placeholder="리딩자 닉네임을 입력하세요"
            onSearch={getLeaderOptions}
            onSelect={(value, option) => {
              form.setFieldValue('leader_id', option.memberId);
            }}
            filterOption={false}
            notFoundContent="일치하는 회원이 없습니다"
          >
            <Input
              onChange={e => {
                const nickname = e.target.value;
                const memberId = findMemberIdByNickname(nickname);
                if (memberId) {
                  // 폼에 leader_id 필드도 설정
                  form.setFieldValue('leader_id', memberId);
                } else if (nickname) {
                  console.warn('Member not found for nickname:', nickname);
                  form.setFieldValue('leader_id', null);
                }
              }}
            />
          </AutoComplete>
        </Form.Item>

        {/* leader_id를 values에 포함시키기 위한 hidden 필드 */}
        <Form.Item name="leader_id" style={{ display: 'none' }}>
          <Input type="hidden" />
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
          <Select
            placeholder="활동 유형을 선택하세요"
            onChange={value => setSelectedType(value)}
          >
            <Option value="등산">등산</Option>
            <Option value="산책">산책</Option>
            <Option value="러닝">러닝</Option>
            <Option value="기타">기타</Option>
          </Select>
        </Form.Item>

        {/* 등산일 때만 난이도 표시 */}
        {selectedType === '등산' && (
          <Form.Item
            name="level"
            label="난이도"
            rules={[{ required: true, message: '난이도를 선택해주세요' }]}
          >
            <Select placeholder="난이도를 선택하세요">
              <Option value="초급">초급</Option>
              <Option value="중급">중급</Option>
              <Option value="고급">고급</Option>
            </Select>
          </Form.Item>
        )}

        {/* 일정 완료 관련 필드들 */}
        <Form.Item name="status" label="모임 진행 상태">
          <Select>
            <Option value="진행 전">진행 전</Option>
            <Option value="완료">완료</Option>
            <Option value="취소">취소</Option>
          </Select>
        </Form.Item>

        {selectedStatus === '취소' && (
          <Form.Item name="cancel_reason" label="취소 사유">
            <TextArea placeholder="취소 사유를 입력하세요" rows={3} />
          </Form.Item>
        )}

        {selectedStatus === '완료' && (
          <>
            <Form.Item label="참가자 명단">
              <AutoComplete
                value={attendeeInputValue}
                options={attendeeOptions}
                onSearch={value => {
                  setAttendeeInputValue(value);
                  getAttendeeOptions(value);
                }}
                onSelect={(value, option) => {
                  console.log('value', value);
                  const currentAttendees =
                    form.getFieldValue('attendees') || [];

                  // 중복 참가자 체크
                  const isDuplicate = currentAttendees.some(
                    attendee => attendee.memberId === option.memberId
                  );

                  if (!isDuplicate) {
                    const newAttendees = [
                      ...currentAttendees,
                      {
                        nickname: value,
                        memberId: option.memberId,
                      },
                    ];
                    console.log('currentAttendees', currentAttendees);
                    console.log('newAttendees', newAttendees);
                    form.setFieldValue('attendees', newAttendees);
                    setSelectedAttendees(newAttendees);
                  }

                  // 입력 필드 초기화
                  setAttendeeInputValue('');
                  setAttendeeOptions([]);
                }}
                filterOption={false}
                notFoundContent="일치하는 회원이 없습니다"
              >
                <Input placeholder="참가자 닉네임을 입력하세요" />
              </AutoComplete>
            </Form.Item>

            {/* 숨겨진 attendees 필드 */}
            <Form.Item name="attendees" style={{ display: 'none' }}>
              <Input type="hidden" />
            </Form.Item>

            {/* 선택된 참가자 리스트 표시 */}
            {selectedAttendees.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                  }}
                >
                  선택된 참가자:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedAttendees.map((attendee, index) => (
                    <div
                      key={index}
                      style={{
                        background: '#f0f0f0',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{attendee.nickname}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newAttendees = selectedAttendees.filter(
                            (_, i) => i !== index
                          );
                          setSelectedAttendees(newAttendees);
                          form.setFieldValue('attendees', newAttendees);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#999',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Form.Item name="review" label="소감">
              <TextArea placeholder="모임 소감을 입력하세요" rows={4} />
            </Form.Item>
          </>
        )}
      </Form>

      {editingEvent && (
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Button
            danger
            onClick={() => {
              Modal.confirm({
                title: '일정 삭제',
                content: '일정을 삭제하시겠습니까?',
                okText: '삭제',
                cancelText: '취소',
                onOk: () => {
                  onDelete(editingEvent.id);
                  handleCancel();
                },
              });
            }}
          >
            삭제
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default MeetupModal;
