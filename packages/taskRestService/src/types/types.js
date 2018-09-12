// @flow
export type ProduceRouterDispatch = {
  type: string,
  taskUUID : string
}

export type ProduceRouterProgress = ProduceRouterDispatch & {
  type: "progress",
  percent: number
}
export type ProduceRouterMessage = ProduceRouterDispatch & {
  type: "message",
  message: string
}

export type DispatchInput = (ProduceRouterProgress | ProduceRouterMessage)
export type DispatchWithResponseInput = (ProduceRouterProgress | ProduceRouterMessage)
export type ProduceRouterDelegate = {
  dispatch: ((DispatchInput) => void),
  dispatchWithResponse: ((DispatchWithResponseInput) => Promise<any>)
}
