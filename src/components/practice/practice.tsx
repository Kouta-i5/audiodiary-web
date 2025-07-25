import { Box, Stack, Typography } from '@mui/material';

export default function Practice() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" sx={{ flex: 1, overflow: 'hidden' }}>
        <Box sx={{ width: '50%', height: '100%', p: 2 }}>
          <Typography variant="h6">練習</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
