import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CustomDatePicker.css';
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
    <div className="flex items-center justify-between px-1 py-1 mb-3">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        type="button"
        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-all disabled:opacity-20 active:scale-90"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>
      <span className="text-sm font-black text-gray-800 dark:text-white capitalize tracking-tight">
        {format(date, 'MMMM yyyy')}
      </span>
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        type="button"
        className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-all disabled:opacity-20 active:scale-90"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );

  return (
    <div className="relative group">
      <DatePicker
        selected={parsedStart}
        onChange={onChange}
        startDate={parsedStart}
        endDate={parsedEnd}
        selectsRange
        isClearable
        placeholderText="Select date range..."
        renderCustomHeader={CustomHeader}
        className="w-full bg-white dark:bg-gray-800 pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none hover:border-primary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer placeholder:text-gray-400 placeholder:font-medium"
        dateFormat="dd MMM yyyy"
        calendarClassName="agri-calendar"
        todayButton="Today"
        showPopperArrow={false}
        popperPlacement="bottom-end"
      />
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors pointer-events-none" />
    </div>
  );
}
