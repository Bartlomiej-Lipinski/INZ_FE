"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Users, User } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  IconComponent: React.ComponentType<{ strokeWidth: number }>;
};

export default function AccountGroupsNav() {
  const router = useRouter();
  const pathname = usePathname();

  const items: NavItem[] = useMemo(() => [
    { label: "Grupy", href: "/groups", IconComponent: Users },
    { label: "Moje konto", href: "/account", IconComponent: User },
  ], []);

  const currentValue = items.some(i => pathname?.startsWith(i.href))
    ? items.find(i => pathname?.startsWith(i.href))!.href
    : "/groups";

  const go = (href: string) => {
    if (href && href !== pathname) router.push(href);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: 6,
        px: 2,
        py: 7,
      }}
    >
      {items.map((item) => {
        const isActive = currentValue === item.href;
        return (
          <Tooltip 
            key={item.href} 
            title={item.label} 
            arrow
            slotProps={{
              tooltip: {
                sx: {
                  fontSize: '14px',
                  padding: '8px 12px',
                }
              }
            }}
          >
            <IconButton
              aria-label={item.label}
              onClick={() => go(item.href)}
              disableRipple
              sx={(theme) => ({
                width: { xs: 50,  md: 65, xl: 75 },
                height: { xs: 50,  md: 65,  xl: 75 },
                bgcolor: theme.palette.grey[800],
                color: theme.palette.grey[300],
                '&:hover': {
                  bgcolor: theme.palette.grey[700],
                },
                boxShadow: isActive ? `0 0 0 3px ${theme.palette.primary.main}` : "none",
                transition: 'all 0.2s ease-in-out',
                '& svg': {
                  width: { xs: 25, md: 32.5,  xl: 35.5 },
                  height: { xs: 25, md: 32.5,  xl: 35.5 },
                },
              })}
            >
              <item.IconComponent strokeWidth={1.5} />
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
}


