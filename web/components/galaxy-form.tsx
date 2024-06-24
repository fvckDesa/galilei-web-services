"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GalaxyDataSchema, GalaxyData } from "@/lib/schema";
import { ReactNode } from "react";
import { ActionResult } from "@/lib/actions";
import { ApiErrorType } from "api-client";

interface GalaxyFormProps {
  // eslint-disable-next-line no-unused-vars
  action: (data: GalaxyData) => Promise<ActionResult>;
  galaxy?: GalaxyData;
  btnContent?: ReactNode;
}

const EMPTY_GALAXY: GalaxyData = {
  name: "",
};

export default function GalaxyForm({
  action,
  galaxy,
  btnContent,
}: GalaxyFormProps) {
  const form = useForm<GalaxyData>({
    resolver: zodResolver(GalaxyDataSchema),
    defaultValues: {
      ...EMPTY_GALAXY,
      ...galaxy,
    },
  });

  async function onSubmit(data: GalaxyData) {
    const res = await action(data);

    if (res && "error" in res) {
      switch (res.error.status_code) {
        case ApiErrorType.AlreadyExists:
          form.setError("name", {
            type: "response",
            message: "Name already used",
          });
          break;
        default:
          form.setError("root", {
            type: "response",
            message: "Oops.. Something went wrong",
          });
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-lg space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Galaxy name</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <footer className="flex justify-end">
          <Button type="submit" loading={form.formState.isSubmitting}>
            {btnContent}
          </Button>
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root?.message}
          </p>
        </footer>
      </form>
    </Form>
  );
}
