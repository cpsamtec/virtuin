# Virtuin Rest API Server


This server will receive REST requests and forward them to GUI or CLI.
The server will be started by the GUI or CLI and open on any available port.
As the GUI is more likely to be used it will be primarily referenced throughout.

A running task can for example send messages and prompts to the GUI. To do
this it will

 - get **taskUUID** from the json file located at environment variable VIRT_TASK_INPUT_FILE
 - get the server address from the environment variables VIRT_REST_API_PORT and
 VIRT_GUI_SERVER_ADDRESS
 - POST to the server using the appropriate handle



```
REST_SERVER=VIRT_GUI_SERVER_ADDRESS:VIRT_REST_API_PORT
```
- POST http://REST_SERVER/api/v1/progress/:taskUUID/:progress
- POST http://REST_SERVER/api/v1/message/:taskUUID
- POST http://REST_SERVER/api/v1/prompt/:taskUUID/:type
- POST http://REST_SERVER/api/v1/manageTasks/:taskUUID


More information can be found in the [documentation](../../docs/documentation.md)
