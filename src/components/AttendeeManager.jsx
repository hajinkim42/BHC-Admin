import React, { useState } from 'react';
import { Form, Button, List, Avatar, Space } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import MemberAutoComplete from './MemberAutoComplete';
import { useMembers } from '../hooks/useMembers';

const AttendeeManager = ({
  attendees = [],
  onAttendeesChange,
  form,
  fieldName = 'attendees',
  disabled = false,
  storeAsIds = false,
}) => {
  const [attendeeInputValue, setAttendeeInputValue] = useState('');
  const [, setRefreshVersion] = useState(0);
  const { members } = useMembers();

  // 참가자 추가 핸들러
  const handleAttendeeAdd = memberData => {
    if (!memberData) return;

    const currentAttendees = form
      ? form.getFieldValue(fieldName) || []
      : attendees;

    // 중복 참가자 체크
    const isDuplicate = storeAsIds
      ? currentAttendees.includes(memberData.memberId)
      : currentAttendees.some(
          attendee => attendee.memberId === memberData.memberId
        );

    if (!isDuplicate) {
      const newAttendee = storeAsIds
        ? memberData.memberId
        : {
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
      // 강제 리렌더로 즉시 UI 반영
      setRefreshVersion(v => v + 1);
    }

    setAttendeeInputValue('');
  };

  // 참가자 삭제 핸들러
  const handleAttendeeDelete = attendeeId => {
    const currentAttendees = form
      ? form.getFieldValue(fieldName) || []
      : attendees;
    const newAttendees = storeAsIds
      ? currentAttendees.filter(id => id !== attendeeId)
      : currentAttendees.filter(attendee => attendee.memberId !== attendeeId);

    if (form) {
      form.setFieldValue(fieldName, newAttendees);
    }

    if (onAttendeesChange) {
      onAttendeesChange(newAttendees);
    }

    // 강제 리렌더로 즉시 UI 반영
    setRefreshVersion(v => v + 1);
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
              placeholder="닉네임을 입력하세요"
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
          renderItem={attendee => {
            const attendeeId = storeAsIds ? attendee : attendee.memberId;
            const attendeeName = storeAsIds
              ? members.find(m => m.id === attendeeId)?.nickname ||
                `#${attendeeId}`
              : attendee.nickname;
            return (
              <List.Item
                actions={
                  !disabled
                    ? [
                        <Button
                          key="delete"
                          type="text"
                          danger
                          size="small"
                          onClick={() => handleAttendeeDelete(attendeeId)}
                        >
                          삭제
                        </Button>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={attendeeName}
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
          목록이 비어있습니다.
        </div>
      )}
    </div>
  );
};

export default AttendeeManager;
