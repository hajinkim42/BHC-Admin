import { getTypeColor } from './meetupTypes';

// react-big-calendar에서 이벤트의 스타일을 타입별로 지정
export const getEventStyle = event => {
  const type = event?.resource?.type;
  const status = event?.resource?.status;
  const isCancelled = status === '취소';

  // meetupTypes의 색상 키워드를 실제 색상 코드로 매핑
  const colorKeyword = getTypeColor(type);
  const colorMap = {
    blue: '#1890ff',
    purple: '#722ed1',
    red: '#ff4d4f',
    green: '#52c41a',
    pink: '#eb2f96',
    orange: '#fa8c16',
    default: '#3174ad',
  };

  const backgroundColor = isCancelled
    ? '#d9d9d9' // gray for cancelled events
    : colorMap[colorKeyword] || colorMap.default;

  return {
    style: {
      backgroundColor,
      borderRadius: '5px',
      opacity: isCancelled ? 0.5 : 0.9, // dimmed for cancelled events
      color: isCancelled ? '#595959' : 'white',
      border: '0px',
      display: 'block',
      textDecoration: isCancelled ? 'line-through' : 'none', // strike-through for cancelled events
    },
    className: isCancelled ? 'rbc-event-cancelled' : '',
  };
};
