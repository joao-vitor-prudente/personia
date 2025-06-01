import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@server/api";
import { type Id } from "@server/dataModel";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button.tsx";
import { useAppForm } from "@/components/ui/form.tsx";

const formSchema = z.object({ content: z.string() });

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = { content: "" };

export function MessageForm(props: {
  form: ReturnType<typeof useMessageForm>;
}) {
  return (
    <props.form.AppForm>
      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          void props.form.handleSubmit();
        }}
      >
        <props.form.AppField name="content">
          {(field) => (
            <field.FormItem>
              <field.FormLabel className="sr-only">
                Send a message
              </field.FormLabel>
              <field.FormControl>
                <field.Textarea className="pr-24" />
              </field.FormControl>
              <field.FormMessage className="sr-only" />
            </field.FormItem>
          )}
        </props.form.AppField>
        <Button
          className="absolute top-1/2 -translate-y-1/2 right-4"
          type="submit"
        >
          Send
        </Button>
      </form>
    </props.form.AppForm>
  );
}

export function useMessageForm(props: { experimentId: Id<"experiments"> }) {
  const createMessage = useMutation({
    mutationFn: useConvexMutation(api.functions.messages.sendMessage),
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      form.reset();
    },
  });

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createMessage.mutateAsync({ ...value, ...props });
    },
    validators: { onSubmit: formSchema },
  });
  return form;
}
