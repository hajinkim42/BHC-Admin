import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { message } from 'antd';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('members').select('*');

      if (error) throw error;

      console.log('Members data:', data);
      setMembers(data || []);
    } catch (error) {
      message.error('회원 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async memberData => {
    try {
      const { error } = await supabase.from('members').insert([memberData]);

      if (error) throw error;
      message.success('회원이 추가되었습니다.');
      await getMembers();
    } catch (error) {
      message.error('회원 저장에 실패했습니다.');
      console.error('Error saving member:', error);
    }
  };

  const updateMember = async (memberId, memberData) => {
    try {
      const { error } = await supabase
        .from('members')
        .update(memberData)
        .eq('id', memberId);

      if (error) throw error;
      message.success('회원 정보가 수정되었습니다.');
      await getMembers();
    } catch (error) {
      message.error('회원 정보 수정에 실패했습니다.');
      console.error('Error updating member:', error);
    }
  };

  const deleteMember = async memberId => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      message.success('회원이 삭제되었습니다.');
      await getMembers();
    } catch (error) {
      message.error('회원 삭제에 실패했습니다.');
      console.error('Error deleting member:', error);
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  return {
    members,
    loading,
    addMember,
    updateMember,
    deleteMember,
    refreshMembers: getMembers,
  };
};
