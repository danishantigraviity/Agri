import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function CustomDatePicker({ startDate, endDate, setDateRange }) {
  const onChange = (dates) => {
    const [start, end] = dates;
    setDateRange({
      start: start ? format(start, 'yyyy-MM-dd') : '',
      end: end ? format(end, 'yyyy-MM-dd') : ''
    });
  };

  const parsedStart = startDate ? parseISO(startDate) : null;
  const parsedEnd = endDate ? parseISO(endDate) : null;

  const CustomHeader = ({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
    <div className="flex items-center justify-between px-1 py-1 mb-4">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all disabled:opacity-20 active:scale-90"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={3} />
      </button>
      <span className="text-sm font-black text-primary-900 dark:text-white capitalize font-display tracking-tight">
        {format(date, 'MMMM yyyy')}
      </span>
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all disabled:opacity-20 active:scale-90"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={3} />
      </button>
    </div>
  );

  return (
    <div className="relative group min-w-[260px]">
      <DatePicker
        selected={parsedStart}
        onChange={onChange}
        startDate={parsedStart}
        endDate={parsedEnd}
        selectsRange
        isClearable
        placeholderText="dd-mm-yyyy - dd-mm-yyyy"
        renderCustomHeader={CustomHeader}
        className="w-full bg-white dark:bg-gray-800 pl-11 pr-4 py-3 rounded-[12px] border border-gray-100 dark:border-gray-700 shadow-sm text-xs font-bold text-gray-700 dark:text-gray-200 outline-none hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer"
        dateFormat="dd-MM-yyyy"
        calendarClassName="custom-datepicker"
      />
      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors pointer-events-none" />
    </div>
  );
}
