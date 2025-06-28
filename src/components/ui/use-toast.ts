"use client"

import * as React from "react"
import { ToastActionElement, ToastProps } from "@radix-ui/react-toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST
      toast: ToasterToast
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST
      toast: Partial<ToasterToast>
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST
      toastId?: ToasterToast["id"]
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      // ! Side effects ! - This means all toasts will be dismissed
      // Make sure you handle this in a sensible way.
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        }
      } else {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({ ...t, open: false })),
        }
      }
    }
    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const ToastContext = React.createContext<
  | {
      toast: ({ ...props }: ToasterToast) => {
        id: string
        dismiss: () => void
        update: (props: Partial<ToasterToast>) => void
      }
      dismiss: (toastId?: string) => void
      toasts: ToasterToast[]
    }
  | undefined
>(undefined)

type ToastProviderProps = {
  children: React.ReactNode
}

function ToastProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] })

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({
        type: actionTypes.REMOVE_TOAST,
      })
    }, TOAST_REMOVE_DELAY)

    return () => {
      clearTimeout(timer)
    }
  }, [state.toasts])

  const addToast = React.useCallback(
    ({ ...props }: ToasterToast) => {
      const id = genId()

      const update = (props: Partial<ToasterToast>) =>
        dispatch({
          type: actionTypes.UPDATE_TOAST,
          toast: { ...props, id },
        })
      const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) dismiss()
          },
        },
      })

      return {
        id: id,
        dismiss,
        update,
      }
    },
    [dispatch]
  )

  return (
    <ToastContext.Provider
      value={React.useMemo(
        () => ({
          toast: addToast,
          dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
          toasts: state.toasts,
        }),
        [addToast, state.toasts]
      )}
    > {/* Added the missing '>' here */}
      {children}
    </ToastContext.Provider>
  )
}

function useToast() {
  const context = React.useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

export { ToastProvider, useToast }