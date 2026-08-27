"use client";

import React from "react";
import Image from "next/image";
import { Box, Container, ThemeProvider, Typography } from "@mui/material";
import theme from "@/lib/theme";
import { DashboardSidebar } from "./Sidebar";

interface PortalLayoutProps {
  children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <ThemeProvider theme={theme}>
      <Box className="flex min-h-screen bg-[#F8FAFC]">
        <DashboardSidebar />
        <Box className="flex flex-1 flex-col">
          <Box
            component="header"
            className="h-[72px] bg-[#0B2D6B] flex sticky top-0 z-10 items-center justify-between shrink-0 px-10"
          >
            <Typography className="font-poppins font-bold text-[22px] text-white tracking-[0.5px]">
              Prapti
            </Typography>
            <Box
              className="cursor-pointer w-9 h-9 rounded-full border-2 border-white/60 flex items-center justify-center"
              sx={{ filter: "brightness(0) invert(1)" }}
            >
              <Image
                src="/assets/portal/user.svg"
                alt="User profile"
                width={18}
                height={18}
              />
            </Box>
          </Box>

          <Box component="main" className="flex-1 overflow-auto">
            <Container maxWidth="xl" className="py-10 px-10">
              {children}
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
