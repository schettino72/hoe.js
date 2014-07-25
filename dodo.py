from glob import glob

DOIT_CONFIG = {
    'default_tasks': ['check', 'test'],
    'verbosity': 2,
    }


KARMA_CMD = 'karma start karma.conf.js --single-run'
HOE_JS = 'src/hoe.js'
SRC_FILES = [HOE_JS, 'src/hoe.app.js']
TEST_FILES = ['test/test.js',]


def task_check():
    """static checker using jshint"""
    for js_file in SRC_FILES + TEST_FILES:
        yield {
            'name': js_file,
            'actions': ['jshint --config hint.json ' + js_file],
            'file_dep': ['hint.json', js_file],
            }


def task_test():
    return {
        'actions': [KARMA_CMD],
        'file_dep': SRC_FILES + TEST_FILES,
        }


def task_coverage():
    """annotate for coverage and run tests"""
    return {
        'actions': ['env KARMA_MODE=coverage ' + KARMA_CMD],
        }


def task_apidoc():
    """generate API docs using jsdoc"""
    return {
        'actions': ['jsdoc --directory=api src/hoe.js'],
        'file_dep': [HOE_JS],
        }

def task_tutorial():
    """create tutorial from TodoMVC using docco"""
    docco = 'node_modules/docco/bin/docco'
    return {
        'actions': [docco + ' sample_todomvc/app.js --output tutorial'],
        'file_dep': [HOE_JS, 'sample_todomvc/app.js'],
        'targets': ['tutorial'],
        }

def task_readme():
    """convert README.md into html"""
    return {
        'actions': ['markdown_py README.md > README.html'],
        'file_dep': ['README.md'],
        'targets': ['README.hmtl'],
        }


def task_dist():
    """create distribution files"""
    version = '0.2.0'
    version_comment = "// hoe.js version: %s" % version
    uglify = 'node_modules/uglify-js2/bin/uglifyjs2'
    yield {
        'name': 'min',
        'actions': [
            'echo  "' + version_comment + '" > %(targets)s',
            (uglify + ' %(dependencies)s ' +
             '--mangle --compress --comments >> %(targets)s'),
            ],
        'file_dep': [HOE_JS],
        'targets': ['dist/hoe-' + version + '.min.js'],
        'clean': True,
        }

    yield {
        'name': 'dev',
        'actions': [
            'echo  "' + version_comment + '" > %(targets)s',
            'cat %(dependencies)s >> %(targets)s',
            ],
        'file_dep': [HOE_JS],
        'targets': ['dist/hoe-' + version + '.js'],
        'clean': True,
        }


# TODO dev_setup
# pip install -r py_requirements.txt
# sudo apt-get install nodejs
# sudo apt-get install jsdoc-toolkit
# npm install
# sudo npm install -g karma-cli jshint


####################### site
def task_site():
    """create full html pages from html fragments from site/doc"""
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
    """not really deploy, just copy site to folder with git repo for site"""
    actions = []
    for source in ['site/', 'src', 'components', 'test', 'coverage',
                   'api', 'tutorial', 'sample_todomvc', 'dist']:
        actions.append('rsync -avP %s ../hoe-website/' % source)
    return {
        'actions': actions,
        'task_dep': ['site', 'tutorial', 'coverage', 'apidoc', 'dist'],
        }
