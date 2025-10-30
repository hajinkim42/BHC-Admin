import { getTypeColor } from './meetupTypes';

// react-big-calendar에서 이벤트의 스타일을 타입별로 지정
export const getEventStyle = event => {
  const type = event?.resource?.type;

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

  const backgroundColor = colorMap[colorKeyword] || colorMap.default;

  return {
    style: {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
    },
  };
};
