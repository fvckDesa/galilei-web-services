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

interface GalaxyFormProps {
  // eslint-disable-next-line no-unused-vars
  action: (data: GalaxyData) => Promise<void>;
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
    await action(data);
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
        </footer>
      </form>
    </Form>
  );
}
