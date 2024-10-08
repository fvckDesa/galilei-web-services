"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Page } from "@/lib/types";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { AppServiceSchema, TAppService } from "@gws/api-client";
import { updateApp } from "@/server-actions/app";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResourceContent,
  ResourceUpdateButton,
  useResource,
} from "@/components/resource";
import { useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Info,
  MinusCircle,
  PlusCircle,
  SquareArrowOutUpRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getPublicUrl, HOST_PUBLIC_DOMAIN } from "@/lib/utils";
import CopyButton from "@/components/copy-button";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage({
  params: { projectId, appId },
}: Page<{
  projectId: string;
  appId: string;
}>) {
  const {
    resource: { app, hasVolume },
  } = useResource<{ app: TAppService; hasVolume: boolean }>();

  const formId = useId();

  const {
    form,
    handleSubmitWithAction,
    action: { reset: resetAction },
  } = useHookFormAction(
    updateApp.bind(null, projectId, appId),
    zodResolver(AppServiceSchema),
    {
      formProps: {
        reValidateMode: "onBlur",
        defaultValues: {
          ...app,
          publicDomain: {
            subdomain: app.publicDomain,
          },
          privateDomain: {
            subdomain: app.privateDomain,
          },
        },
      },
    }
  );

  const [pubNetActive, setPubNetActive] = useState(!!app.publicDomain);
  const [privNetActive, setPrivNetActive] = useState(!!app.privateDomain);

  useEffect(() => {
    resetAction();
    form.reset({
      ...app,
      publicDomain: { subdomain: app.publicDomain },
      privateDomain: { subdomain: app.privateDomain },
    });
  }, [app, form, resetAction]);

  function handlePubNetCheck(checked: boolean) {
    if (checked) {
      if (app.publicDomain) {
        form.resetField("publicDomain.subdomain");
      } else {
        form.setValue("publicDomain.subdomain", "", { shouldDirty: true });
      }
    } else {
      form.setValue("publicDomain.subdomain", undefined, { shouldDirty: true });
      form.clearErrors("publicDomain.subdomain");
    }
    setPubNetActive(checked);
  }

  function handlePrivNetCheck(checked: boolean) {
    if (checked) {
      if (app.privateDomain) {
        form.resetField("privateDomain.subdomain");
      } else {
        form.setValue("privateDomain.subdomain", "", { shouldDirty: true });
      }
    } else {
      form.setValue("privateDomain.subdomain", undefined, {
        shouldDirty: true,
      });
      form.clearErrors("privateDomain.subdomain");
    }
    setPrivNetActive(checked);
  }

  return (
    <ResourceContent>
      <Form {...form}>
        <form
          id={formId}
          className="flex flex-col gap-4"
          onSubmit={handleSubmitWithAction}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>App name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="off"
                    disabled={app.deleted}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Container image</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="off"
                    disabled={app.deleted}
                    {...field}
                  />
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
                <FormLabel>Container port</FormLabel>
                <FormControl>
                  <Input
                    type="string"
                    autoComplete="off"
                    disabled={app.deleted}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0", 10))
                    }
                    value={field.value === 0 ? "" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="replicas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Container Replicas</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      icon={<MinusCircle />}
                      disabled={field.value <= 0 || app.deleted || hasVolume}
                      onClick={() =>
                        field.onChange(Math.max(field.value - 1, 0))
                      }
                    />
                    <span className="block size-6 text-center">
                      {hasVolume ? 1 : field.value}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      icon={<PlusCircle />}
                      disabled={field.value >= 5 || app.deleted || hasVolume}
                      onClick={() =>
                        field.onChange(Math.min(field.value + 1, 5))
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {hasVolume ? (
            <Alert variant="info">
              <Info />
              <AlertTitle>Container replicas set to 1</AlertTitle>
              <AlertDescription>
                When app is connected to a volume the number of container
                replicas is set to 1 for prevent data corruption and others bad
                things
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="flex h-10 items-center gap-2">
            <Switch
              id="publicNetworking"
              type="button"
              onCheckedChange={handlePubNetCheck}
              checked={pubNetActive}
              disabled={app.deleted}
            />
            <Label htmlFor="publicNetworking">Public Http Networking</Label>
            {pubNetActive && app.publicDomain ? (
              <Link href={getPublicUrl(app.publicDomain)} target="_blank">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={!app.publicDomain}
                  icon={<SquareArrowOutUpRight />}
                />
              </Link>
            ) : null}
          </div>
          {pubNetActive ? (
            <FormField
              control={form.control}
              name="publicDomain.subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain</FormLabel>
                  <div className="flex items-end gap-1">
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="off"
                        disabled={app.deleted}
                        {...field}
                      />
                    </FormControl>
                    <p className="p-2">.{HOST_PUBLIC_DOMAIN}</p>
                    <CopyButton
                      className="shrink-0"
                      disabled={!app.publicDomain}
                      text={
                        app.publicDomain
                          ? `${app.publicDomain}.${HOST_PUBLIC_DOMAIN}`
                          : ""
                      }
                      message={`${app.name} http public domain copied`}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <div className="flex h-10 items-center gap-2">
            <Switch
              id="internalNetworking"
              type="button"
              onCheckedChange={handlePrivNetCheck}
              checked={privNetActive}
              disabled={app.deleted}
            />
            <Label htmlFor="internalNetworking">Internal Networking</Label>
          </div>
          {privNetActive ? (
            <FormField
              control={form.control}
              name="privateDomain.subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain</FormLabel>
                  <div className="flex items-end gap-1">
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="off"
                        disabled={app.deleted}
                        {...field}
                      />
                    </FormControl>
                    <p className="p-2">.{HOST_PUBLIC_DOMAIN}</p>
                    <CopyButton
                      className="shrink-0"
                      disabled={!app.privateDomain}
                      text={
                        app.privateDomain
                          ? `${app.privateDomain}.${HOST_PUBLIC_DOMAIN}`
                          : ""
                      }
                      message={`${app.name} internal domain copied`}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          {!app.deleted ? (
            <ResourceUpdateButton
              form={formId}
              loading={form.formState.isSubmitting}
              disabled={!form.formState.isDirty}
            />
          ) : null}
        </form>
      </Form>
    </ResourceContent>
  );
}
