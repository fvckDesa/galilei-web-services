"use client";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { updateApp } from "./actions";
import { AppServiceSchema, TAppServiceSchema } from "@gws/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResourceState } from "@/components/resource";
import { toast } from "sonner";

interface AppFormProps {
  projectId: string;
  appId: string;
  app: TAppServiceSchema;
}

export function AppForm({ appId, projectId, app }: AppFormProps) {
  const {
    form,
    action: { result },
    handleSubmitWithAction,
  } = useHookFormAction(
    updateApp.bind(null, projectId, appId),
    zodResolver(AppServiceSchema),
    {
      formProps: {
        reValidateMode: "onBlur",
        defaultValues: {
          ...app,
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success(`App ${app.name} successfully updated`);
        },
      },
    }
  );

  const formId = useResourceState(form.formState);

  useEffect(() => {
    if (result.data) {
      form.reset(result.data);
    }
    if (!result.serverError) {
      return;
    }

    switch (result.serverError.kind) {
      case "AlreadyExists":
        form.setError("name", {
          type: "response",
          message: `App ${app.name} already exists. Try Another name.`,
        });
        break;
      default:
        toast.error(`Unable to update App ${app.name}`, {
          description: result.serverError.message,
        });
        break;
    }
  }, [form, result, app.name]);

  return (
    <Form {...form}>
      <form
        id={formId}
        className="flex flex-1 flex-col gap-2 overflow-hidden"
        onSubmit={handleSubmitWithAction}
      >
        <div className="flex flex-col gap-4 px-4 py-2 sm:px-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    autoComplete="off"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0", 10))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="replicas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Replicas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    autoComplete="off"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0", 10))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
