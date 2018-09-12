// @ flow

import { Router }  from 'express';
import debug from 'debug';
import EventEmitter from 'events'
const debugMessage = debug('vrs:producer');
import type { ProduceRouterMessage, ProduceRouterProgress, ProduceRouterDelegate } from './types/types'


export default class ProduceRouter {
  // these fields must be type annotated, or Flow will complain!
  static delegate : ?ProduceRouterDelegate;
  router: Router;
  path: string;
  delegate: ?ProduceRouterDelegate

  // take the mount path as the constructor argument
  constructor(path = '/api/v1/virtuin') {
    // instantiate the express.Router
    this.router = Router();
    this.path = path;
    // glue it all together
    this.init();
  }

  /**
   * Update Progress [0-100].
   */
  updateProgress(req: $Request, res: $Response): void {
    const progress = parseInt(req.params.progress, 10);
    const taskUUID = req.params.taskUUID;
    debugMessage(`updated progress ${progress}`);
    if (!progress || progress < 0 || progress > 100) {
      res.status(400).json({
        status: res.status,
        message: 'Invalid progress range. Valid [0-100]',
        received: progress
      });
      return;
    }
    res.status(200).json({
      status: res.status,
      message: `Success!`,
      percent: progress
    });
    if (ProduceRouter.delegate) {
      ProduceRouter.delegate.messageHandle({type: 'progress', taskUUID, percent: progress});
    }
  }

  /**
   * Attach route handlers to their endpoints.
   */
  init(): void {
    this.router.put('/progress/:taskUUID/:progress', this.updateProgress);
  }
}
ProduceRouter.delegate = null;
