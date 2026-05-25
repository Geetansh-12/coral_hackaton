import type { Metadata } from 'next'
import './globals.css'
import CustomCursor from './components/CustomCursor'

export const metadata: Metadata = {
  title: 'Coral CRM — Relationship Intelligence for Humans',
  description: 'A personal CRM powered by Coral SQL cross-source joins and Claude AI. Track, understand, and nurture your professional relationships across Gmail, Calendar, Slack, LinkedIn, Twitter, and Notion.',
  keywords: ['CRM', 'relationship intelligence', 'Coral SQL', 'AI', 'personal CRM', 'networking'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a08" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
