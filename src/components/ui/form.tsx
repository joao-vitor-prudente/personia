import { Slot } from "@radix-ui/react-slot";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import * as React from "react";

import { Input as _Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label";
import { MultiSelect as _MultiSelect } from "@/components/ui/multi-select.tsx";
import {
  Select as _Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Textarea as _Textarea } from "@/components/ui/textarea.tsx";
import { cn } from "@/lib/utils";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    MultiSelect,
    Select,
    Textarea,
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

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const field = useFormContexts();

  return (
    <Slot
      aria-describedby={
        !field.errors.length
          ? field.descriptionId
          : `${field.descriptionId} ${field.messageId}`
      }
      aria-invalid={!!field.errors.length}
      data-slot="form-control"
      id={field.formItemId}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const field = useFormContexts();

  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="form-description"
      id={field.descriptionId}
      {...props}
    />
  );
}

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

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const field = useFormContexts();
  return (
    <Label
      className={cn("data-[error=true]:text-destructive", className)}
      data-error={!!field.errors.length}
      data-slot="form-label"
      htmlFor={field.formItemId}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const field = useFormContexts();
  const body = field.errors.length
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      String(field.errors.at(0)?.message ?? "")
    : props.children;
  if (!body) return null;

  return (
    <p
      className={cn("text-destructive text-sm", className)}
      data-slot="form-message"
      id={field.messageId}
      {...props}
    >
      {body}
    </p>
  );
}

function Input(
  props: Omit<
    React.ComponentProps<typeof _Input>,
    "id" | "name" | "onBlur" | "onValueChange" | "value"
  >,
) {
  const { field, formItemId } = useFormContexts();

  return (
    <_Input
      id={formItemId}
      name={field.name}
      onBlur={field.handleBlur}
      onChange={(e) => {
        if (props.type === "number") field.handleChange(e.target.valueAsNumber);
        else field.handleChange(e.target.value);
      }}
      value={field.state.value as string}
      {...props}
    />
  );
}

function MultiSelect(
  props: Omit<
    React.ComponentProps<typeof _MultiSelect>,
    "id" | "name" | "onBlur" | "onValueChange" | "value"
  >,
) {
  const { field, formItemId } = useFormContexts();

  return (
    <_MultiSelect
      defaultValue={field.state.value as string[]}
      id={formItemId}
      name={field.name}
      onBlur={field.handleBlur}
      onValueChange={(value) => {
        field.handleChange(value);
      }}
      {...props}
    />
  );
}

function Select(props: {
  children: React.ReactNode;
  contentProps?: Omit<React.ComponentProps<typeof SelectContent>, "children">;
  selectProps?: Omit<
    React.ComponentProps<typeof _Select>,
    "children" | "name" | "onValueChange" | "value"
  >;
  triggerProps?: Omit<
    React.ComponentProps<typeof SelectTrigger>,
    "children" | "id" | "onBlur"
  >;
  valueProps?: React.ComponentProps<typeof SelectValue>;
}) {
  const { field, formItemId } = useFormContexts();
  return (
    <_Select
      name={field.name}
      onValueChange={field.handleChange}
      value={field.state.value as string}
      {...props.selectProps}
    >
      <SelectTrigger
        id={formItemId}
        onBlur={field.handleBlur}
        {...props.triggerProps}
        className={cn("w-full", props.triggerProps?.className)}
      >
        <SelectValue {...props.valueProps} />
      </SelectTrigger>
      <SelectContent {...props.contentProps}>{props.children}</SelectContent>
    </_Select>
  );
}

function Textarea(
  props: Omit<
    React.ComponentProps<typeof _Textarea>,
    "id" | "name" | "onBlur" | "onValueChange" | "value"
  >,
) {
  const { field, formItemId } = useFormContexts();

  return (
    <_Textarea
      id={formItemId}
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

function useFormContexts() {
  const formItem = React.useContext(FormItemContext);
  const field = useFieldContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const errors = useStore(field.store, (state) => state.meta.errors);

  return {
    descriptionId: `${formItem.id}-form-item-description`,
    errors,
    field,
    formItemId: `${formItem.id}-form-item`,
    messageId: `${formItem.id}-form-item-message`,
  };
}

export { useAppForm, useFieldContext, useFormContext, withForm };
