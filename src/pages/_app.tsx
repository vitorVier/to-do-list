import type { AppProps } from "next/app";
import "../styles/globals.css";
import { Header } from "@/src/components/header/header";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps }: AppProps) {
  return(
    <SessionProvider session={pageProps.session}>
      <Header/>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
