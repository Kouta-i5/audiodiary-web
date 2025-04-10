'use client';

import { Box, Typography } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

export default function CalendarPanel() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        カレンダー
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
        />
      </LocalizationProvider>
    </Box>
  );
}