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
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const MeetupModal = ({ isVisible, onCancel, onOk, editingEvent, onDelete }) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedIsCompleted, setSelectedIsCompleted] = useState(null);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values);
    } catch (error) {
      console.error('Error saving meetup:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedType(null);
    setSelectedIsCompleted(null);
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
        leader: meetup.leader,
        place: meetup.place,
        course: meetup.course,
        type: meetup.type,
        difficulty: meetup.difficulty,
        is_completed: meetup.is_completed,
        cancel_reason: meetup.cancel_reason,
        total_donation: meetup.total_donation,
        attendees: meetup.attendees || [],
        reflections: meetup.reflections,
      });
      setSelectedType(meetup.type);
      setSelectedIsCompleted(meetup.is_completed);
    } else {
      // 새 이벤트 생성 시 기본값 설정
      form.setFieldsValue({
        date: moment(),
        start_time: moment('09:00', 'HH:mm'),
        is_completed: true,
        total_donation: 0,
      });
      setSelectedType(null);
      setSelectedIsCompleted(true);
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
          is_completed: true,
          total_donation: 0,
        }}
        onValuesChange={changedValues => {
          // eslint-disable-next-line no-prototype-builtins
          if (changedValues.hasOwnProperty('is_completed')) {
            console.log('is_completed changed:', changedValues.is_completed);
            setSelectedIsCompleted(changedValues.is_completed);
          }
        }}
      >
        {/* 기본 정보 */}
        <Form.Item
          name="title"
          label="제목"
          rules={[{ required: true, message: '제목을 입력해주세요' }]}
        >
          <Input placeholder="일정 제목을 입력하세요" />
        </Form.Item>

        <Form.Item
          name="leader"
          label="리딩자"
          rules={[{ required: true, message: '리딩자를 입력해주세요' }]}
        >
          <Input
            placeholder="리딩자 이름을 입력하세요"
            prefix={<UserOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="date"
          label="날짜"
          rules={[{ required: true, message: '날짜를 선택해주세요' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="start_time" label="시작 시간">
          <TimePicker style={{ width: '100%' }} format="HH:mm" />
        </Form.Item>

        <Form.Item
          name="place"
          label="장소"
          rules={[{ required: true, message: '장소를 입력해주세요' }]}
        >
          <Input placeholder="장소를 입력하세요" />
        </Form.Item>

        <Form.Item name="course" label="코스">
          <Input placeholder="코스 정보 (선택사항)" />
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
            name="difficulty"
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
        <Form.Item name="is_completed" label="모임 진행 여부">
          <Select>
            <Option value={true}>정상 진행</Option>
            <Option value={false}>취소됨</Option>
          </Select>
        </Form.Item>

        {selectedIsCompleted === false && (
          <Form.Item name="cancel_reason" label="취소 사유">
            <Select placeholder="취소 사유를 선택하세요">
              <Option value="날씨">날씨</Option>
              <Option value="인원미달">인원미달</Option>
              <Option value="기타">기타</Option>
            </Select>
          </Form.Item>
        )}
      </Form>

      {editingEvent && (
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Button
            danger
            onClick={() => {
              onDelete(editingEvent.id);
              handleCancel();
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
