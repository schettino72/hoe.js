
var assert;
try{
    assert = require('assert'); // for node
}
catch (exception){
    assert = chai.assert; // for browser
}

suite('Array', function(){
  setup(function(){
    // ...
  });

  suite('#indexOf()', function(){
    test('should return -1 when not present', function(){
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});
