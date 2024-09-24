"use client";

import CopyButton from "@/components/copy-button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getPublicUrl } from "@/lib/utils";
import { TPartialAppServiceSchema } from "@gws/api-client";
import { useFormContext } from "react-hook-form";

export default function AppPage() {
  const { control } = useFormContext<TPartialAppServiceSchema>();

  return (
    <>
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
      <FormField
        control={control}
        name="public_domain.subdomain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Public http subdomain</FormLabel>
            <div className="flex items-center gap-4">
              <FormControl>
                <Input
                  type="string"
                  autoComplete="off"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.length === 0 ? undefined : e.target.value
                    )
                  }
                />
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
