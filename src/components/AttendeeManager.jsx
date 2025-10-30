import React, { useState } from 'react';
import { Form, Button, List, Avatar, Space } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import MemberAutoComplete from './MemberAutoComplete';

const AttendeeManager = ({
  attendees = [],
  onAttendeesChange,
  form,
  fieldName = 'attendees',
  disabled = false,
}) => {
  const [attendeeInputValue, setAttendeeInputValue] = useState('');

  // 참가자 추가 핸들러
  const handleAttendeeAdd = memberData => {
    if (!memberData) return;

    const currentAttendees = form
      ? form.getFieldValue(fieldName) || []
      : attendees;

    // 중복 참가자 체크
    const isDuplicate = currentAttendees.some(
      attendee => attendee.memberId === memberData.memberId
    );

    if (!isDuplicate) {
      const newAttendee = {
        nickname: memberData.nickname,
        memberId: memberData.memberId,
        donationPaid: false,
        donationAmount: 0,
      };

      const newAttendees = [...currentAttendees, newAttendee];

      if (form) {
        form.setFieldValue(fieldName, newAttendees);
      }

      if (onAttendeesChange) {
        onAttendeesChange(newAttendees);
      }
    }

    setAttendeeInputValue('');
  };

  // 참가자 삭제 핸들러
  const handleAttendeeDelete = attendeeId => {
    const currentAttendees = form
      ? form.getFieldValue(fieldName) || []
      : attendees;
    const newAttendees = currentAttendees.filter(
      attendee => attendee.memberId !== attendeeId
    );

    if (form) {
      form.setFieldValue(fieldName, newAttendees);
    }

    if (onAttendeesChange) {
      onAttendeesChange(newAttendees);
    }
  };

  // 현재 참가자 목록
  const currentAttendees = form
    ? form.getFieldValue(fieldName) || []
    : attendees;

  return (
    <div>
      {!disabled && (
        <div style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            <MemberAutoComplete
              placeholder="참가자 닉네임을 입력하세요"
              onSelect={handleAttendeeAdd}
              value={attendeeInputValue}
              onChange={value => setAttendeeInputValue(value)}
              style={{ flex: 1 }}
            />
            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                // 입력값이 있을 때만 추가
                if (attendeeInputValue.trim()) {
                  // 간단한 닉네임으로 참가자 추가 (memberId는 임시값)
                  handleAttendeeAdd({
                    nickname: attendeeInputValue,
                    memberId: Date.now(), // 임시 ID
                  });
                }
              }}
            >
              추가
            </Button> */}
          </Space.Compact>
        </div>
      )}

      {currentAttendees.length > 0 ? (
        <List
          dataSource={currentAttendees}
          renderItem={attendee => (
            <List.Item
              actions={
                !disabled
                  ? [
                      <Button
                        key="delete"
                        type="text"
                        danger
                        size="small"
                        onClick={() => handleAttendeeDelete(attendee.memberId)}
                      >
                        삭제
                      </Button>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={attendee.nickname}
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
          참가자가 없습니다.
        </div>
      )}
    </div>
  );
};

export default AttendeeManager;
