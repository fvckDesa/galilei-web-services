#!/usr/bin/env -S pnpm tsx
import { globby, minimist, spinner } from "zx";
import { $$, Logger } from "./utils";

const log = new Logger({ tag: "post" });

const { force } = minimist(process.argv.slice(2), {
  boolean: ["force"],
  alias: {
    f: "force",
  },
  default: {
    force: false,
  },
});

const envSamples = await globby("**/.env*.sample", {
  gitignore: true,
});

for (const sample of envSamples) {
  const envFilePath = sample.replace(/\.sample$/, "");
  if (force || (await $$.dbg`file -f ${envFilePath}`.exitCode) !== 0) {
    log.info(
      force ? `Force regenerate ${envFilePath}` : `Missing ${envFilePath}`
    );
    await spinner(
      `Creating ${envFilePath}...`,
      () => $$.dbg`cp ${sample} ${envFilePath}`
    );
    log.success(`Env file ${envFilePath} created`);
  } else {
    log.info(`Env file ${envFilePath} found`);
  }
}
