import { useState } from 'react'

import './App.css'
import Comment from './components/Forms/Comments'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Comment/>

    </>
  )
}

export default App
