// 모임 타입 옵션과 색상 정의
export const MEETUP_TYPE_OPTIONS = [
  { value: '정기모임', label: '정기모임', color: 'blue' },
  { value: '특별세션', label: '특별세션', color: 'purple' },
  { value: '번개', label: '번개', color: 'red' },
  { value: '쓰줍킹', label: '쓰줍킹', color: 'green' },
  { value: '생일파티', label: '생일파티', color: 'pink' },
  { value: '베하클데이', label: '베하클데이', color: 'orange' },
  { value: '기타', label: '기타', color: 'default' },
];

// 난이도 옵션
export const MEETUP_LEVEL_OPTIONS = [
  { value: '초급', label: '초급' },
  { value: '중급', label: '중급' },
  { value: '고급', label: '고급' },
];

// 타입별 색상 매핑 함수
export const getTypeColor = type => {
  const option = MEETUP_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.color : 'default';
};
