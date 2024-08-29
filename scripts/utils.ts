import { $, chalk, minimist, which } from "zx";

export async function checkDependencies(cmd: string | string[]) {
  const cmdArr = Array.isArray(cmd) ? cmd : [cmd];

  const results = await Promise.allSettled(
    cmdArr.map(async (cmd) => {
      const path = await which(cmd, { nothrow: true });

      if (path == null) {
        throw cmd;
      }

      return path;
    })
  );

  const missingDeps = results
    .filter(
      (result): result is PromiseRejectedResult => result.status === "rejected"
    )
    .map(({ reason }) => reason);

  if (missingDeps.length > 0) {
    throw new Error(`missing dependencies ${missingDeps.join(", ")}`);
  }

  return;
}

type DeepPartial<T> = {
  [K in keyof T]?: Partial<T[K]>;
};

export type LogLevel = "success" | "info" | "error";

interface LoggerOptions {
  tag: string;
  colors: {
    [L in LogLevel]: typeof chalk;
  };
}

type LoggerMethods = {
  [L in LogLevel]: (text: string) => void;
};

export class Logger implements LoggerMethods {
  private options: LoggerOptions;

  constructor(options: DeepPartial<LoggerOptions>) {
    this.options = {
      tag: options.tag ?? "script",
      colors: {
        success: chalk.green,
        info: chalk.blue,
        error: chalk.red,
        ...(options.colors ?? {}),
      },
    };
  }

  private formatMessage(level: LogLevel, message: string) {
    const color = this.options.colors[level] ?? "info";
    return `${chalk.bold(color(`[${this.options.tag}]`))} ${message}`;
  }

  success(text: string) {
    console.log(this.formatMessage("success", text));
  }

  info(text: string) {
    console.log(this.formatMessage("info", text));
  }

  error(text: string) {
    console.error(this.formatMessage("error", text));
  }
}

const { verbose, debug } = minimist(process.argv.slice(2), {
  boolean: ["verbose", "debug"],
  alias: {
    v: "verbose",
  },
  default: {
    verbose: false,
    debug: false,
  },
});

const verbose$ = $({
  quiet: !verbose,
  verbose: verbose,
});

const $$ = Object.assign(verbose$, {
  dbg: $({
    quiet: !debug,
    verbose: debug,
  }),
});

export { $$ };
