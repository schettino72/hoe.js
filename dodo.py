DOIT_CONFIG = {
    'default_tasks': ['check', 'test'],
    'verbosity': 2,
    }


MOCHA_CMD = 'node_modules/mocha/bin/mocha --ui tdd'
HOE_JS = 'src/hoe.js'


def task_check():
    for js_file in (HOE_JS, 'test/test.js'):
        yield {
            'name': js_file,
            'actions': ['jshint --config hint.json ' + js_file],
            'file_dep': ['hint.json', js_file],
            }


def task_test():
    """run unit-tests using mocha"""
    return {
        'actions': [
            MOCHA_CMD + ' --colors --reporter spec'],
        'file_dep': [HOE_JS, 'test/test.js'],
        }

def task_coverage():
    yield {
        'name': 'annotate',
        'actions': ['jscoverage --no-highlight src coverage'],
        'file_dep': [HOE_JS],
        'targets': ['coverage/hoe.js'],
        }
    # XXX no reasonable terminal coverage result
    # XXX doesnt report tests failed
    yield {
        'name': 'test',
        'actions': [
            MOCHA_CMD + ' --require setup_cov.js --reporter html-cov > coverage/result.html'],
        'file_dep': ['coverage/hoe.js', 'test/test.js'],
        'targets': ['coverage/result.html'],
        }


# TODO dev_setup
# sudo apt-get install nodejs
# npm install mocha
# npm install chai
# npm install jquery
# sudo apt-get install jscoverage
