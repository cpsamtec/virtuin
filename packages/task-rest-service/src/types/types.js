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

export type ProduceRouterPrompt = {| ...ProduceRouterDispatch,
  type: "prompt",
  message: string,
  promptType: "confirmation" | "text" | "confirmCancel"
|};

export type PRDispatchInput = ProduceRouterProgress | ProduceRouterMessage
export type PRDispatchWithResponseInput = ProduceRouterPrompt
export type ProduceRouterDelegate = {
  dispatch: ((PRDispatchInput) => void),
  dispatchWithResponse: ((PRDispatchWithResponseInput) => Promise<any>)
}
