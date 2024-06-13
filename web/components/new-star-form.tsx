"use client";

import { StarData, StarDataSchema } from "@/lib/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { newStar } from "@/lib/actions";
import { DialogFooter } from "./ui/dialog";

export interface NewStarFormProps {
  galaxyId: string;
  afterSubmit?: () => void;
}

export default function NewStarForm({
  galaxyId,
  afterSubmit,
}: NewStarFormProps) {
  const form = useForm<StarData>({
    resolver: zodResolver(StarDataSchema),
    defaultValues: {
      name: "",
      nebula: "",
      public_domain: "",
      private_domain: "",
      port: 80,
    },
  });

  async function onSubmit(data: StarData) {
    await newStar(galaxyId, data);
    afterSubmit?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-4">
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
          name="nebula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nebula</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="public_domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public Domain</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="private_domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Private Domain</FormLabel>
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
              <FormLabel>Internal port</FormLabel>
              <FormControl>
                <Input type="number" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" loading={form.formState.isSubmitting}>
            Create
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
