
![Virtuin](logo.png)

### Virtuin

This is a monorepo containing all the source of Virtuin.

Virtuin is a cross platform application that allows an operator to load, update,
run, stop, and monitor programs in an easy to use graphical interface.
It is useful for areas such as production, testing, and research. Under the hood
Virtuin uses Docker, Docker Compose, and a simple REST API to accomplish this.
Virtuin is language and platform agnostic. You can use whatever languages, platforms,
 and tools you like as long as they are supported by docker.


In a nutshell, a developer will provide a docker compose file, a list of tasks to be executed,
and data for the tasks. This will be embedded in a **collection.yml** file recognized by Virtuin.

*Tasks* are program executables in a docker service,
ready to be run with specified arguments and environment variables.
Virtuin will
 - ensure the appropriate docker services are up to date and running.
 - display the list of tasks and information for an operator to utilize.
 - when a task is run by the operator, execute the appropriate program in the correct
docker service with all necessary information described in the collection.yml.

Virtuin also provides a simple rest service so *Tasks* can
display messages, prompts, and progress in the GUI. The rest server runs inside of
 the GUI. The GUI is not bound to just one collection. It can run any Virtuin collection
 and load and unload them as necessary.

Please see
[Virtuin Documentation](docs/documentation.md)

![GUI](./release.png)

This repo contains 2 applications
- GUI *packages/virtuingui2* - use by operator or developer
- CLI *packages/cli* - can be used by developer to help build application or test

Libraries used by the applications
- Task Dispatcher *packages/virtuintaskdispatcher* - controls docker environment and maintains state of all tasks
- Rest Service *packages/task-rest-service* - rest api where running tasks can update progress and display messages and prompts.


<p id="build"></p>

#### Required to build
- node 10.11+
  [download node](https://nodejs.org/en/download/)
- yarn
  ```npm install -g yarn```

#### Build

1. first clone the repo and cd into it
2. ```yarn install```
3. ```yarn run bootstrap ```
4. ```yarn run build ```
5. ```yarn run bootstrap ``` (run twice the first time)

#### Run

 ```yarn run run:gui```

<p id="package"></p>

#### Package

Make sure you have completed *Build* steps first. To package to create an installable executable run

``` yarn run package ```

This will create an installer for the GUI. It can run on the same system it was
packaged under (Windows, Mac, Linux).
