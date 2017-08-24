import React, { Component } from 'react'
import SimpleMDE from 'simplemde'
import inlineAttachment from 'inline-attachment/src/inline-attachment'
import inlineAttachment4 from 'inline-attachment/src/codemirror-4.inline-attachment'

console.log(inlineAttachment)
export default class UserNote extends React.Component {
  constructor(props){
  	super(props);
    this.state = {showExtraInfo: false}
  }
  componentDidMount() {
    var simple = new SimpleMDE({ element: document.getElementById("markDown") });
    console.log(simple)

    window.inlineAttachment.editors.codemirror4.attach(simple.codemirror, {
    onFileUploadResponse: function(xhr) {
        var result = JSON.parse(xhr.responseText),
        filename = result[this.settings.jsonFieldName];

        if (result && filename) {
            var newValue;
            if (typeof this.settings.urlText === 'function') {
                newValue = this.settings.urlText.call(this, filename, result);
            } else {
                newValue = this.settings.urlText.replace(this.filenameTag, filename);
            }
            var text = this.editor.getValue().replace(this.lastValue, newValue);
            this.editor.setValue(text);
            this.settings.onFileUploaded.call(this, filename);
        }
            return false;
      }
    });
  }

  render(){
    return(
      <div className="UserNote">
        <img src="file:///Users/calum/Downloads/weddingbar_01.jpg" />
        <textarea id="markDown"></textarea>

        <button> Add Note</button>
      </div>
    )
  }
}
