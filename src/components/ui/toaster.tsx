"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from "@radix-ui/react-toast"
import { useToast } from "@/hooks/use-toast"
import React from "react" // Import React for Fragment

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            {/* Wrap all content in a single div to satisfy Radix UI's single child requirement for Toast.Root */}
            <div className="flex items-center justify-between w-full">
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </>
  )
}