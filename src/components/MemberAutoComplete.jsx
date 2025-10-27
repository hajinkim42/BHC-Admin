import React from 'react';
import { AutoComplete, Input } from 'antd';
import { useMemberAutoComplete } from '../hooks/useMemberAutoComplete';

const MemberAutoComplete = ({
  placeholder = '닉네임을 입력하세요',
  onSelect,
  onChange,
  value,
  style,
  disabled = false,
  allowClear = true,
  ...props
}) => {
  const { options, handleSearch, handleSelect, resetInput } =
    useMemberAutoComplete();

  const handleAutoCompleteSelect = (selectedValue, option) => {
    const memberData = handleSelect(selectedValue, option);
    if (onSelect) {
      onSelect(memberData, selectedValue, option);
    }
    resetInput();
  };

  const handleInputChange = inputValue => {
    handleSearch(inputValue);
    if (onChange) {
      // onChange가 함수인 경우 inputValue를 전달
      if (typeof onChange === 'function') {
        onChange(inputValue);
      }
    }
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onSearch={handleSearch}
      onSelect={handleAutoCompleteSelect}
      onChange={handleInputChange}
      filterOption={false}
      notFoundContent="일치하는 회원이 없습니다"
      disabled={disabled}
      allowClear={allowClear}
      style={style}
      {...props}
    >
      <Input placeholder={placeholder} />
    </AutoComplete>
  );
};

export default MemberAutoComplete;
