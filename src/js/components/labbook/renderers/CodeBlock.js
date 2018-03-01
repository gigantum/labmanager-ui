import React from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror-highlight'
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { okaidia } from 'react-syntax-highlighter/styles/prism';

class CodeBlock extends React.PureComponent {
  constructor(props) {
    super(props)

    this.setRef = this.setRef.bind(this)
  }

  setRef(el) {
    this.codeEl = el
  }

  render() {
    let code = this.props.value
    return (
      <SyntaxHighlighter language='python' style={okaidia}>{code}</SyntaxHighlighter>
    )
  }
}

CodeBlock.defaultProps = {
  language: ''
}

CodeBlock.propTypes = {
  value: PropTypes.string.isRequired,
  language: PropTypes.string
}

export default CodeBlock
