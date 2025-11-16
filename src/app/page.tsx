"use client";

import SignInForm from "../components/pages/Sign-in-form";
import AccountGroupsNav from "@/components/layout/Account-groups-nav";
import GroupsList from "@/components/pages/Groups-list";
import { useAuthContext } from "@/contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function Page() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return (
      <div>
        <AccountGroupsNav />
        <GroupsList />
      </div>
    );
  }

  return <SignInForm />;
}
