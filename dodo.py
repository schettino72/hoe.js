DOIT_CONFIG = {'defaults_tasks': ['test']}

def task_test():
    """run unit-tests using mocha"""
    return {
        'actions': [
            'node_modules/mocha/bin/mocha --ui tdd --colors --reporter spec'],
        'file_dep': ['hoe.js', 'test/test.js'],
        'verbosity': 2,
        }


# TODO dev_setup
# npm install mocha
# npm install chai
# npm install jquery
