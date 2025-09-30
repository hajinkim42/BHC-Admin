import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Layout, Button, Modal, Form, Input, Select, DatePicker, TimePicker, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import "moment/locale/ko";
import "antd/dist/reset.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";

const { Header, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

// moment 로컬라이저 설정
const localizer = momentLocalizer(moment);

// 한국어 설정
moment.locale('ko');

function App() {
  const [events, setEvents] = useState([]);
  // const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    getMeetups();
  }, []);

  async function getMeetups() {
    try {
      const { data, error } = await supabase.from("meetups").select("*").order('date', { ascending: true });
      if (error) throw error;


      // 캘린더 이벤트로 변환
      const calendarEvents = (data).map(meetup => {
        const startDate = new Date(`${meetup.date}T${meetup.start_time || '09:00:00'}`);
      const endDate = meetup.end_time
        ? new Date(`${meetup.date}T${meetup.end_time}`)
        : new Date(startDate.getTime() + 60 * 60 * 1000); // 기본 1시간
        
        return {
          id: meetup.id,
          title: `${meetup.place}${meetup.course ? ` (${meetup.course})` : ''}`,
          start: startDate,
          end: endDate,
          resource: meetup
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      message.error('일정을 불러오는데 실패했습니다.');
      console.error('Error fetching meetups:', error);
    }
  }

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
        // 수정
        const { error } = await supabase
          .from('meetups')
          .update(meetupData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        message.success('일정이 수정되었습니다.');
      } else {
        // 추가
        const { error } = await supabase
          .from('meetups')
          .insert([meetupData]);

        if (error) throw error;
        message.success('일정이 추가되었습니다.');
      }

      setIsModalVisible(false);
      form.resetFields();
      getMeetups();
    } catch (error) {
      message.error('일정 저장에 실패했습니다.');
      console.error('Error saving meetup:', error);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const { error } = await supabase
        .from('meetups')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      message.success('일정이 삭제되었습니다.');
      getMeetups();
    } catch (error) {
      message.error('일정 삭제에 실패했습니다.');
      console.error('Error deleting meetup:', error);
    }
  };


  const eventStyleGetter = (event) => {
    const type = event.resource.type;
    let backgroundColor = '#3174ad';

    switch (type) {
      case '등산':
        backgroundColor = '#52c41a';
        break;
      case '산책':
        backgroundColor = '#1890ff';
        break;
      case '러닝':
        backgroundColor = '#fa8c16';
        break;
      case '기타':
        backgroundColor = '#722ed1';
        break;
      default:
        backgroundColor = '#3174ad';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
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

      <Content style={{ padding: 24, background: '#fff', minHeight: 'calc(100vh - 48px)' , maxWidth: 'calc(100vw - 48px)' }}>
  <div style={{ width: '100%', height: '80vh' }}>
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      selectable
      views={['month', 'week', 'day']}
      defaultView="month"
      popup
      popupOffset={{ x: 10, y: 10 }}
      showMultiDayTimes
      step={60}
      timeslots={1}
      onSelectSlot={handleSelectSlot}
      onSelectEvent={handleSelectEvent}
      eventPropGetter={eventStyleGetter}
      messages={{
        next: '다음',
        previous: '이전',
        today: '오늘',
        month: '월',
        week: '주',
        day: '일',
        agenda: '일정',
        date: '날짜',
        time: '시간',
        event: '이벤트',
        noEventsInRange: '이 기간에 일정이 없습니다.',
        showMore: (total) => `+${total}개 더 보기`,
      }}
      style={{
        height: '100%',       // 부모 div 크기에 맞춤
        fontSize: '14px',     // 가독성 향상
      }}
    />
  </div>
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

export default App;