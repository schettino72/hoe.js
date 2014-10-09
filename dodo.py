import json
from glob import glob

from doitweb import JsHint


DOIT_CONFIG = {
    'default_tasks': ['jshint', 'test'],
    'verbosity': 2,
    }


KARMA_CMD = 'node_modules/karma/bin/karma start karma.conf.js --single-run'
HOE_JS = 'src/hoe.js'
SRC_FILES = glob('src/*.js')
TEST_FILES = glob('test/*.js')


def task_jshint():
    """static checker using jshint"""
    hint = JsHint(config='hint.json')
    yield hint.tasks(SRC_FILES + TEST_FILES + ['sample_todomvc/app.js'])


def task_test():
    return {
        'actions': [KARMA_CMD],
        'file_dep': SRC_FILES + TEST_FILES,
        }


def task_coverage():
    """annotate for coverage and run tests"""
    return {
        'actions': ['env KARMA_MODE=coverage ' + KARMA_CMD],
        'file_dep': SRC_FILES + TEST_FILES,
        'uptodate': [False],
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
    # this is just to check markdown formatting... the output is not used
    return {
        'actions': ['markdown_py README.md > README.html'],
        'file_dep': ['README.md'],
        'targets': ['README.hmtl'],
        }








def get_bower_version():
    with open('bower.json') as bower:
        return {'version': json.load(bower)['version']}

def task_dist():
    """create distribution

    save files on `dist` folder. This folder should contain the branch
    `releases`. Tags for bower releases should be made from the `releases`
    branch.
    """
    # get version number from bower.json
    yield {
        'name': 'version',
        'actions': [get_bower_version],
        'file_dep': ['bower.json'],
        }

    # concat files for source distribution
    sources = ['src/hoe.model.js', 'src/hoe.js'] # hoe.app.js is unreleased
    yield {
        'name': 'dev',
        'actions': [
            'echo  "// hoe.js version: %(version)s" > %(targets)s',
            'cat %(dependencies)s >> %(targets)s',
            ],
        'file_dep': sources,
        'getargs': {'version': ('dist:version', 'version')},
        'targets': ['dist/hoe.js'],
        'clean': True,
        }

    # create minified file for distribution
    uglify = 'node_modules/uglify-js/bin/uglifyjs'
    yield {
        'name': 'min',
        'actions': [
            'echo  "// hoe.js version: %(version)s" > %(targets)s',
            (uglify + ' %(dependencies)s ' +
             '--mangle --compress --comments >> %(targets)s'),
            ],
        'file_dep': ['dist/hoe.js'],
        'getargs': {'version': ('dist:version', 'version')},
        'targets': ['dist/hoe.min.js'],
        'clean': True,
        }

    # copy other files to be included in bower package
    files = ['README.md', 'LICENSE', 'CHANGES']
    for fname in files:
        yield {
            'name': 'cp-{}'.format(fname),
            'actions': ['cp %(dependencies)s %(targets)s'],
            'file_dep': [fname],
            'targets': ['dist/{}'.format(fname)],
            }


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
    for source in ['site/', 'src', 'components', 'test',
                   'tutorial', 'sample_todomvc']:
        actions.append('rsync -avP %s ../hoe-website/' % source)
    return {
        'actions': actions,
        'task_dep': ['site', 'tutorial'],
        }




################## setup  ###################
# sudo apt-get install nodejs

def task_dev_setup():
    """install setup third-part packages"""
    yield {
        'name': 'npm',
        'actions': ['npm install'],
        'file_dep': ['package.json'],
        'targets': ['node_modules'],
        }

    yield {
        'name': 'bower',
        'actions': ['bower install'],
        'file_dep': ['bower.json'],
        'targets': ['bower_components'],
        }


    # build/move used files from bower_components to components folder
    components = {
        'chai.js': 'chai/chai.js',
        'mocha.css': 'mocha/mocha.css',
        'mocha.js': 'mocha/mocha.js',
        'polymer-platform.js': 'polymer-platform/platform.js',
        }
    for dst, src in components.items():
        yield {
            'name': 'bower-{}'.format(dst),
            'actions': ['mkdir -p components',
                        'cp %(dependencies)s %(targets)s'],
            'file_dep': ['bower_components/{}'.format(src)],
            'targets': ['components/{}'.format(dst)],
            }
