// performance tests for creating HTML elements
// use chrome dev tools - profile


function go_hoe(){
    var test = document.getElementById('test-space');
    hoe.html(test, hoe('div', {'class': 'content'},
                       hoe('h2', null, 'My title'),
                       hoe('ul', null,
                           hoe('li', null, 'item 1'),
                           hoe('li', null, 'item 2'),
                           hoe('li', null, 'item 3')
                          )
                      ));
}


function go_html(){
    var test = document.getElementById('test-space');
    test.innerHTML = '<div class="content"><h2>My title</h2><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></div>';
}


function go_dom(){
    var test = document.getElementById('test-space');

    var $div = document.createElement('div');
    $div.setAttribute('class', "content");

    var $header = document.createElement('h2');
    $header.appendChild(document.createTextNode('My title'));

    var $ul = document.createElement('ul');
    var $li;
    for (var i = 0; i < 3; i++) {
        $li = document.createElement('li');
        $li.appendChild(document.createTextNode('item ' + i));
        $ul.appendChild($li);
    }

    $div.appendChild($header);
    $div.appendChild($ul);
    test.innerHTML = '';
    test.appendChild($div);
}



function profile(fn, repeat){
    document.getElementById('test-space').innerHTML = '';
    repeat = repeat || 10000;
    console.profile();
    for (var i=0; i<repeat; i++){
        //console.log(i);
        fn();
    }
    console.profileEnd();
}



