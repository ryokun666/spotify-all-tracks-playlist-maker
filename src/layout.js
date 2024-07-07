import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children, pageProps }) {
  return (
    <SessionProvider session={pageProps?.session}>{children}</SessionProvider>
  );
}
