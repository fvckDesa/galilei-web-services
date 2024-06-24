"use client";

import { PlanetDataSchema, Star } from "@/lib/schema";
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
import { z } from "zod";
import { updatePlanet } from "@/lib/actions";
import { ApiErrorType } from "api-client";

const GenericPlanetDataSchema = PlanetDataSchema.pick({
  name: true,
  star_id: true,
});

type GenericPlanetData = z.infer<typeof GenericPlanetDataSchema>;

interface PlanetFormProps {
  galaxyId: string;
  planetId: string;
  stars: Star[];
  genericData: GenericPlanetData;
}

const DISCONNECTED_VALUE = "disconected" as const;

export default function GenericPlanetForm({
  galaxyId,
  planetId,
  stars,
  genericData,
}: PlanetFormProps) {
  const form = useForm<GenericPlanetData>({
    resolver: zodResolver(GenericPlanetDataSchema),
    defaultValues: { ...genericData },
  });

  async function onSubmit(data: GenericPlanetData) {
    const res = await updatePlanet(galaxyId, planetId, data);

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
