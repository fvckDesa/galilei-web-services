"use client";

import {
  StarVariable,
  StarVariableData,
  StarVariableDataSchema,
} from "@/lib/schema";
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

export interface EnvStarFormProps {
  galaxyId: string;
  starId: string;
  vars: StarVariable[];
}

export default function EnvStarForm({
  galaxyId,
  starId,
  vars,
}: EnvStarFormProps) {
  const form = useForm<StarVariableData>({
    resolver: zodResolver(StarVariableDataSchema),
    defaultValues: {
      name: "",
      value: "",
    },
  });

  async function onSubmit(newVar: StarVariableData) {
    if (vars.some(({ name }) => newVar.name === name)) {
      form.setError("name", {
        type: "validate",
        message: "Var name must be unique",
      });
      return;
    }

    await addStarVariable(galaxyId, starId, newVar);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full items-center gap-4"
      >
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
        <Button type="submit" size="icon" loading={form.formState.isSubmitting}>
          <Plus />
        </Button>
      </form>
    </Form>
  );
}
