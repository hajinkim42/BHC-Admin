import React, { useState, useEffect } from 'react';
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

  // form의 값 변경을 감지하기 위한 state
  const [localAttendees, setLocalAttendees] = useState(
    form ? form.getFieldValue(fieldName) || [] : attendees
  );

  // form이나 attendees prop이 변경되면 localAttendees 업데이트
  useEffect(() => {
    if (form) {
      const formValue = form.getFieldValue(fieldName) || [];
      setLocalAttendees(formValue);
    } else {
      setLocalAttendees(attendees);
    }
  }, [form, fieldName, attendees]);

  // 참가자 추가 핸들러
  const handleAttendeeAdd = memberData => {
    if (!memberData) return;

    const currentAttendees = localAttendees;

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

      // state 업데이트 (즉시 UI 반영)
      setLocalAttendees(newAttendees);

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
    // 현재 참석자 목록을 local state에서 가져오기
    const currentAttendees = localAttendees;

    const newAttendees = storeAsIds
      ? currentAttendees.filter(id => id !== attendeeId)
      : currentAttendees.filter(attendee => {
          // id나 memberId로 비교 (API에서 가져온 경우 id가 있을 수 있음)
          return attendee.id !== attendeeId && attendee.memberId !== attendeeId;
        });

    // state 업데이트 (즉시 UI 반영)
    setLocalAttendees(newAttendees);

    if (form) {
      form.setFieldValue(fieldName, newAttendees);
    }

    if (onAttendeesChange) {
      onAttendeesChange(newAttendees);
    }

    // 강제 리렌더로 즉시 UI 반영
    setRefreshVersion(v => v + 1);
  };

  // 현재 참가자 목록 (local state 사용)
  const currentAttendees = localAttendees;

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
            const attendeeId = storeAsIds
              ? attendee
              : attendee.id || attendee.memberId; // id가 있으면 id 사용, 없으면 memberId 사용
            const attendeeName = storeAsIds
              ? members.find(m => m.id === attendeeId)?.nickname ||
                `#${attendeeId}`
              : attendee.nickname;
            return (
              <List.Item
                key={attendeeId}
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
