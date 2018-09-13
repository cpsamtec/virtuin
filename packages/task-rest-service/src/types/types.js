// @flow
export type ProduceRouterDispatch = {|
  type: string,
  taskUUID : string
|};

export type ProduceRouterProgress = {| ...ProduceRouterDispatch,
  type: "progress",
  percent: number
 |};
export type ProduceRouterMessage = {| ...ProduceRouterDispatch,
  type: "message",
  message: string
|};

export type PRDispatchInput = ProduceRouterProgress | ProduceRouterMessage
export type PRDispatchWithResponseInput = ProduceRouterMessage
export type ProduceRouterDelegate = {
  dispatch: ((PRDispatchInput) => void),
  dispatchWithResponse: ((PRDispatchWithResponseInput) => Promise<any>)
}
