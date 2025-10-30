import { useState } from 'react';
import { Layout, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Calendar from './Calendar';
import MeetupFormModal from './MeetupModal';
import { useEvents } from '../hooks/useEvents';
import { getEventStyle } from '../utils/eventStyles';

const { Header, Content } = Layout;

function Schedule() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelectSlot = slotInfo => {
    setEditingEvent(null);
    setSelectedDate(slotInfo.start);
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
        sub_leader_member_ids: (values.sub_leader_member_ids || []).map(id =>
          typeof id === 'string' ? Number(id) : id
        ),
        course: values.course || null,
        type: values.type,
        level: values.level || null,
        status: values.status,
        cancel_reason: values.cancel_reason || null,
        review: values.review || null,
        attendees: values.attendees || [],
      };

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
    setSelectedDate(null);
  };

  const handleDelete = async eventId => {
    await deleteEvent(eventId);
    setIsModalVisible(false);
    setEditingEvent(null);
    setSelectedDate(null);
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingEvent(null);
            setSelectedDate(null);
            setIsModalVisible(true);
          }}
        >
          일정 추가
        </Button>
      </Header>

      <Content
        className="schedule-content"
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

      <MeetupFormModal
        isVisible={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        editingEvent={editingEvent}
        onDelete={handleDelete}
        title={editingEvent ? '일정 수정' : '일정 추가'}
        showDeleteButton={true}
        showAttendeeManager={true}
        showLevelField={true}
        showStatusFields={true}
        selectedDate={selectedDate}
      />
    </Layout>
  );
}

export default Schedule;
