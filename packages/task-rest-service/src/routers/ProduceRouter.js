// @flow
import { Router }  from 'express';
import debug from 'debug';
import EventEmitter from 'events'
const debugMessage = debug('vrs:producer');
import type { ProduceRouterMessage, ProduceRouterProgress, ProduceRouterDelegate } from '../types/types'

export const promiseTimeout = function(ms: number, promise: Promise<any>) {

  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject('Timed out in '+ ms + 'ms.')
    }, ms)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ])
}

export default class ProduceRouter {
  // these fields must be type annotated, or Flow will complain!
  static delegate : ?ProduceRouterDelegate;
  router: Router;
  path: string;

  // take the mount path as the constructor argument
  constructor(path: string = '/api/v1') {
    // instantiate the express.Router
    this.router = Router();
    this.path = path;
    // glue it all together
    this.init();
  }

  /**
   * Update Progress [0-100].
   */
  dispatchProgress(req: $Request, res: $Response): void {
    const progress = parseInt(req.params.progress, 10);
    const taskUUID = req.params.taskUUID;
    debugMessage(`updated progress ${progress}`);
    if (!progress || progress < 0 || progress > 100) {
      res.status(400).json({
        success: false,
        message: 'Invalid progress range. Valid [0-100]',
        received: progress
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: `Success!`,
      percent: progress
    });
    if (ProduceRouter.delegate) {
      ProduceRouter.delegate.dispatch({type: 'progress', taskUUID, percent: progress});
    }
  }
  dispatchMessages(req: $Request, res: $Response): void {
    //"Content-Type: text/plain"
    const message : string = req.body || "";
    const taskUUID = req.params.taskUUID;
    debugMessage(`new message ${message}`);
    if(typeof message !== 'string') {
      res.status(400).json({
        success: false,
        message: `Invalid body! Must be Content-Type: text/plain`,
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: `Success!`,
    });
    if (ProduceRouter.delegate) {
      ProduceRouter.delegate.dispatch({type: 'message', taskUUID, message: message});
    }
  }

  dispatchWithResponsePrompt(req: $Request, res: $Response): void {
    //"Content-Type: text/plain"
    const message = req.body || "";
    const taskUUID = req.params.taskUUID;
    const type = req.params.type;
    req.setTimeout(32000); //allow 32 seconds for response
    debugMessage(`prompt ${type} with message ${message}`);
    if(typeof message !== 'string') {
      res.status(400).json({
        success: false,
        message: `Invalid body! Must be Content-Type: text/plain`,
      });
      return;
    }
    if(type !== 'confirmation' && type !== 'confirmCancel' && type !== 'text') {
      res.status(400).json({
        success: false,
        message: `Invalid Prompt Type!`,
      });
      return;
    }
    if (ProduceRouter.delegate) {
      promiseTimeout(31000,
        ProduceRouter.delegate.dispatchWithResponse({type: 'prompt', taskUUID, message, promptType: type}))
      .then(userData => {
        res.status(200).json({
          success: true,
          userResponse: userData,
        });
      }).catch(error => {
        res.status(400).json({
          success: false,
          message: `Invalid response from user or they took to long!`,
        });
      })
    } else {
      res.status(400).json({
        success: false,
        message: `Seems like an issue with the Application!`,
      });
    }
  }

  dispatchEnableTasks(req: $Request, res: $Response): void {
    //"Content-Type: application/json"
    const message : {} = req.body || {};
    const taskUUID = req.params.taskUUID;
    const type = req.params.type;
    req.setTimeout(32000); //allow 32 seconds for response
    debugMessage(`prompt ${type} with message ${JSON.stringify(message)}`);
    if(typeof message !== 'object') {
      res.status(400).json({
        success: false,
        message: `Invalid body! Must be Content-Type: application/json`,
      });
      return;
    }
    if(type !== 'confirmation' && type !== 'confirmCancel' && type !== 'text') {
      res.status(400).json({
        success: false,
        message: `Invalid Prompt Type!`,
      });
      return;
    }
    if (ProduceRouter.delegate) {
      promiseTimeout(31000,
        ProduceRouter.delegate.dispatchWithResponse({type: 'prompt', taskUUID, message, promptType: type}))
      .then(userData => {
        res.status(200).json({
          success: true,
          userResponse: userData,
        });
      }).catch(error => {
        res.status(400).json({
          success: false,
          message: `Invalid response from user or they took to long!`,
        });
      })
    } else {
      res.status(400).json({
        success: false,
        message: `Seems like an issue with the Application!`,
      });
    }
  }

  /**
   * Attach route handlers to their endpoints.
   */
  init(): void {
    this.router.post('/progress/:taskUUID/:progress', this.dispatchProgress);
    this.router.post('/message/:taskUUID', this.dispatchMessages);
    this.router.post('/prompt/:taskUUID/:type', this.dispatchWithResponsePrompt);
    this.router.post('/manageTasks', this.dispatchWithResponsePrompt);
  }
}
ProduceRouter.delegate = null;
