
# ![Virtuin Logo](https://s3.amazonaws.com/virtuin-static-images/icon_white_64x64.png) Virtuin Test Dispatcher  

## Overview

Virtuin Test Dispatcher is used to **start**, **stop**, and **monitor** collection of tests running
inside a Docker Compose environment.

## Build

```bash
yarn run prepublish
```

## Installation

For local install:
```bash
yarn add @samtec-ash/virtuintestdispatcher
```
For global install:
```bash
yarn global add @samtec-ash/virtuintestdispatcher --prefix /usr/local
```

## Usage

### Events

* **collection-log** - General log info of collection *(string)*
* **collection-stdout** - Std out from collection processes *(string)*
* **collection-stderr** - Std error from collection processes *(string)*
* **test-status** - Status object *(Error, TestStatus)*
* **test-log** - General log info of active test *(string)*
* **test-stdout** - Std out from collection process *(string)*
* **test-stderr** - Std error from test process *(string)*
* **error** - General runtime errors *(Error)*

### As CLI

Based on the supplied collection definitions, the following will spin up the docker compose environment and run all tests defined in the sequence.
```bash
virtuintestdispatcher --verbose=0 /path/to/collection.json
```

### As Package

```javascript
import {
  VirtuinTestDispatcher
} from '@samtec-hub/virtuintestdispatcher';

const collection = {
	collectionName: 'collectionName',
	collectionTag: '10.0.0'
};
const testConfig = {
	dut: {},
	station: {},
	test: {}
};

const dispatcherStatusUpdate = (err, status) => {
	if (err) {
		console.log(`Status error ${err.message}`);
	} else if (status) {
		console.log(status);
	}
}

dispatcher = new VirtuinTestDispatcher(
  'DebugStation',
  'localhost',
  verbosity=2
);

dispatcher.on('collection-log', (msg) => {
	console.log(`collection-log: ${msg}`);
});
dispatcher.on('test-log', (msg) => {
	console.log(`test-log: ${msg}`);
});
dispatcher.on('test-status', dispatcherStatusUpdate);

await dispatcher.autologin('docker-user', 'docker-pass');
const response = await dispatcher.up(collection);
if (response.success) {
	await dispatcher.startTest(testConfig);
}
```

## API

The autogenerated API can be accessed in following mediums:
* [HTML](./docs/index.html)
* [API MD](./docs/api.md)

## Publishing

New versions are published to [npmjs.com](https://www.npmjs.com).
BitBucket Pipelines is used to build, test, stage, & deploy. Refer to the [pipeline configuration](https://bitbucket.org/samteccmd/virtuintestdispatcher/src/master/bitbucket-pipelines.yml).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://bitbucket.org/samteccmd/virtuintestdispatcher/commits/).

## Authors

* **Adam Page**


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
