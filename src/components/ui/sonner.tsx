import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:rounded-xl group-[.toaster]:border-border-strong group-[.toaster]:bg-surface group-[.toaster]:text-foreground group-[.toaster]:shadow-md',
          title: 'group-[.toast]:text-sm group-[.toast]:font-medium',
          description: 'group-[.toast]:text-[13px] group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-foreground group-[.toast]:rounded-lg',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }