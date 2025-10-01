import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { message } from 'antd';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMeetups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meetups')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;

      // 캘린더 이벤트로 변환
      const calendarEvents = data.map(meetup => {
        const startDate = new Date(
          `${meetup.date}T${meetup.start_time || '09:00:00'}`
        );
        const endDate = meetup.end_time
          ? new Date(`${meetup.date}T${meetup.end_time}`)
          : new Date(startDate.getTime() + 60 * 60 * 1000); // 기본 1시간

        return {
          id: meetup.id,
          title:
            meetup.title ||
            `${meetup.place}${meetup.course ? ` (${meetup.course})` : ''}`,
          start: startDate,
          end: endDate,
          resource: meetup,
        };
      });

      console.log('Calendar events:', calendarEvents);
      console.log('Events count:', calendarEvents.length);
      setEvents(calendarEvents);
    } catch (error) {
      message.error('일정을 불러오는데 실패했습니다.');
      console.error('Error fetching meetups:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async meetupData => {
    try {
      const { error } = await supabase.from('meetups').insert([meetupData]);

      if (error) throw error;
      message.success('일정이 추가되었습니다.');
      await getMeetups();
    } catch (error) {
      message.error('일정 저장에 실패했습니다.');
      console.error('Error saving meetup:', error);
    }
  };

  const updateEvent = async (eventId, meetupData) => {
    try {
      const { error } = await supabase
        .from('meetups')
        .update(meetupData)
        .eq('id', eventId);

      if (error) throw error;
      message.success('일정이 수정되었습니다.');
      await getMeetups();
    } catch (error) {
      message.error('일정 저장에 실패했습니다.');
      console.error('Error saving meetup:', error);
    }
  };

  const deleteEvent = async eventId => {
    try {
      const { error } = await supabase
        .from('meetups')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      message.success('일정이 삭제되었습니다.');
      await getMeetups();
    } catch (error) {
      message.error('일정 삭제에 실패했습니다.');
      console.error('Error deleting meetup:', error);
    }
  };

  useEffect(() => {
    getMeetups();
  }, []);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: getMeetups,
  };
};
