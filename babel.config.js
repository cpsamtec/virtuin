export default {
    overrides: [
        {
            test: 'packages/virtuingui2',
            extends: 'packages/virtuingui2/babel.config.js'
        },
        {
            test: 'packages/virtuintaskdispatcher',
            extends: 'packages/virtuintaskdispatcher/babel.config.js'
        },
        {
            test: 'packages/task-rest-service',
            extends: 'packages/task-rest-service/babel.config.js'
        },
        {
            test: 'packages/cli',
            extends: 'packages/cli/babel.config.js'
        }    
]
};


