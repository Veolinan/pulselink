import type { AppProps } from 'next/app'
import AppLayout from '@/components/layout/AppLayout'
import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/next';


export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppLayout>
      <Component {...pageProps} />

      <Analytics />
    </AppLayout>
  )
}