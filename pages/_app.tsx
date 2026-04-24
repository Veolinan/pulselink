import type { AppProps } from 'next/app'
import AppLayout from '@/components/layout/AppLayout'
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <AppLayout>
        <Component {...pageProps} />
        <Analytics />
      </AppLayout>
    </div>
  )
}