import React from 'react'

export default function QueryTimeTable (queryResult){

    return (
      <div>
        QueryTime Table
        
        <div>{console.log("test disk time" + queryResult.diskTime)}</div>
      </div>
    );
}
