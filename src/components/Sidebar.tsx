'use client';

import {
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const linkNames: { [key: string]: string } = {
  Profile: 'プロフィール',
  Home: 'ホーム',
  Calendar: 'カレンダー',
};

const navItems = [
  { href: '/profile', icon: <PersonIcon />, label: linkNames.Profile },
  { href: '/', icon: <HomeIcon />, label: linkNames.Home },
  { href: '/calendar', icon: <CalendarIcon />, label: linkNames.Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: 256,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* ロゴ・アプリ名 */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <EditIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" noWrap>
              AI-Diary
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your daily companion
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* メニュー */}
      <Box sx={{ flex: 1, py: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 3,
            pb: 1,
            display: 'block',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'text.secondary',
          }}
        >
          メニュー
        </Typography>
        <List sx={{ px: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* フッター */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © {new Date().getFullYear()} AudioDiary
        </Typography>
      </Box>
    </Paper>
  );
}
