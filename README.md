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
- A global environment variable on your system VIRT_STATION_NAME. You can
  just set this to VIRT_DEFAULT_STATION to begin with.
  ```bash
  export VIRT_STATION_NAME=VIRT_DEFAULT_STATION
  ```

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
#### collection.env
```env
  VIRT_BROKER_ADDRESS=localhost
  VIRT_DOCKER_HOST=unix:///var/run/docker.sock
  #VIRT_DOCKER_USER=XXXXX
  #VIRT_DOCKER_PASSWORD=XXXXX
  #Below environment variables to be set for your tasks
  #AWS_SECRET_ACCESS_KEY=XXXXX
  #AWS_ACCESS_KEY_ID=XXXXX
```
There needs to be a collection.env stored on every computer that will be running
a specific project/collection.yml. The collection.yml will also need to specify
they location of this file for each machine.

Virtuin variables
- VIRT_DOCKER_HOST - Tells Virtuin how to access your desired Docker server.
Typically you would use **unix:///var/run/docker.sock** when docker is running on
 the same machine as Virtuin. If you are running docker on a different machine
 you can change accordingly.
- VIRT_BROKER_ADDRESS - The ip address of the machine running Virtuin. You
will most likely leave this localhost as you will most likely have the Virtuin
Application and Docker running on the same machine.
- VIRT_DOCKER_USER (optional) - Virtuin will pull your required docker images. If you need
to login for private images, supply your Docker Hub username here.
- VIRT_DOCKER_PASSWORD (optional) - Docker Hub password to match VIRT_DOCKER_USER

You can specify additional environment variables that you would like to be available
to your Docker containers. Make sure they are also specified in the **environment**
key of your compose.

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
