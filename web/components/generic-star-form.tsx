"use client";

import { StarDataSchema } from "@/lib/schema";
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
import { z } from "zod";
import { updateStar } from "@/lib/actions";
import { ApiErrorType } from "api-client";

const GenericStarDataSchema = StarDataSchema.pick({
  name: true,
  nebula: true,
});

type GenericStarData = z.infer<typeof GenericStarDataSchema>;

interface GenericStarFormProps {
  galaxyId: string;
  starId: string;
  genericData: GenericStarData;
}

export default function GenericStarForm({
  galaxyId,
  starId,
  genericData,
}: GenericStarFormProps) {
  const form = useForm<GenericStarData>({
    resolver: zodResolver(GenericStarDataSchema),
    defaultValues: { ...genericData },
  });

  async function onSubmit(data: GenericStarData) {
    const res = await updateStar(galaxyId, starId, data);

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <Button
          type="submit"
          className="w-full"
          loading={form.formState.isSubmitting}
        >
          Update
        </Button>
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors.root?.message}
        </p>
      </form>
    </Form>
  );
}
