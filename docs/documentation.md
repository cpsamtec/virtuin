## Virtuin Documentation

### General process

Each station (or computer with an operator) will have Virtuin GUI, Docker, and Docker Compose installed.
From the GUI the operator will load different **collection.yml**'s locally or remotely, based
on the application he/she is trying to perform. There may be a collection.env on
a station associated with the **collection.yml**. It will contain environment variables for
login and credentials to services, if needed. When a collection.yml is loaded into the
 GUI Virtuin will

- check to see if there is a corresponding collection.env and load.
- ensure latest docker images are up to date.
- bring the docker environment up.
- make sure the environment variables are exposed to the docker services.

Finally the operator will be able to see
all of the tasks in the GUI and begin running appropriately. When a user runs
a task

- a program in a docker service is executed.
- additional environment variables and data file will be passed to it.
- the process will run giving updates to the operator through the simple REST API.
- the GUI will display a web view to a web service running in the docker environment
or remotely if one is specified by a *Task*. (optional *viewURL*)

 When the process exit's the task will be complete.     


### Installation

To begin a new Virtuin project make sure you have the following installed
- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Recommended to add global environment variable on your system VIRT_STATION_NAME. You can
  just set this to VIRT_DEFAULT_STATION to begin with.
  ```bash
  export VIRT_STATION_NAME=VIRT_DEFAULT_STATION
  ```
  It becomes important to have unique values for VIRT_STATION_NAME when you have
  multiple stations.
