import * as  path from 'path';
import { execFile, execSync } from 'child_process';
import * as  dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import * as  chalk from 'chalk';
import * as  os from 'os';
import * as  fs from 'fs';
import { ResolvedConfig, ViteDevServer, UserConfig } from 'vite';

const fileRegex = /\.go$/;
const getGoBin = (root: string) => `${root}/bin/go`;

export interface WasmGoOption {
  GOPATH?: string;
  GOROOT?: string;
  GOCACHE?: string;
}
export default function wasmGo(option: WasmGoOption) {
  const config = dotenv.parse(
    execSync('go env').toString().replace(/set\s/gi, '')
  );
  const { GOPATH = config.GOPATH, GOROOT = config.GOROOT } = option;
  if (!GOROOT) {
    throw new Error('process.env.GOROOT is undefined, please provide GOROOT');
  }
  if (!GOPATH) {
    throw new Error('process.env.GOPATH is undefined, please provide GOPATH');
  }

  let buildConfig: ResolvedConfig;

  const map = new Map<string, string>();

  let isDevelopment = false;
  return {
    name: 'vite-plugin-wasm-go',
    config(config: UserConfig, env: { mode: string, command: 'serve' | 'build'; }) {
      if (env.command === 'serve') {
        isDevelopment = true;
      }
    },
    configResolved: (config: ResolvedConfig) => {
      buildConfig = config;
    },
    transform(source: string, filePath: string) {
      if (fileRegex.test(filePath)) {
        const filename = path.posix.basename(filePath, '.go');
        const opts = {
          env: {
            GOPATH,
            GOROOT,
            GOCACHE: path.resolve(process.cwd(), 'node_modules', '.gocache'),
            GOOS: 'js',
            GOARCH: 'wasm',
          },
        };
        const goBin = getGoBin(GOROOT);


        const goWasmDir = path.posix.join(
          buildConfig.build.assetsDir,
          'wasm'
        );


        const tempFile = path.posix.join(os.tmpdir(), `${filename}.wasm`);
        const args = ['build', '-o', tempFile, filePath];
        const outputFile = path.posix.join(goWasmDir, `${filename}.wasm`);
        execFile(goBin, args, opts, (err) => {
          if (err) {
            console.log(chalk.red(err));
          } else {
            map.set(outputFile, readFileSync(tempFile) as any);
          }
        });
        return {
          code: `

          import loadGoWasm from "load-go-wasm";
          const wasmPromise = loadGoWasm("${outputFile}");
          export default wasmPromise;
          `,
          map: null,
        };
      }
    },
    configureServer(server: ViteDevServer) {

      server.middlewares.use((req, res, next) => {
        const url = req.url?.replace(/^\//, '') || '';
        if (map.get(url)) {
          res.writeHead(200, {
            'Content-Type': "application/wasm"
          });
          res.end(map.get(url));
          return;
        }
        next();
      });
    },
    closeBundle() {
      map.forEach((value, key) => {
        const buildFilename = path.posix.join(
          buildConfig.build.outDir,
          key
        );
        mkdirsSync(path.dirname(buildFilename));
        writeFileSync(buildFilename, value);
      });
    }
  };
}


function mkdirsSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}