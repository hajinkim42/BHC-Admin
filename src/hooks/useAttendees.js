import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import apiClient from '../utils/apiClient';

const ATTENDEES_QUERY_KEY = ['meetup-attendees'];

// 모든 참석자 조회
const fetchAttendees = async () => {
  const data = await apiClient.get('/api/meetup-attendees');
  return data;
};

// 참석자 추가
const createAttendee = async attendeeData => {
  const data = await apiClient.post('/api/meetup-attendees', attendeeData);
  return data;
};

// 참석자 수정
const updateAttendeeApi = async ({ attendeeId, attendeeData }) => {
  const data = await apiClient.put(
    `/api/meetup-attendees/${attendeeId}`,
    attendeeData
  );
  return data;
};

// 참석자 삭제
const deleteAttendeeApi = async attendeeId => {
  const data = await apiClient.delete(`/api/meetup-attendees/${attendeeId}`);
  return data;
};

export const useAttendees = () => {
  const queryClient = useQueryClient();

  // 모든 참석자 조회
  const {
    data: attendees = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ATTENDEES_QUERY_KEY,
    queryFn: fetchAttendees,
  });

  // 참석자 추가
  const addAttendeeMutation = useMutation({
    mutationFn: createAttendee,
    onSuccess: () => {
      message.success('참석자가 추가되었습니다.');
      queryClient.invalidateQueries({ queryKey: ATTENDEES_QUERY_KEY });
      // 이벤트도 갱신 (참석자가 변경되면 일정 목록도 갱신)
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: error => {
      message.error('참석자 추가에 실패했습니다.');
      console.error('Error adding attendee:', error);
    },
  });

  // 참석자 수정
  const updateAttendeeMutation = useMutation({
    mutationFn: updateAttendeeApi,
    onSuccess: () => {
      message.success('참석자 정보가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ATTENDEES_QUERY_KEY });
      // 이벤트도 갱신
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: error => {
      message.error('참석자 정보 수정에 실패했습니다.');
      console.error('Error updating attendee:', error);
    },
  });

  // 참석자 삭제
  const deleteAttendeeMutation = useMutation({
    mutationFn: deleteAttendeeApi,
    onSuccess: () => {
      message.success('참석자가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ATTENDEES_QUERY_KEY });
      // 이벤트도 갱신
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: error => {
      message.error('참석자 삭제에 실패했습니다.');
      console.error('Error deleting attendee:', error);
    },
  });

  return {
    attendees,
    loading,
    error,
    addAttendee: addAttendeeMutation.mutate,
    updateAttendee: (attendeeId, attendeeData) =>
      updateAttendeeMutation.mutate({ attendeeId, attendeeData }),
    deleteAttendee: deleteAttendeeMutation.mutate,
    refreshAttendees: () =>
      queryClient.invalidateQueries({ queryKey: ATTENDEES_QUERY_KEY }),
  };
};

// 특정 모임의 참석자만 필터링하는 헬퍼 함수
export const useMeetupAttendees = meetupId => {
  const { attendees, loading, error, ...rest } = useAttendees();

  const meetupAttendees = meetupId
    ? attendees.filter(attendee => attendee.meetup_id === meetupId)
    : [];

  return {
    attendees: meetupAttendees,
    loading,
    error,
    ...rest,
  };
};
