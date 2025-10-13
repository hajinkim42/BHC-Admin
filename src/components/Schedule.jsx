import { useState } from 'react';
import { Layout, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Calendar from './Calendar';
import MeetupModal from './MeetupModal';
import { useEvents } from '../hooks/useEvents';
import { getEventStyle } from '../utils/eventStyles';

const { Header, Content } = Layout;

function Schedule() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const handleSelectSlot = () => {
    setEditingEvent(null);
    setIsModalVisible(true);
  };

  const handleSelectEvent = event => {
    setEditingEvent(event);
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
      };
      console.log('meetupData', meetupData);

      if (editingEvent) {
        await updateEvent(editingEvent.id, meetupData);
      } else {
        await addEvent(meetupData);
      }

      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving meetup:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingEvent(null);
  };

  const handleDelete = async eventId => {
    await deleteEvent(eventId);
    setIsModalVisible(false);
    setEditingEvent(null);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <h1 style={{ margin: 0, color: '#1890ff' }}>일정 관리</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingEvent(null);
            setIsModalVisible(true);
          }}
        >
          일정 추가
        </Button>
      </Header>

      <Content
        style={{
          padding: 24,
          background: '#fff',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Calendar
          events={events}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={getEventStyle}
        />
      </Content>

      <MeetupModal
        isVisible={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        editingEvent={editingEvent}
        onDelete={handleDelete}
      />
    </Layout>
  );
}

export default Schedule;
