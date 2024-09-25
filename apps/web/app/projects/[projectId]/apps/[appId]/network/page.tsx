"use client";

import { useFormContext } from "react-hook-form";
import { PartialAppServiceSchemaMod } from "../schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import CopyButton from "@/components/copy-button";
import { getPublicUrl } from "@/lib/utils";

export default function AppNetwork() {
  const { control } =
    useFormContext<z.infer<typeof PartialAppServiceSchemaMod>>();
  return (
    <>
      <FormField
        control={control}
        name="port"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Container Port</FormLabel>
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
        control={control}
        name="publicDomain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Public http networking</FormLabel>
            <div className="flex items-center gap-4">
              <FormControl>
                <Input type="string" autoComplete="off" {...field} />
              </FormControl>
              <CopyButton
                text={field.value ? getPublicUrl(field.value) : ""}
                message="Public url copied!"
                disabled={!field.value}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
