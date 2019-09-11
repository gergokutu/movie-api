// this function runs the babel »
// it modifies variables on the global scope
// this is called » side affects
require("babel-core/register");
// this runs the files inside the src
require("./src");
// you can create func with side affects
// you can create func that returning something
// but you should not create func doing both!!!