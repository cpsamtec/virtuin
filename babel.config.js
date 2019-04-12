export default {
    overrides: [
        {
            test: 'virtuingui2',
            extends: 'virtuingui2/babel.config.js'
        },
        {
            test: 'virtuintaskdispatcher',
            extends: 'virtuintaskdispatcher/babel.config.js'
        },
        {
            test: 'task-rest-service',
            extends: 'task-rest-service/babel.config.js'
        },
        {
            test: 'cli',
            extends: 'cli/babel.config.js'
        }    
]
};


