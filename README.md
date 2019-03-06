### Virtuin


Virtuin is a cross platform application that allows you to quickly setup a computer station.
A station can load, update, run, stop, and monitor your code in an easy
to use graphical interface. It is useful for areas such as
production, testing, and research.

Tasks are your programs executables in a docker/docker-compose environment
ready to be run with unique arguments and environment variables. Virtuin
is language and platform agnostic. You can use whatever languages and tools you like
as long as they are supported by docker.

Virtuin will

-

In general you create a collection.yml which contains your docker-compose file

#### station.env
```env
  VIRT_BROKER_ADDRESS=localhost
  VIRT_DOCKER_HOST=unix:///var/run/docker.sock
```

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
