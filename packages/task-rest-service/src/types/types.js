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

export type ManageCommand = {
  reset?: "all" | number | [{groupIdent: number, taskIdent: number}], // number is whole group,
  disable?: "all" | number | [{groupIdent: number, taskIdent: number}], // number is whole group,
  enable?: "all" | number | [{groupIdent: number, taskIdent: number}], // number is whole group, 
}

export type ProduceRouterManage = {| ...ProduceRouterDispatch,
  type: "manage",
  commands: ManageCommand
|};

export type PRDispatchInput = ProduceRouterProgress | ProduceRouterMessage
export type PRDispatchWithResponseInput = ProduceRouterPrompt | ProduceRouterManage
export type ProduceRouterDelegate = {
  dispatch: ((PRDispatchInput) => void),
  dispatchWithResponse: ((PRDispatchWithResponseInput) => Promise<any>)
}
