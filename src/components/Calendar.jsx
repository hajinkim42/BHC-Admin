import { Calendar as RBCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/ko";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";

// moment 로컬라이저 설정
const localizer = momentLocalizer(moment);

// 한국어 설정
moment.locale('ko');

const Calendar = ({ 
  events, 
  onSelectSlot, 
  onSelectEvent, 
  eventPropGetter 
}) => {
  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <RBCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
        popupOffset={{ x: 10, y: 10 }}
        showMultiDayTimes
        step={60}
        timeslots={1}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventPropGetter}
        messages={{
          next: '다음',
          previous: '이전',
          today: '오늘',
          month: '월',
          week: '주',
          day: '일',
          agenda: '일정',
          date: '날짜',
          time: '시간',
          event: '이벤트',
          noEventsInRange: '이 기간에 일정이 없습니다.',
          showMore: (total) => `+${total}개 더 보기`,
        }}
        style={{
          height: '100%',
          fontSize: '14px',
        }}
      />
    </div>
  );
};

export default Calendar;
