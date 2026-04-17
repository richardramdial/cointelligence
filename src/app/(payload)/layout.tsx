import { RootLayout } from '@payloadcms/next/layouts'
import configPromise from '@/payload.config'
import React from 'react'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => RootLayout({ config: configPromise, children })

export default Layout
