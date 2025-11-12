import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import apiClient from '../utils/apiClient';

const MEMBERS_QUERY_KEY = ['members'];

// 회원 목록 조회
const fetchMembers = async () => {
  const data = await apiClient.get('/api/members');
  return data;
};

// 회원 추가
const createMember = async memberData => {
  const data = await apiClient.post('/api/members', memberData);
  return data;
};

// 회원 수정
const updateMemberApi = async ({ memberId, memberData }) => {
  const data = await apiClient.put(`/api/members/${memberId}`, memberData);
  return data;
};

// 회원 삭제
const deleteMemberApi = async memberId => {
  const data = await apiClient.delete(`/api/members/${memberId}`);
  return data;
};

export const useMembers = () => {
  const queryClient = useQueryClient();

  // 회원 목록 조회
  const {
    data: members = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: MEMBERS_QUERY_KEY,
    queryFn: fetchMembers,
  });

  // 회원 추가
  const addMemberMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      message.success('회원이 추가되었습니다.');
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY });
    },
    onError: error => {
      message.error('회원 저장에 실패했습니다.');
      console.error('Error saving member:', error);
    },
  });

  // 회원 수정
  const updateMemberMutation = useMutation({
    mutationFn: updateMemberApi,
    onSuccess: () => {
      message.success('회원 정보가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY });
    },
    onError: error => {
      message.error('회원 정보 수정에 실패했습니다.');
      console.error('Error updating member:', error);
    },
  });

  // 회원 삭제
  const deleteMemberMutation = useMutation({
    mutationFn: deleteMemberApi,
    onSuccess: () => {
      message.success('회원이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY });
    },
    onError: error => {
      message.error('회원 삭제에 실패했습니다.');
      console.error('Error deleting member:', error);
    },
  });

  return {
    members,
    loading,
    error,
    addMember: addMemberMutation.mutate,
    updateMember: (memberId, memberData) =>
      updateMemberMutation.mutate({ memberId, memberData }),
    deleteMember: deleteMemberMutation.mutate,
    refreshMembers: () =>
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY }),
  };
};
