"use client";

import { StarVariableData, StarVariableDataSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { addStarVariable } from "@/lib/actions";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { ApiErrorType } from "api-client";

export interface EnvStarFormProps {
  galaxyId: string;
  starId: string;
}

export default function EnvStarForm({ galaxyId, starId }: EnvStarFormProps) {
  const form = useForm<StarVariableData>({
    resolver: zodResolver(StarVariableDataSchema),
    defaultValues: {
      name: "",
      value: "",
    },
  });

  async function onSubmit(newVar: StarVariableData) {
    const res = await addStarVariable(galaxyId, starId, newVar);

    if (res && "error" in res) {
      switch (res.error.status_code) {
        case ApiErrorType.AlreadyExists:
          form.setError("name", {
            type: "response",
            message: "Name must be unique",
          });
          break;
        default:
          form.setError("root", {
            type: "response",
            message: "Oops.. Something went wrong",
          });
      }
    } else {
      form.reset({
        name: "",
        value: "",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="flex w-full items-center gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage fixed />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage fixed />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="icon"
            loading={form.formState.isSubmitting}
          >
            <Plus />
          </Button>
        </div>
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors.root?.message}
        </p>
      </form>
    </Form>
  );
}
