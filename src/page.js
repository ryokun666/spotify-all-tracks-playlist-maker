import RootLayout from "./layout"; // Ensure this is used correctly.

export default function Page({ Component, pageProps }) {
  return (
    <RootLayout pageProps={pageProps}>
      <Component {...pageProps} />
    </RootLayout>
  );
}