- Build and install the GUI Application. See [README](../README.md#build)

#### Virtuin Starter (Boilerplate for development)

It is also recommended you clone the following boilerplate to get started.
[Virtuin Starter](https://github.com/cpsamtec/virtuin-starter)

#### Developing

An application in development will generally contain
- collection.env
  * Contains environment variables specific to the current station and project
  * For example, store Docker or AWS credentials to be used by your tasks.  
  * The file must be exactly named collection.env
- src directory for your code for development.
  * This will contain subdirectories for various
  docker services each containing a Dockerfile
  * When released these will be pushed as docker images.
  * Example structure
  ```bash
        src
        ├── one
        │   ├── Dockerfile
        │   └── run.py
        └── two
            ├── Dockerfile
            └── run.py
  ```
- collection.yml
  * The heart of a project.
  * Contains the docker-compose file
  * Describes all of your tasks and how to run them
  * Lists all of the system locations of each stations environment file (collection.env)
  associated with this collection.yml
  * Will be loaded by the GUI to run your tasks
  * Can be shared across multiple stations

### Details of collection.env and collection.yml
#### collection.env [Optional]
```env
  VIRT_GUI_SERVER_ADDRESS=host.docker.internal
  VIRT_DOCKER_HOST=unix:///var/run/docker.sock
  #VIRT_DOCKER_USER=XXXXX
  #VIRT_DOCKER_PASSWORD=XXXXX
  #Below environment variables to be set for your tasks
  #AWS_SECRET_ACCESS_KEY=XXXXX
  #AWS_ACCESS_KEY_ID=XXXXX
```
The collection.yml will need to specify the location of it's corresponding
collection.env for each machine. If one does not exist the default values are used.
You will want to store any credentials for services your tasks will use in
the collection.env.

__VIRT_COLLECTION_ENV_PATH__ will be exposed to your docker environment set to the
path of your collection.env file. During development you can set it on your
system, however it is recommended to store the paths to your collection.env files
in the __stationCollectionEnvPaths__ of your collection.yml.

Virtuin variables in collection.env
- VIRT_DOCKER_HOST - Tells Virtuin how to access your desired Docker server.
 This is the machine the actual services are run on. Typically
 unix:///var/run/docker.sock when docker is running on
 the same machine as Virtuin. If you are running docker on a different machine
 you can change accordingly. Default **unix:///var/run/docker.sock**
- VIRT_GUI_SERVER_ADDRESS - The ip address of the machine running Virtuin GUI. You
will most likely set to or leave as host.docker.internal, as you will have the Virtuin
application and docker running on the same machine. Note: localhost and 127.0.0.1
will not reach your host from a docker container even when the network_mode is
set to host. If host.docker.internal does not work enter the ip of your
machine directly (ex. 192.168.x.x) Default **host.docker.internal**
- VIRT_DOCKER_USER (optional) - Virtuin will pull your required docker images. If you need
to login for private images, supply your Docker Hub username here.
- VIRT_DOCKER_PASSWORD (optional) - Docker Hub password to match VIRT_DOCKER_USER

You can specify additional environment variables that you would like to be available
to your Docker containers and environment. Make sure they are also specified in the **environment**
key of your collection.yml dockerCompose services.

#### collection.yml [Required]
```yaml
collectionName: Virtuin_Example
collectionTag: v0.0.2
build: development
taskGroups:
- name: Group One
  description: Description of the first group of tasks
  autoStart: false
  mode: user
  tasks:
  - name: First in Sequence
    description: Description of the current example process
    dockerInfo:
      serviceName: example-one
      command: python3.7
      type: exec
      args:
      - /usr/src/app/run.py
    data:
      helloMessage: Hello from the first process of the starter
      virt_stations:
        VIRT_DEFAULT_STATION:
          count: 5
          helloMessage: This overrides the helloMessage in the default station
    viewURL: http://localhost:3000
stationCollectionEnvPaths:
  VIRT_DEFAULT_STATION: "/station's/full/path/to/this/directory"
dockerCompose:
  source:
    version: '3'
    services:
      output-server:
        image: nginx
        network_mode: bridge
        ports:
        - 8080:80
        volumes:
        - outputFiles:/usr/share/nginx/html:ro
      example-one:
        build: ${VIRT_COLLECTION_ENV_PATH}/src/one
        network_mode: host
        command:
        - bash
        - -c
        - 'trap : TERM INT; sleep infinity & wait'
        volumes:
        - ${VIRT_COLLECTION_ENV_PATH}/src:/src
        - outputFiles:/outputFiles
        environment:
        - VIRT_STATION_NAME
        - VIRT_GUI_SERVER_ADDRESS
        - VIRT_REST_API_PORT
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
    volumes:
      outputFiles:

```

The collection.yml contains
- **collectionName** : make sure this is unique among your other collections as
it is used to identify them.
- **collectionTag** : string version you assign to collection. When you update this
Virtuin will try pulling and rebuilding images
- **build** :  __development__ or __release__. In development mode GUI will display
extra components to help such as stdout and stderr of your tasks.
- **dockerCompose** : embedded docker compose file
  - source : the actual source of the docker compose file. Please see the [docker
  website](https://docs.docker.com/compose/compose-file/) for more information about docker and docker compose files.
  - not all of you services will have tasks to run. Some of them may be helpers to
  display a custom web interface or serve static files.
  - services with tasks should run the following command so that it
   waits for Virtuin to execute programs  
  ```
    command:
    - bash
    - -c
    - 'trap : TERM INT; sleep infinity & wait'
  ```
  - services with tasks should have the following in environment keys
      + VIRT_STATION_NAME
      + VIRT_GUI_SERVER_ADDRESS
      + VIRT_REST_API_PORT
- **taskGroups** : describes all your your tasks arranged into groups. It consists of
  - name : descriptive name of the group
  - description: more information about the function of the group
  - autoStart: if true when the collection is loaded for the first time the first task
  will be immediatly executed. Default __false__
  - mode: __user__ or __managed__. In __user__ mode the operator can run
  any tasks in any order and reset the statuses of tasks in a group.
  In __managed__ your task on completion will
  inform the GUI via a rest api, which tasks are able enabled and which
  statuses should be reset. Default __user__
  - **stationCollectionEnvPaths** : an object where the keys are station names
  (VIRT_STATION_NAME) and the values are a file path to a collection.env on a station.
  If the current station name matches a key, the corresponding path will be used to read the
  collection.env. The variable VIRT_COLLECTION_ENV_PATH will also be set
  to this path which is useful to specify where your source files are while developing.
  - **tasks** : list of Task objects. Only one task can execute at a time in a group.
    - name : descriptive name of the task
    - description: more information about the function of the task
    - data: (optional) key value pairs of data you would like passed to your task. The special key
    virt_stations is an object with keys of station names (VIRT_STATION_NAME).  
    The value of each is an object of data. If the current station name matches it will take the
    corresponding data and merge it into the general data. Data from the general will be
    overwritten if the are any duplicate keys.
    - dockerInfo: how Virtuin is to execute your program in a running docker service.
      - serviceName: The name of the docker service
      - command: the command to run
      - type: always set to exec for now
      - args: list of arguments to pass to the command
    - viewURL: (optional) if you would like to display a custom view in the GUI reference the
    url of a web server running in a docker service or remotely.

### Tasks

#### Environment Variables

All of the environment variables specified in collection.env and the environment
key of your docker compose will be available to your tasks. There will also be
additional variables prefixed with VIRT

- **VIRT_TASK_INPUT_FILE** : Value will contain the file path to a json file
with all of the data for the task. This file is generated and copied to your
service and takes the form "/virtuin_task-[group index]-[task index].json" There
is more information in the Data section below.
- **VIRT_REST_API_PORT** : the port of the rest server running in the GUI where
tasks can send and request information
- **VIRT_GUI_SERVER_ADDRESS** : the address of the machine the GUI is running on.
Will most likely be **localhost** if the GUI is running on the same machine as Docker
and the network_mode is bridged or set to host.
- **VIRT_COLLECTION_ENV_PATH** : the system path to the directory of the collection.env on the station.
You can also use this to create a relative path to your source files while you are
developing your tasks.
For example
```yaml
dockerCompose:
  source:
    version: '3'
    services:
      example-one:
        build: ${VIRT_COLLECTION_ENV_PATH}/src/one
```
Directory __one__ exists in directory __src__ a subdirectory to the location of collection.env.
The directory __one__ will contain source files and a Dockerfile to build.
You can even mount your source files on a running service as followed
```yaml
dockerCompose:
  source:
    version: '3'
    services:
      example-one:
        build: ${VIRT_COLLECTION_ENV_PATH}/src/one
        volumes:
        - ${VIRT_COLLECTION_ENV_PATH}/src:/src
        - /tmp/outputFiles:/outputFiles
```
The volumes section of *example-one* uses VIRT_COLLECTION_ENV_PATH so the
src directory will be mounted inside of the service.


#### Data

Data from your collection.yml will be placed in a file on a task's corresponding
service filesystem. Check __VIRT_TASK_INPUT_FILE__ in your executable to get the full path.
It should be located at the root directory
/virtuin_task-[group index]-[task index].json. The
indexes start at 0, based on their location in the collection.yml. First task of
first group would be /virtuin_task-0-0.json. It will contain a json object with
the following content

  - data: (object) data from collection.yml
  - taskUUID: (string) UUID for current running task. This will change for every run.
    This will be needed for the rest api to identify the requesting task.
  - groupIndex: (number) group index of current task,
  - taskIndex: (number) task index of current task,
  - allTasksInfo: (array of objects) current status of all the tasks in the same group
      - name: name of task,
      - enabled: is task enabled,
      - state: state of task
        - 'IDLE'
        - 'START_REQUEST'
        - 'RUNNING'
        - 'KILLED'
        - 'STOP_REQUEST'
        - 'FINISHED';
      - taskUUID: UUID of task or null if has not run yet or status had been reset,
      - groupIndex: group index of task (should be same as current),
      - taskIndex: index of task
      - progress: progress of task 0 - 100. Will be 0 if the Rest API is not used to
      update the progress.

##### Example

```json
{
  "data": {
    "helloMessage": "This is the new Hello Message from the Example Collection",
    "hostOSName": "posix"
  },
  "taskUUID": "60ac1733-1346-4732-9197-f72a1ebb1181",
  "groupIndex": 0,
  "allTasksInfo": [
    {
      "name": "First in Sequence",
      "enabled": true,
      "state": "START_REQUEST",
      "taskUUID": "60ac1733-1346-4732-9197-f72a1ebb1181",
      "groupIndex": 0,
      "taskIndex": 0,
      "progress": 0
    }
  ]
}
```


### Rest API


In order to communicate with the GUI you can make requests to it's
rest server over http. To get the host and port use the environment variables
__VIRT_GUI_SERVER_ADDRESS__ and __VIRT_REST_API_PORT__ respectively. Make sure these
variables are exposed in your docker compose environment key.
The urls will require the **taskUUID** which can be found in the current Virtuin
task input file. Use the environment variable __VIRT_TASK_INPUT_FILE__
the get the location (*/virtuin_task-[group index]-[task index].json*).

Each route will respond with
- status code 200 success
- status code 400+ error
```
Content-Type: application/json
{
  "success": boolean,
  "message": string,
}
```


```
REST_SERVER=VIRT_GUI_SERVER_ADDRESS:VIRT_REST_API_PORT
```
- **POST http://REST_SERVER/api/v1/progress/:taskUUID/:progress**
  * will update the task's progress bar in the GUI
  * progress is a number 0 - 100
  * no body is required


- **POST http://REST_SERVER/api/v1/message/:taskUUID**

  * will display a message for the operator in the corresponding section of the GUI
  * use header *Content-Type: text/plain*
  * body will contain the message to be output in the GUI


- **POST http://REST_SERVER/api/v1/prompt/:taskUUID/:type**

  * will display a prompt in the GUI where user can give a response
  * use header *Content-Type: text/plain*
  * the body will contain a title to be used for the prompt, instructing
  the operator of something.
  * operator has 60 seconds to respond. Timeout of 60 seconds will return status 400 and success will be false
  * based on the type the remainder of the prompt will vary.
  The type is one of *confirmation*, *text*, *confirmCancel*
    + confirmation: an okay button is displayed. Response will contain
    *userResponse* with value *okay* when operator presses to confirm.
    + confirmCancel: an okay and a cancel button are displayed. Response will contain
    *userResponse* with value *okay* or *cancel* based on operator's selection.
    + text: a text input field will be displayed and a submit button.
    On success *userResponse* value will include operator's text.
  * each prompt type will respond with an json object with key *success* set to
  true or false. If success is true, it will also contain key *userResponse*, else
  will contain key *message* with some error information.

  ```
  #example response
  {
    "success": true
    "userResponse": "okay"
  }

  ```

- **POST http://REST_SERVER/api/v1/manageTasks/:taskUUID**

  * when the group mode is set to  *managed*, use this to handle all of the
  tasks in the same group as the current.
  * use header *Content-Type: application/json*
  * body will consist of following json object
    ```javascript
    {
     reset?: "all" | [], // task indexes to disable of current group
     disable?: "all" | [], // task indexes to disable of current group
     enable?: "all" | [], //task indexes to enable of current group
    }
    ```
    - reset: reset that statuses of tasks (progress, state, etc.)
    - disable: disable a user from running a task
    - enable: enable a user to run a task
    - each of the preceding keys are optional
    - values can be *all* which refers to every task in the group.
    Alternatively the value can be an array to specify each task by index starting
    from 0 in the same group.
    - the commands are processed in the order reset, disable, enable.
