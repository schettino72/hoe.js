// 1) table
/*
<table><tbody>
  <tr><th>aaa</th><th>bbb</th></tr>
  <tr><td>ccc</td><td>ccc</td></tr>
</tbody></table>
*/
var xxx = 'ccc';

// jquery
var table1 = $('<table></table>').append($('<tbody></tbody>').append(
    $('<tr></tr>').append($('<th></th>').text('aaa'),
                          $('<th></th>').text('bbb')),
    $('<tr></tr>').append($('<td>' + xxx + '</td>'),
                          $('<td>' + xxx + '</td>'))));

// hoe.js
var table3 = table(tbody(
    tr(th('aaa'), th('bbb')),
    tr(td(xxx), td(xxx))
));



// 2) row
/*
<tr>
  <td class="my_class">col1</td>
  <td><a name="xxx">col2</a></td>
</tr>
*/

// jquery
var row1 = $('<tr></tr>').append(
    $('<td></td>').text('col1').addClass("my_class"),
    $('<td></td>').html($('<a></a>').text('col2').attr('name','xxx')));

// hoe.js
var row3 = tr(td('col1', {'class': "my_class"}),
              td(a('col2', {name: 'xxx'})) );
