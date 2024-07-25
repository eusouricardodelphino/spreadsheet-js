angular.module('500lines', []).controller('Spreadsheet', function ($scope, $timeout){
  // Begin of $scope properties; start with the column/row labels
  $scope.Cols = [], $scope.Rows = [];
  for (col of range( 'A', 'H' )) { $scope.Cols.push(col); }
  for (row of range( 1, 20 )) { $scope.Rows.push(row); } 

  function* range(cur, end) { 
    while (cur <= end) { 
      yield cur;
      cur = (isNaN( cur ) ? String.fromCodePoint( cur.codePointAt() + 1 ) : cur + 1); 
    }}

    // UP(38) and DOWN(40)/ ENTER(13) move focus to the row above (-1) and below (+1)
    $scope.keydown = ({which}, col, row)=> { switch(which) {
      case 38:
      
      case 40:
      
      case 13: $timeout( ()=> {
        const direction = (which === 38) ? -1 : +1;
        const cell = document.querySelector(`#${ col }${ row + direction }` );
        if (cell) { cell.focus(); }
      });
    }};

    // Default sheet content, with some data cells and one formula cell.
    $scope.reset = () => {
      $scope.sheet = { A1: 1874, B1:  '+', C1: 2046, D1: '⇒', E1: '=A1+C1' }; 
      console.log("reset was called")
    }
    
    // Define the initializer, and immediately call it
    ($scope.init = ()=> {
      // Restore the previous .sheet; reset to default if it's the first run
      $scope.sheet = angular.fromJson( localStorage.getItem('') );
      if (!$scope.sheet) { $scope.reset(); }
      $scope.worker = new Worker( 'worker.js' );
    }).call();

    // Formula cells may produce errors in .errs; normal cell contents are in .vals
    [$scope.errs, $scope.vals] = [ {}, {} ];


    // Define the calculation handler; not calling it yet
    $scope.calc = () => {
      const json = angular.toJson( $scope.sheet );
      const promise = $timeout( () => {
        // If the worker has not returned in 99 milliseconds, terminate it
        $scope.worker.terminate();
        // Back up to the previous state and make a new worker
        $scope.init();
        // Redo the calculation using the last-known state
        $scope.calc();
      }, 99 );

      console.log("calc was called");
  

      // When the worker returns, apply its effect on the scope

      $scope.worker.onmessage = ({data}) => {
        $timeout.cancel( promise );
        localStorage.setItem('', json);
        $timeout( () => { [$scope.errs, $scope.vals] = data; } );
      };

      // Post the current sheet content for the worker to process
      $scope.worker.postMessage( $scope.sheet );
    };
    
    $scope.worker.onmessage = $scope.calc;
    $scope.worker.postMessage( null );
}); 