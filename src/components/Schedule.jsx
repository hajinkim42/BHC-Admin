import { useState } from "react";
import { Layout, Button, Modal, Form, Input, Select, DatePicker, TimePicker, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import Calendar from "./Calendar";
import { useEvents } from "../hooks/useEvents";
import { getEventStyle } from "../utils/eventStyles";

const { Header, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

function Schedule() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();

  const handleSelectSlot = ({ start }) => {
    setEditingEvent(null);
    form.resetFields();
    form.setFieldsValue({
      date: moment(start),
      start_time: moment('09:00', 'HH:mm')
    });
    setIsModalVisible(true);
  };

  const handleSelectEvent = (event) => {
    setEditingEvent(event);
    const meetup = event.resource;
    form.setFieldsValue({
      date: moment(meetup.date),
      start_time: meetup.start_time ? moment(meetup.start_time, 'HH:mm:ss') : null,
      place: meetup.place,
      course: meetup.course,
      type: meetup.type,
      is_completed: meetup.is_completed,
      cancel_reason: meetup.cancel_reason,
      total_donation: meetup.total_donation
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const meetupData = {
        date: values.date.format('YYYY-MM-DD'),
        start_time: values.start_time ? values.start_time.format('HH:mm:ss') : null,
        place: values.place,
        course: values.course || null,
        type: values.type,
        is_completed: values.is_completed,
        cancel_reason: values.cancel_reason || null,
        total_donation: values.total_donation || 0
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, meetupData);
      } else {
        await addEvent(meetupData);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving meetup:', error);
    }
  };

  const handleDelete = async (eventId) => {
    await deleteEvent(eventId);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, color: '#1890ff' }}>아기 등산 모임 관리</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingEvent(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          일정 추가
        </Button>
      </Header>

      <Content style={{ padding: 24, background: '#fff', minHeight: 'calc(100vh - 48px)', maxWidth: 'calc(100vw - 48px)' }}>
        <Calendar
          events={events}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={getEventStyle}
        />
      </Content>

      <Modal
        title={editingEvent ? "일정 수정" : "일정 추가"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="저장"
        cancelText="취소"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_completed: true,
            total_donation: 0
          }}
        >
          <Form.Item
            name="date"
            label="날짜"
            rules={[{ required: true, message: '날짜를 선택해주세요' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="시작 시간"
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="place"
            label="장소"
            rules={[{ required: true, message: '장소를 입력해주세요' }]}
          >
            <Input placeholder="장소를 입력하세요" />
          </Form.Item>

          <Form.Item
            name="course"
            label="코스"
          >
            <Input placeholder="코스 정보 (선택사항)" />
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

          <Form.Item
            name="is_completed"
            label="완료 여부"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>완료</Option>
              <Option value={false}>미완료</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cancel_reason"
            label="취소 사유"
          >
            <TextArea rows={3} placeholder="취소 사유 (선택사항)" />
          </Form.Item>

          <Form.Item
            name="total_donation"
            label="총 기부금"
          >
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>

        {editingEvent && (
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Popconfirm
              title="정말 삭제하시겠습니까?"
              onConfirm={() => {
                handleDelete(editingEvent.id);
                setIsModalVisible(false);
              }}
              okText="삭제"
              cancelText="취소"
            >
              <Button danger icon={<DeleteOutlined />}>
                삭제
              </Button>
            </Popconfirm>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

export default Schedule;
