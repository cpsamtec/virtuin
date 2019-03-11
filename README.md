### Virtuin


Virtuin is a cross platform application that allows operators to load, update,
run, stop, and monitor your programs in an easy to use graphical interface.
It is useful for areas such as production, testing, and research.

Virtuin is language and platform agnostic. You can use whatever languages, platforms,
 and tools you like as long as they are supported by docker.

In short, you will provide a docker compose file and a list of tasks to be executed.
**Tasks** are your programs executables in a running container,
ready to be run with specified arguments and environment variables. Virtuin will
handle ensuring the appropriate containers are running. It will then display
the list of tasks and information for an operator to utilize.

To begin a new Virtuin project make sure you have the following installed
- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Virtuin Application
- Recommended to add global environment variable on your system VIRT_STATION_NAME. You can
  just set this to VIRT_DEFAULT_STATION to begin with.
  ```bash
  export VIRT_STATION_NAME=VIRT_DEFAULT_STATION
  ```
  It becomes important to have unique values for VIRT_STATION_NAME when you have
  multiple stations.

It is also recommended you clone the following boilerplate to get started. It
consists of
- collection.env
  * Contains environment variables specific to the current station and project
   you are working on
  * For example you could store Docker or AWS credentials to be used by your tasks.  
  * The file must be exactly named collection.env
- src directory for your code recommended for developement.
  * This will contain subdirectories for various
  docker services each containing a Dockerfile
  * When released these will be pushed as docker images.
- collection.yml
  * The heart of a project.
  * Contains the docker-compose file
  * Describes all of your tasks and how to run them
  * Lists all of the system locations of each stations environment file (collection.env)
  for the current collection been run


### Details of collection.env and collection.yml
#### collection.env [Optional]
```env
  VIRT_BROKER_ADDRESS=localhost
  VIRT_DOCKER_HOST=unix:///var/run/docker.sock
  #VIRT_DOCKER_USER=XXXXX
  #VIRT_DOCKER_PASSWORD=XXXXX
  #Below environment variables to be set for your tasks
  #AWS_SECRET_ACCESS_KEY=XXXXX
  #AWS_ACCESS_KEY_ID=XXXXX
```
The collection.yml will also need to specify they location of it's corresponding
collection.env for each machine. If one does not exist the default values are used.
You will want to store any credentials for services your tasks will use in
the collection.env.

Virtuin variables in collection.env
- VIRT_DOCKER_HOST - Tells Virtuin how to access your desired Docker server.
 This is the machine the actual services are run on. Typically
 unix:///var/run/docker.sock when docker is running on
 the same machine as Virtuin. If you are running docker on a different machine
 you can change accordingly. Default **unix:///var/run/docker.sock**
- VIRT_BROKER_ADDRESS - The ip address of the machine running Virtuin. You
will most likely leave this localhost as you will most likely have the Virtuin
Application and Docker running on the same machine. Default **localhost**
- VIRT_DOCKER_USER (optional) - Virtuin will pull your required docker images. If you need
to login for private images, supply your Docker Hub username here.
- VIRT_DOCKER_PASSWORD (optional) - Docker Hub password to match VIRT_DOCKER_USER

You can specify additional environment variables that you would like to be available
to your Docker containers. Make sure they are also specified in the **environment**
key of your compose file.

#### collection.yml
```yaml
collectionName: Virtuin_Example_Collection
collectionTag: v0.0.1
build: development
taskGroups:
- name: Group One
  description: Description of the first group of tasks
  autoStart: true
  mode: user
  tasks:
  - name: First in Sequence
    description: Description of the current example process
    dockerInfo:
      serviceName: example-one
      command: python3.5
      type: exec
      args:
      - /usr/src/app/run.py
    data:
      helloMessage: Hello from the first process of the Example Collection
      virt_stations:
        VIRT_DEFAULT_STATION:
          hostOSName: posix
          helloMessage: This is the new Hello Message from the Example Collection
    viewURL: http://localhost:3000
    autoStart: false
stationCollectionEnvPaths:
  VIRT_DEFAULT_STATION: /Users/cpage/Documents/Samtec/Virtuin/virtuinbasicexample
dockerCompose:
  source:
    version: '3'
    services:
      output-server:
        image: samtechub/debian-nginx-fs
        network_mode: bridge
        ports:
        - 4962:11491
        volumes:
        - ${VIRT_COLLECTION_ENV_PATH}/src
        - outputFiles:/usr/share/nginx/html:ro
      example-one:
        build: ${VIRT_COLLECTION_ENV_PATH}/src/one
        env_file: .env
        network_mode: host
        command:
        - bash
        - -c
        - 'trap : TERM INT; sleep infinity & wait'
        volumes:
        - ${VIRT_COLLECTION_ENV_PATH}/src:/src
        - /tmp/outputFiles:/outputFiles
        environment:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - VIRT_STATION_NAME
        - VIRT_BROKER_ADDRESS
        - VIRT_OUTPUT_FILE_PATH=/outputFiles
        - VIRT_OUTPUT_FILE_URL=http://localhost:4962/
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
  - source : the actual source of the docker compose file. Please see Docker for
  more information about docker and docker compose files.
- **taskGroups** : describes all your your tasks arranged into groups. It consists of
  - name : descriptive name of the group
  - description: more information about the function of the group
  - autoStart: if true when the collection is still loaded the first task
  will be immediatly executed of this group. Default __false__
  - mode: __user__ or __managed__. In __user__ mode the operator can run
  any tasks in any order and reset the statuses of tasks in a group.
  In __managed__ your task on completion will
  inform the GUI via a rest service which tasks are able enabled and which
  statuses should be reset. Default __user__
  - **tasks** : list of Task objects. Only one task can execute at a time in a group.
    - name : descriptive name of the task
    - description: more information about the function of the task
    - dockerInfo: how Virtuin is to execute your program in a running docker service.
      - serviceName: The name of the docker service
      - command: the command to run
      - type: always set to exec for now
      - args: list of arguments to pass to the command



including how to execute them in your docker services.
