// @flow
export type ProduceRouterDispatch = {|
  type: string,
|};

export type ProduceRouterProgress = {| ...ProduceRouterDispatch,
  type: "progress",
  percent: number,
  taskUUID : string
 |};
export type ProduceRouterMessage = {| ...ProduceRouterDispatch,
  type: "message",
  message: string,
  taskUUID : string
|};

export type ProduceRouterPrompt = {| ...ProduceRouterDispatch,
  type: "prompt",
  message: string,
  promptType: "confirmation" | "text" | "confirmCancel",
  taskUUID : string
|};

export type ManageGroupTasks = {|
  reset?: "all" | [], // task indexes to disable of current group
  disable?: "all" | [], // task indexes to disable of current group
  enable?: "all" | [], //task indexes to enable of current group
|}

export type ProduceRouterManage = {|
  type: "manage",
  command: ManageGroupTasks,
  taskUUID : string
|};

export type PRDispatchInput = ProduceRouterProgress | ProduceRouterMessage
export type PRDispatchWithResponseInput = ProduceRouterPrompt | ProduceRouterManage
export type ProduceRouterDelegate = {
  dispatch: ((PRDispatchInput) => void),
  dispatchWithResponse: ((PRDispatchWithResponseInput) => Promise<any>)
}
