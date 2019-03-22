### Virtuin

This is a monorepo containing all the source of Virtuin.

Virtuin is a cross platform application that allows an operator to load, update,
run, stop, and monitor programs in an easy to use graphical interface.
It is useful for areas such as production, testing, and research. You will
most likely not need to use the source unless would like to make modifications
or contribute.


Please see
[Virtuin Documentation](./DOCUMENTATION.MD)


#### To build and run from source


Required
- node 10.11+
- yarn


1. first clone the repo and cd into it
2. yarn install
3. ``` ./node_modules/.bin/lerna bootstrap ```
4. ```./node_modules/.bin/lerna build ```
5. ``` ./node_modules/.bin/lerna bootstrap ``` (run twice the first time)
6. to run the gui ```./node_modules/.bin/lerna run run:gui ```
