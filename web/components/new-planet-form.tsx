"use client";

import { PlanetData, PlanetDataSchema, Star } from "@/lib/schema";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { newPlanet } from "@/lib/actions";
import { DialogFooter } from "./ui/dialog";
import { ApiErrorType } from "api-client";

interface PlanetFormProps {
  galaxyId: string;
  stars: Star[];
  afterSubmit?: () => void;
}

const DISCONNECTED_VALUE = "disconected" as const;

export default function NewPlanetForm({
  galaxyId,
  stars,
  afterSubmit,
}: PlanetFormProps) {
  const form = useForm<PlanetData>({
    resolver: zodResolver(PlanetDataSchema),
    defaultValues: {
      name: "",
      capacity: 5,
      path: "",
      star_id: "",
    },
  });

  async function onSubmit(data: PlanetData) {
    const res = await newPlanet(galaxyId, data);

    if (res && "error" in res) {
      switch (res.error.status_code) {
        case ApiErrorType.AlreadyExists:
          form.setError("root", {
            type: "response",
            message: "Invalid name or path",
          });
          break;
        default:
          form.setError("root", {
            type: "response",
            message: "Oops.. Something went wrong",
          });
      }
    } else {
      afterSubmit?.();
    }
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
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input type="number" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Path</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="star_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Star</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={
                  field.value === DISCONNECTED_VALUE ? undefined : field.value
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a star to connect planet with" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={DISCONNECTED_VALUE}>No one</SelectItem>
                  <SelectGroup>
                    <SelectLabel>Stars</SelectLabel>
                    {stars.map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" loading={form.formState.isSubmitting}>
            Create
          </Button>
        </DialogFooter>
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors.root?.message}
        </p>
      </form>
    </Form>
  );
}
