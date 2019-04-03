### Virtuin

This is a monorepo containing all the source of Virtuin.

Virtuin is a cross platform application that allows an operator to load, update,
run, stop, and monitor programs in an easy to use graphical interface.
It is useful for areas such as production, testing, and research. Under the hood
Virtuin uses Docker, Docker Compose, and a simple REST API to accomplish this.
Virtuin is language and platform agnostic. You can use whatever languages, platforms,
 and tools you like as long as they are supported by docker.

Each station (or computer with an operator) will have the Virtuin GUI installed.
From the GUI the operator will load different collection.yml's locally or from a server based
on the application he/she is trying to perform. There may be a collection.env on
a station for a specific application. It will contain environment variables for possibly
login and credentials to services if needed. When a collection.yml is loaded into the
GUI it will check to see if there is a corresponding collection.env. Next the
docker environment is brought up. It will make sure the environment variables are
exposed to the docker services. Finally the operator will be able to see
all of the tasks in the GUI and begin running appropriately. When a user runs
a task, a program in a docker service is executed. Additional environment variables
and data file will be passed to it. The process will do it's work giving updates
to the operator through the simple REST API. When the process exit's the task
will be complete.     

Virtuin also provides a simple rest service so *Tasks* can
display messages, prompts, and progress in the GUI. The rest server runs inside of
 the GUI. The GUI is not bound to just one collection. It can run any Virtuin collection
 and load and unload them as necessary.

This repo contains 2 applications
- GUI *packages/virtuingui2* - use by operator or developer
- CLI *packages/cli* - can be used by developer to help build application or test

Also libraries used by the applications
- Task Dispatcher *packages/virtuintaskdispatcher* - controls docker environment and maintains state of all tasks
- Rest Service *packages/task-rest-service* - rest api where running tasks can update progress and display messages and prompts.

Please see
[Virtuin Documentation](docs/documentation.md)

![GUI](./release.png)

#### Required to build
- node 10.11+
  [download node](https://nodejs.org/en/download/)
- yarn
  ```npm install -g yarn```

#### Build and run

1. first clone the repo and cd into it
2. ```yarn install```
3. ```yarn run bootstrap ```
4. ```yarn run build ```
5. ```yarn run bootstrap ``` (run twice the first time)

#### Run

 ```yarn run run:gui```

#### Package
To package to create an installable executable run

``` yarn run package ```

This will create an installer for the GUI. It can run on the same system it was
packaged under (Windows, Mac, Linux).
