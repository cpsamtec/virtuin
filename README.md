### Virtuin

This is a monorepo containing all the source of Virtuin.

Virtuin is a cross platform application that allows an operator to load, update,
run, stop, and monitor programs in an easy to use graphical interface.
It is useful for areas such as production, testing, and research.  

Please see
[Virtuin Documentation](./DOCUMENTATION.MD)


#### To build and run from source
Required
- node 10.11+
  [download node](https://nodejs.org/en/download/)
- yarn
  ```npm install -g yarn```

Build and run

1. first clone the repo and cd into it
2. ```yarn install```
3. ```yarn run bootstrap ```
4. ```yarn run build ```
5. ```yarn run bootstrap ``` (run twice the first time)
6. ```yarn run run:gui```


To package to create an installable executable run
```
yarn run package
```
