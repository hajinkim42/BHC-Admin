export const getEventStyle = event => {
  const type = event.resource.type;
  let backgroundColor = '#3174ad';

  switch (type) {
    case '등산':
      backgroundColor = '#52c41a';
      break;
    case '산책':
      backgroundColor = '#1890ff';
      break;
    case '러닝':
      backgroundColor = '#fa8c16';
      break;
    case '기타':
      backgroundColor = '#722ed1';
      break;
    default:
      backgroundColor = '#3174ad';
  }

  return {
    style: {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    },
  };
};
