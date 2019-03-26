### Virtuin CLI

This repo contains a cli where tasks can be run directly from the command line.
Use the -h option for help. You may find this helpful while developing your project.
Follow the instructions to build using lerna from the root of this mono repo.

To run

```
node ./distribution/cli.js -h
```

#### Functions
- up : bring collection environment up (docker compose up)
- down : bring collection environment down (docker compose down)
- run : run a task at group and task index. Make sure to run up first
- sendTaskInputFile : send new /virtuin_task-[group index]-[task index].json to a running service
- getRunningLocation : get the full path to the running docker compose.
- upVM : ignore
- downVM : ignore

#### Limitations

Currently, cannot handle prompts to get input from an operator
