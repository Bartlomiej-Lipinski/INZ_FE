"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Users, User } from "lucide-react";

type NavItem = {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
};

export default function AccountGroupsNav() {
  const router = useRouter();
  const pathname = usePathname();

  const PeopleIcon = <Users size={30} strokeWidth={2} />;
  const PersonIcon = <User size={30} strokeWidth={2} />;

  const items: NavItem[] = useMemo(() => [
    { label: "Grupy", value: "/groups", href: "/groups", icon: PeopleIcon },
    { label: "Moje konto", value: "/account", href: "/account", icon: PersonIcon },
  ], []);

  const currentValue = items.some(i => pathname?.startsWith(i.value))
    ? items.find(i => pathname?.startsWith(i.value))!.value
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
        const isActive = currentValue === item.value;
        return (
          <Tooltip key={item.value} title={item.label} arrow>
            <IconButton
              aria-label={item.label}
              onClick={() => go(item.href)}
              disableRipple
              sx={(theme) => ({
                width: 70,
                height: 70,
                bgcolor: theme.palette.grey[800],
                color: theme.palette.grey[300],
                '&:hover': {
                  bgcolor: theme.palette.grey[700],
                },
                boxShadow: isActive ? `0 0 0 3px ${theme.palette.primary.main}` : "none",
              })}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
}


