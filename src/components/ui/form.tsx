import { Slot } from "@radix-ui/react-slot";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import * as React from "react";

import { Input as _Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label";
import {
  Select as _Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { cn } from "@/lib/utils";

const {
  fieldContext,
  formContext,
  useFieldContext: _useFieldContext,
  useFormContext,
} = createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
  },
  fieldContext,
  formComponents: {},
  formContext,
});

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        className={cn("grid gap-2", className)}
        data-slot="form-item"
        {...props}
      />
    </FormItemContext.Provider>
  );
}

const useFieldContext = () => {
  const { id } = React.useContext(FormItemContext);
  const { name, store, ...fieldContext } = _useFieldContext();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const errors = useStore(store, (state) => state.meta.errors);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!fieldContext) {
    throw new Error("useFieldContext should be used within <FormItem>");
  }

  return {
    errors,
    formDescriptionId: `${id}-form-item-description`,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    id,
    name,
    store,
    ...fieldContext,
  };
};

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { errors, formDescriptionId, formItemId, formMessageId } =
    useFieldContext();

  return (
    <Slot
      aria-describedby={
        !errors.length
          ? formDescriptionId
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!errors.length}
      data-slot="form-control"
      id={formItemId}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFieldContext();

  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { errors, formItemId } = useFieldContext();

  return (
    <Label
      className={cn("data-[error=true]:text-destructive", className)}
      data-error={!!errors.length}
      data-slot="form-label"
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { errors, formMessageId } = useFieldContext();
  const body = errors.length
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      String(errors.at(0)?.message ?? "")
    : props.children;
  if (!body) return null;

  return (
    <p
      className={cn("text-destructive text-sm", className)}
      data-slot="form-message"
      id={formMessageId}
      {...props}
    >
      {body}
    </p>
  );
}

function Input(props: React.ComponentProps<typeof _Input>) {
  const field = _useFieldContext();
  return (
    <_Input
      name={field.name}
      onBlur={field.handleBlur}
      onChange={(e) => {
        field.handleChange(e.target.value);
      }}
      value={field.state.value as string}
      {...props}
    />
  );
}

function Select({
  children,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  const field = _useFieldContext();
  return (
    <_Select
      name={field.name}
      onValueChange={field.handleChange}
      value={field.state.value as string}
    >
      <SelectTrigger onBlur={field.handleBlur} {...props}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </_Select>
  );
}

export { useAppForm, useFieldContext, useFormContext, withForm };
