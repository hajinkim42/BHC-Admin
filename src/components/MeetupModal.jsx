import { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
} from 'antd';
import dayjs from 'dayjs';
import { useMembers } from '../hooks/useMembers';
import MemberAutoComplete from './MemberAutoComplete';
import AttendeeManager from './AttendeeManager';

const { Option } = Select;
const { TextArea } = Input;

const MeetupFormModal = ({
  isVisible,
  onCancel,
  onOk,
  editingEvent,
  onDelete,
  title = null,
  showDeleteButton = true,
  showAttendeeManager = true,
  showLevelField = true,
  showStatusFields = true,
  selectedDate = null,
}) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const { members } = useMembers();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values);

      // 폼 값 초기화
      form.resetFields();
      setSelectedType(null);
      setSelectedStatus(null);
      setSelectedAttendees([]);
    } catch (error) {
      console.error('Error saving meetup:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedType(null);
    setSelectedStatus(null);
    setSelectedAttendees([]);
    onCancel();
  };

  const defaultDate = useMemo(
    () => (selectedDate ? dayjs(selectedDate) : dayjs()),
    [selectedDate]
  );

  useEffect(() => {
    if (editingEvent) {
      form.setFieldsValue({
        title: editingEvent.resource.title,
        leader_nickname: editingEvent.resource.leader_nickname,
        leader_id: editingEvent.resource.leader_id,
        course: editingEvent.resource.course,
        type: editingEvent.resource.type,
        level: editingEvent.resource.level,
        status: editingEvent.resource.status,
        cancel_reason: editingEvent.resource.cancel_reason,
        review: editingEvent.resource.review,
        date: dayjs(editingEvent.resource.date),
        start_time: dayjs(editingEvent.resource.start_time, 'HH:mm:ss'),
      });
    } else {
      form.setFieldsValue({
        date: defaultDate,
        start_time: dayjs('09:00', 'HH:mm'),
        status: '진행 전',
        total_donation: 0,
      });
    }
  }, [editingEvent, form, defaultDate]);

  return (
    <Modal
      title={title || (editingEvent ? '일정 수정' : '일정 추가')}
      open={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      okText="저장"
      cancelText="취소"
    >
      <Form
        key={editingEvent ? editingEvent.id : 'new'}
        form={form}
        layout="vertical"
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
          <MemberAutoComplete
            placeholder="리딩자 닉네임을 입력하세요"
            onSelect={memberData => {
              form.setFieldValue('leader_id', memberData.memberId);
            }}
            onChange={nickname => {
              const member = members.find(m => m.nickname === nickname);
              if (member) {
                form.setFieldValue('leader_id', member.id);
              } else if (nickname) {
                console.warn('Member not found for nickname:', nickname);
                form.setFieldValue('leader_id', null);
              }
            }}
          />
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
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            minuteStep={5}
            inputReadOnly
          />
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
        {showLevelField && selectedType === '등산' && (
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
        {showStatusFields && (
          <Form.Item name="status" label="모임 진행 상태">
            <Select>
              <Option value="진행 전">진행 전</Option>
              <Option value="완료">완료</Option>
              <Option value="취소">취소</Option>
            </Select>
          </Form.Item>
        )}

        {showStatusFields && selectedStatus === '취소' && (
          <Form.Item name="cancel_reason" label="취소 사유">
            <TextArea placeholder="취소 사유를 입력하세요" rows={3} />
          </Form.Item>
        )}

        {showStatusFields &&
          selectedStatus === '완료' &&
          showAttendeeManager && (
            <>
              <Form.Item label="참가자 명단">
                <AttendeeManager
                  attendees={selectedAttendees}
                  onAttendeesChange={setSelectedAttendees}
                  form={form}
                  fieldName="attendees"
                />
              </Form.Item>

              {/* 숨겨진 attendees 필드 */}
              <Form.Item name="attendees" style={{ display: 'none' }}>
                <Input type="hidden" />
              </Form.Item>

              <Form.Item name="review" label="소감">
                <TextArea placeholder="모임 소감을 입력하세요" rows={4} />
              </Form.Item>
            </>
          )}

        {/* 상태 필드가 표시되지 않는 경우 기본 필드들 */}
        {!showStatusFields && (
          <>
            <Form.Item name="cancel_reason" label="취소 사유">
              <TextArea placeholder="취소 사유를 입력하세요" rows={3} />
            </Form.Item>

            <Form.Item name="review" label="소감">
              <TextArea placeholder="모임 소감을 입력하세요" rows={4} />
            </Form.Item>
          </>
        )}
      </Form>

      {editingEvent && showDeleteButton && (
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

export default MeetupFormModal;
