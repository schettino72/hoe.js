DOIT_CONFIG = {
    'default_tasks': ['check', 'test'],
    'verbosity': 2,
    }

mocha_cmd = 'node_modules/mocha/bin/mocha --ui tdd'


def task_check():
    return {
        'actions': ['jshint --config hint.json lib/hoe.js'],
        'file_dep': ['hint.json', 'lib/hoe.js'],
        }


def task_test():
    """run unit-tests using mocha"""
    return {
        'actions': [
            mocha_cmd + ' --colors --reporter spec'],
        'file_dep': ['lib/hoe.js', 'test/test.js'],
        }

def task_coverage():
    yield {
        'name': 'annotate',
        'actions': ['jscoverage --no-highlight lib coverage'],
        'file_dep': ['lib/hoe.js'],
        'targets': ['coverage/hoe.js'],
        }
    # XXX no reasonable terminal coverage result
    # XXX doesnt report tests failed
    yield {
        'name': 'test',
        'actions': [
            mocha_cmd + ' --require setup_cov.js --reporter html-cov > coverage/result.html'],
        'file_dep': ['coverage/hoe.js', 'test/test.js'],
        'targets': ['coverage/result.html'],
        }


# TODO dev_setup
# sudo apt-get install nodejs
# npm install mocha
# npm install chai
# npm install jquery
# sudo apt-get install jscoverage
