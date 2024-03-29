import React from 'react'
import axios, { post } from 'axios';

class SimpleReactFileUpload extends React.Component {

  constructor(props) {
    super(props);
    this.state ={
      file:null
    }
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
    this.fileUpload = this.fileUpload.bind(this)
  }
  onFormSubmit(e){
    e.preventDefault() // Stop form submit
    this.fileUpload(this.state.file).then((response)=>{
      console.log(response.data);
    })
  }
  onChange(e) {
    this.setState({file:e.target.files[0]})
  }
  fileUpload(file){
    const url = 'http://wholesalecarstereo.com/twisker';
    const formData = new FormData();
    formData.append('file',file)
    const config = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST',
            'Access-Control-Allow-Credentials': 'true',
            'content-type': 'multipart/form-data'
        }
    }
    return  post(url, formData,config)
  }

  render() {
    return (
      <div className="container">
          <div className="dashboard">
              <form onSubmit={this.onFormSubmit}>
                <h2>File Upload</h2>
                <input type="file" onChange={this.onChange} />
                <button type="submit">Upload</button>
              </form>
          </div>
      </div>
   )
  }
}



export default SimpleReactFileUpload