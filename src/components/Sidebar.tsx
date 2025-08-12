'use client';

import {
  Edit as EditIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  Box,
  Grid,
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
  Information: '情報',
  Setting: '設定',
};

const navItems = [
  { href: '/profile', icon: <PersonIcon />, label: linkNames.Profile },
  { href: '/', icon: <HomeIcon />, label: linkNames.Home },
  { href: '/information', icon: <InfoIcon />, label: linkNames.Information },
  { href: '/setting', icon: <SettingsIcon />, label: linkNames.Setting },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 240,
        bgcolor: 'background.paper',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* ロゴ・アプリ名 - MUI v7 Gridを使用 */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size="auto">
            <EditIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </Grid>
          <Grid size="grow">
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              AI-Diary
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* メニュー */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: pathname === item.href ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: pathname === item.href ? 'bold' : 'normal',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* フッター */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          &copy; {new Date().getFullYear()} AudioDiary
        </Typography>
      </Box>
    </Paper>
  );
}
