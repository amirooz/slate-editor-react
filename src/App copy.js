import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import TextEditor from './components/TextEditor';



function App() {
    return(
        <BrowserRouter>
            <div className="App">
                <Navbar />
                <TextEditor />
            </div>
        </BrowserRouter>
    )
}

export default App;
