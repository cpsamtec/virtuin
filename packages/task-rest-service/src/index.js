// @flow

'use strict'

import * as http from 'http';
import debug from 'debug';
import type { Debugger } from 'debug';
import Api from './Api';
import type { ProduceRouterDelegate } from './types/types';

//export * from './types/types';

// ErrnoError interface for use in onError
declare interface ErrnoError extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
}

export default class RestServer {
  logger: Debugger;
  app: Api;
  port: number;
  // $FlowFixMe: express libdef issue
  server: http.Server;
  listeningPromise : Promise<[string, number]> & {resolve : any, reject : any};

  constructor() {
    //$FlowFixMe
    this.logger = debug('vrs');
    this.app = new Api();
    this.port = this.normalizePort(process.env.PORT) || 0;
    // $FlowFixMe: express libdef issue
    this.server = http.createServer(this.app.express);
    this.listeningPromise = this.defer();
  }
  defer() : Promise<any> & {resolve : any, reject : any} {
  	var res, rej;
    let promise = new Promise((resolve, reject) => {
  		res = resolve;
  		rej = reject;
  	});
    //$FlowFixMe
  	promise.resolve = res;
    //$FlowFixMe
  	promise.reject = rej;

    //$FlowFixMe
  	return promise;
  }
  normalizePort(val: any): ?number {
    let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;

    if (port && isNaN(port)) return port;
    else if (port >= 0) return port;
    else return null;
  }

  onError(error: ErrnoError): void {
    if (error.syscall !== 'listen') throw error;
    let bind: string = (typeof this.port === 'string') ? `Pipe ${this.port}` : `Port ${this.port.toString()}`;

    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        //process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        //process.exit(1);
        break;
      default:
        break;
    }
    this.listeningPromise.reject(error);
  }

  onListening(): void {
    const addr: Object = this.server.address();
    this.listeningPromise.resolve([addr.address, parseInt(addr.port)]);
    this.logger(`Listening on ${addr.port}`);
  }

  begin(): void {
    this.server.listen(this.port);
    this.server.on('error', this.onError.bind(this));
    this.server.on('listening', this.onListening.bind(this));
  }
  static setProducerDelegate(delegate : ?ProduceRouterDelegate) {
    Api.setProducerDelegate(delegate);
  }
  getAddressAndPort() : Promise<[string, number]> {
    return this.listeningPromise;
  }
  end(): void {
    this.server.close();
  }
}

if (require.main === module) {
  console.log('begin');
  let restServer : RestServer = new RestServer();
  restServer.begin();
  let d: ProduceRouterDelegate = {
    dispatch: (o): void => {
      console.log(`called dispatch: received ${o.type} for ${o.taskUUID}`);
    },
    dispatchWithResponse: (o): Promise<any> => {
      console.log(`called dispatchWithResponse: received ${o.type} for ${o.taskUUID}`);
      return new Promise((res, rej) => {
        res(true);
      });
    }
  }
  RestServer.setProducerDelegate(d);
  restServer.getAddressAndPort().then(([address: string, port: number]) => {
    console.log(`in here listening ${address} -- ${port}`);
  }).catch((error) => {
    console.log(`error listening ${error.code}`);
    process.exit(1);
  });
  process.on('SIGINT', () => {
    restServer.end();
    process.exit(0);
  });

  process.on('exit', (code) => {
    restServer.end();
  });
}
