import { useState, useCallback } from 'react';
import { useMembers } from './useMembers';

export const useMemberAutoComplete = () => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const { members } = useMembers();

  // 자동완성을 위한 옵션 생성 함수
  const getOptions = useCallback(
    nickname => {
      if (!nickname || nickname.length < 1) {
        setOptions([]);
        return;
      }

      const matchingMembers = members.filter(
        m => m.nickname && m.nickname.includes(nickname)
      );

      const memberOptions = matchingMembers.map(member => ({
        value: member.nickname,
        label: member.nickname,
        memberId: member.id,
      }));

      setOptions(memberOptions);
    },
    [members]
  );

  // nickname으로 member id를 찾는 함수
  const findMemberIdByNickname = useCallback(
    nickname => {
      const matchingMembers = members.filter(
        m => m.nickname && m.nickname.includes(nickname)
      );
      return matchingMembers.length > 0 ? matchingMembers[0].id : null;
    },
    [members]
  );

  // 입력값 변경 핸들러
  const handleSearch = useCallback(
    value => {
      setInputValue(value);
      getOptions(value);
    },
    [getOptions]
  );

  // 옵션 선택 핸들러
  const handleSelect = useCallback((value, option) => {
    setInputValue('');
    setOptions([]);
    return {
      nickname: value,
      memberId: option.memberId,
    };
  }, []);

  // 입력 필드 초기화
  const resetInput = useCallback(() => {
    setInputValue('');
    setOptions([]);
  }, []);

  return {
    options,
    inputValue,
    handleSearch,
    handleSelect,
    resetInput,
    findMemberIdByNickname,
  };
};
