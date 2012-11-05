from glob import glob

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


def task_readme():
    """convert README.md into html"""
    return {
        'actions': ['markdown_py README.md > README.html'],
        'file_dep': ['README.md'],
        'targets': ['README.hmtl'],
        }


# TODO dev_setup
# sudo apt-get install nodejs
# npm install mocha
# npm install chai
# npm install jquery
# sudo apt-get install jscoverage



####################### site
def task_site():
    head = 'site/template/head.html'
    foot = 'site/template/foot.html'

    for content in glob('site/doc/*.html'):
        name = content.split('/')[-1].rsplit('.', 1)[0]

        # put pages together: head + content + foot
        page = 'site/' + name + '.html'
        yield {
            'basename': 'render',
            'name': name,
            'actions': ['cat %s %s %s > %s' % (head, content, foot, page)],
            'file_dep': [head, foot, content],
            'targets': [page],
            }

    yield {
        'basename': 'site',
        'actions':[],
        'task_dep': ['render'],
        }

def task_deploy():
    """not really deploy, just copy site to folder with git repo  for site"""
    return {
        'actions': ['rsync -avP site ../hoe-website'],
        'task_dep': ['site'],
        }
