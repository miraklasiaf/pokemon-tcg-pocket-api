import '@/styles/globals.css';

import { Geist, Geist_Mono } from 'next/font/google';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import { ThemeProvider } from '@mui/material/styles';
import { TradeListProvider } from '@/context/TradeListContext';
import Typography from '@mui/material/Typography';
import generateMetadata from '@/utils/generateMetadata';
import theme from '@/theme';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

/* eslint-disable react-refresh/only-export-components */
export const metadata = await generateMetadata();

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <TradeListProvider>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100vh'
                }}
              >
                <Box sx={{ flex: 1 }}>{children}</Box>

                <Box
                  component="footer"
                  sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    px: 2,
                    py: 3,
                    // keeps the footer clear of the fixed TradeTray
                    pb: 12,
                    textAlign: 'center'
                  }}
                >
                  <Container maxWidth="md">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="p"
                    >
                      Built by{' '}
                      <Link
                        href="https://github.com/miraklasiaf"
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        color="text.primary"
                        sx={{ fontWeight: 500 }}
                      >
                        miraklasiaf
                      </Link>
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="p"
                      sx={{ mt: 1 }}
                    >
                      Pokémon TCG Pocket card images, names, and text are property of The
                      Pokémon Company, DeNA Co., Ltd., and Creatures Inc. This is an
                      unofficial, fan-made site with no affiliation to or endorsement from
                      those companies.
                    </Typography>
                  </Container>
                </Box>
              </Box>
            </TradeListProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
