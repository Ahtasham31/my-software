import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { X } from "lucide-react";
import {
  createContext, forwardRef, useCallback, useContext,
  useEffect, useMemo, useState, type ReactNode
} from "react";
import { cn } from "@/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef<HTMLDivElement, DialogPrimitive.DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 animate-fade-in" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg animate-fade-in",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
);
DialogContent.displayName = "DialogContent";

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn("mb-4 flex flex-col gap-1", className)} {...props} />;
}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogPrimitive.DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn("text-title", className)} {...props} />
  )
);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogPrimitive.DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
DialogDescription.displayName = "DialogDescription";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverContent = forwardRef<HTMLDivElement, PopoverPrimitive.PopoverContentProps>(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md animate-fade-in",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = "PopoverContent";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuPrimitive.DropdownMenuContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-fade-in",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuPrimitive.DropdownMenuItemProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  )
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

/* ---- Toast ---- */

type ToastVariant = "default" | "success" | "warning" | "error";
interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastApi {
  show: (t: Omit<ToastItem, "id" | "variant"> & { variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback<ToastApi["show"]>(({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, title, description, variant }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 4000);
  }, []);

  const api = useMemo<ToastApi>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto rounded-md border p-3 shadow-md animate-fade-in",
              item.variant === "default" && "border-border bg-card text-card-foreground",
              item.variant === "success" && "border-success/40 bg-success/10 text-foreground",
              item.variant === "warning" && "border-warning/40 bg-warning/10 text-foreground",
              item.variant === "error" && "border-error/40 bg-error/10 text-foreground"
            )}
          >
            <div className="text-sm font-medium">{item.title}</div>
            {item.description && (
              <div className="mt-0.5 text-xs text-muted-foreground">{item.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---- Confirmation Dialog ---- */

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmApi {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmApi | null>(null);

export function useConfirm(): ConfirmApi {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }): JSX.Element {
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: () => void }) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    setPending({ ...options, resolve: () => setPending(null) });
  }, []);

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && pending.resolve();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <DialogPrimitive.Root open={!!pending} onOpenChange={(o) => !o && pending?.resolve()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg">
            <DialogPrimitive.Title className="mb-2 text-title">
              {pending?.title}
            </DialogPrimitive.Title>
            {pending?.description && (
              <DialogPrimitive.Description className="mb-4 text-sm text-muted-foreground">
                {pending.description}
              </DialogPrimitive.Description>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => pending?.resolve()}
                className="h-9 rounded-md border border-input px-4 text-sm hover:bg-hover"
              >
                {pending?.cancelLabel ?? "Cancel"}
              </button>
              <button
                onClick={() => { void pending?.onConfirm(); pending?.resolve(); }}
                className={cn(
                  "h-9 rounded-md px-4 text-sm font-medium text-white",
                  pending?.destructive ? "bg-error" : "bg-primary text-primary-foreground"
                )}
              >
                {pending?.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ConfirmContext.Provider>
  );
}