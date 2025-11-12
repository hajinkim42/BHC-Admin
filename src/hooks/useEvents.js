import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import apiClient from '../utils/apiClient';

// 참석자 추가 함수 (useAttendees에서 직접 사용)
const createAttendee = async attendeeData => {
  const data = await apiClient.post('/api/meetup-attendees', attendeeData);
  return data;
};

// 참석자 삭제 함수
const deleteAttendee = async attendeeId => {
  const data = await apiClient.delete(`/api/meetup-attendees/${attendeeId}`);
  return data;
};

// 특정 모임의 참석자 조회
const fetchMeetupAttendees = async meetupId => {
  const allAttendees = await apiClient.get('/api/meetup-attendees');
  return allAttendees.filter(attendee => attendee.meetup_id === meetupId);
};

const EVENTS_QUERY_KEY = ['events'];

// 캘린더 이벤트로 변환하는 헬퍼 함수
const transformToCalendarEvents = data => {
  return data.map(meetup => {
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
};

// 일정 목록 조회
const fetchMeetups = async () => {
  const data = await apiClient.get('/api/meetups');
  return data;
};

// 일정 추가 (attendees는 별도로 처리)
const createMeetup = async meetupData => {
  // attendees를 제외하고 일정만 저장
  const { attendees, ...meetupDataWithoutAttendees } = meetupData;
  const data = await apiClient.post('/api/meetups', meetupDataWithoutAttendees);

  // 일정 추가 후 참석자도 별도 API로 추가
  const meetupId = data?.id || data?.data?.id;
  if (meetupId && attendees && attendees.length > 0) {
    try {
      await Promise.all(
        attendees.map(attendee =>
          createAttendee({
            meetup_id: meetupId,
            member_id: attendee.memberId || attendee,
            donation_paid: attendee.donationPaid || false,
            donation_amount: attendee.donationAmount || 0,
          })
        )
      );
    } catch (error) {
      console.error('Error adding attendees:', error);
      // 참석자 추가 실패해도 일정은 이미 저장되었으므로 에러를 throw하지 않음
    }
  }

  return data;
};

// 일정 수정 (attendees는 별도로 처리)
const updateMeetupApi = async ({ eventId, meetupData }) => {
  // attendees를 제외하고 일정만 수정
  const { attendees, ...meetupDataWithoutAttendees } = meetupData;
  const data = await apiClient.put(
    `/api/meetups/${eventId}`,
    meetupDataWithoutAttendees
  );

  // 참석자 처리: 일정 수정 시 참석자도 업데이트
  if (attendees !== undefined) {
    try {
      // 기존 참석자 조회
      const existingAttendees = await fetchMeetupAttendees(eventId);
      const existingMemberIds = existingAttendees.map(a => a.member_id);

      // 새로운 참석자 memberId 목록
      const newMemberIds = attendees.map(a => a.memberId || a);

      // 삭제할 참석자 찾기 (기존에 있지만 새 목록에 없는 경우)
      const membersToDelete = existingAttendees.filter(
        attendee => !newMemberIds.includes(attendee.member_id)
      );

      // 추가할 참석자 찾기 (새 목록에 있지만 기존에 없는 경우)
      const membersToAdd = attendees.filter(attendee => {
        const memberId = attendee.memberId || attendee;
        return !existingMemberIds.includes(memberId);
      });

      // 삭제할 참석자 삭제
      if (membersToDelete.length > 0) {
        await Promise.all(
          membersToDelete.map(attendee => deleteAttendee(attendee.id))
        );
      }

      // 추가할 참석자 추가
      if (membersToAdd.length > 0) {
        await Promise.all(
          membersToAdd.map(attendee =>
            createAttendee({
              meetup_id: eventId,
              member_id: attendee.memberId || attendee,
              donation_paid: attendee.donationPaid || false,
              donation_amount: attendee.donationAmount || 0,
            })
          )
        );
      }
    } catch (error) {
      console.error('Error updating attendees:', error);
      // 참석자 업데이트 실패해도 일정은 이미 수정되었으므로 에러를 throw하지 않음
    }
  }

  return data;
};

// 일정 삭제
const deleteMeetupApi = async eventId => {
  const data = await apiClient.delete(`/api/meetups/${eventId}`);
  return data;
};

export const useEvents = () => {
  const queryClient = useQueryClient();

  // 일정 목록 조회
  const {
    data: meetupsData = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: fetchMeetups,
  });

  // 캘린더 이벤트로 변환
  const events = transformToCalendarEvents(meetupsData);

  // 일정 추가
  const addEventMutation = useMutation({
    mutationFn: createMeetup,
    onSuccess: () => {
      message.success('일정이 추가되었습니다.');
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
    onError: error => {
      message.error('일정 저장에 실패했습니다.');
      console.error('Error saving meetup:', error);
    },
  });

  // 일정 수정
  const updateEventMutation = useMutation({
    mutationFn: updateMeetupApi,
    onSuccess: () => {
      message.success('일정이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
    onError: error => {
      message.error('일정 저장에 실패했습니다.');
      console.error('Error saving meetup:', error);
    },
  });

  // 일정 삭제
  const deleteEventMutation = useMutation({
    mutationFn: deleteMeetupApi,
    onSuccess: () => {
      message.success('일정이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
    onError: error => {
      message.error('일정 삭제에 실패했습니다.');
      console.error('Error deleting meetup:', error);
    },
  });

  return {
    events,
    loading,
    error,
    addEvent: addEventMutation.mutateAsync,
    updateEvent: (eventId, meetupData) =>
      updateEventMutation.mutateAsync({ eventId, meetupData }),
    deleteEvent: deleteEventMutation.mutate,
    refreshEvents: () =>
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY }),
  };
};
