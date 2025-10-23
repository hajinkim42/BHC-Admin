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
        .select(
          `
          *,
          meetup_attendees (
            id,
            member_id,
            donation_paid,
            donation_amount,
            members (
              id,
              nickname
            )
          )
        `
        )
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

        // 참가자 정보를 변환
        const attendees =
          meetup.meetup_attendees?.map(attendee => ({
            id: attendee.id,
            memberId: attendee.member_id,
            nickname: attendee.members?.nickname,
            donationPaid: attendee.donation_paid,
            donationAmount: attendee.donation_amount,
          })) || [];

        return {
          id: meetup.id,
          title:
            meetup.title ||
            `${meetup.place}${meetup.course ? ` (${meetup.course})` : ''}`,
          start: startDate,
          end: endDate,
          resource: {
            ...meetup,
            attendees,
          },
        };
      });

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
      // attendees 데이터를 별도로 분리
      const { attendees, ...meetupDataWithoutAttendees } = meetupData;

      // meetup 먼저 생성
      const { data: meetupResult, error: meetupError } = await supabase
        .from('meetups')
        .insert([meetupDataWithoutAttendees])
        .select()
        .single();

      if (meetupError) throw meetupError;

      // 참가자가 있는 경우 meetup_attendees 테이블에 추가
      if (attendees && attendees.length > 0) {
        const attendeeRecords = attendees.map(attendee => ({
          meetup_id: meetupResult.id,
          member_id: attendee.memberId,
          donation_paid: false,
          donation_amount: 0,
        }));

        const { error: attendeesError } = await supabase
          .from('meetup_attendees')
          .insert(attendeeRecords);

        if (attendeesError) throw attendeesError;
      }

      message.success('일정이 추가되었습니다.');
      await getMeetups();
    } catch (error) {
      message.error('일정 저장에 실패했습니다.');
      console.error('Error saving meetup:', error);
    }
  };

  const updateEvent = async (eventId, meetupData) => {
    try {
      // attendees 데이터를 별도로 분리
      const { attendees, ...meetupDataWithoutAttendees } = meetupData;

      // meetup 업데이트
      const { error: meetupError } = await supabase
        .from('meetups')
        .update(meetupDataWithoutAttendees)
        .eq('id', eventId);

      if (meetupError) throw meetupError;

      // 참가자 데이터가 있는 경우에만 처리
      if (attendees !== undefined) {
        // 기존 참가자 데이터 가져오기
        const { data: existingAttendees, error: fetchError } = await supabase
          .from('meetup_attendees')
          .select('member_id')
          .eq('meetup_id', eventId);

        if (fetchError) throw fetchError;

        const existingMemberIds =
          existingAttendees?.map(a => a.member_id) || [];
        const newMemberIds = attendees?.map(a => a.memberId) || [];

        // 삭제할 참가자 찾기 (기존에 있지만 새 목록에 없는 경우)
        const membersToDelete = existingMemberIds.filter(
          memberId => !newMemberIds.includes(memberId)
        );

        // 추가할 참가자 찾기 (새 목록에 있지만 기존에 없는 경우)
        const membersToAdd = newMemberIds.filter(
          memberId => !existingMemberIds.includes(memberId)
        );

        // 삭제할 참가자가 있으면 삭제
        if (membersToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('meetup_attendees')
            .delete()
            .eq('meetup_id', eventId)
            .in('member_id', membersToDelete);

          if (deleteError) throw deleteError;
        }

        // 추가할 참가자가 있으면 추가
        if (membersToAdd.length > 0) {
          const attendeeRecords = membersToAdd.map(memberId => ({
            meetup_id: eventId,
            member_id: memberId,
            donation_paid: false,
            donation_amount: 0,
          }));

          const { error: insertError } = await supabase
            .from('meetup_attendees')
            .insert(attendeeRecords);

          if (insertError) throw insertError;
        }
      }

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
