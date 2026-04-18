import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import configPromise from '@/payload.config'
import { importMap } from './admin/importMap'
import type { ServerFunctionClient } from 'payload'
import React from 'react'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = (args) =>
  handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })

const Layout = ({ children }: Args) =>
  RootLayout({
    config: configPromise,
    children,
    importMap,
    serverFunction,
  })

export default Layout
