'use client'

import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '../../lib/utils'

const Drawer = ({ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
)
Drawer.displayName = 'Drawer'

// Explicit annotations avoid TS2742 — vaul re-exports reference internal pnpm radix-dialog paths
const DrawerTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }> =
  DrawerPrimitive.Trigger as never
const DrawerPortal = DrawerPrimitive.Portal
const DrawerClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }> =
  DrawerPrimitive.Close as never

const DrawerOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
      ref={ref as never}
      className={cn('fixed inset-0 z-50 bg-black/80', className)}
      {...(props as never)}
    />
  )
)
DrawerOverlay.displayName = 'DrawerOverlay'

const DrawerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { direction?: 'bottom' | 'right' }
>(({ className, children, direction = 'bottom', ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref as never}
      className={cn(
        direction === 'right'
          ? 'fixed inset-y-0 right-0 z-50 flex h-full w-[300px] flex-col border-l bg-background'
          : 'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
        className
      )}
      {...(props as never)}
    >
      {direction !== 'right' && (
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      )}
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = 'DrawerContent'

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid gap-1.5 p-4 text-center sm:text-start', className)} {...props} />
)
DrawerHeader.displayName = 'DrawerHeader'

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
)
DrawerFooter.displayName = 'DrawerFooter'

const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Title
      ref={ref as never}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...(props as never)}
    />
  )
)
DrawerTitle.displayName = 'DrawerTitle'

const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Description
      ref={ref as never}
      className={cn('text-sm text-muted-foreground', className)}
      {...(props as never)}
    />
  )
)
DrawerDescription.displayName = 'DrawerDescription'

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
