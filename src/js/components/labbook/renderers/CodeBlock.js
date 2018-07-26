import React from 'react'
import PropTypes from 'prop-types'
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import customizedStyling from './CodeBlockStyle';


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
    console.log(code)
    return (
      <SyntaxHighlighter
        className="CodeBlock"
        language='docker'
        style={customizedStyling}
      >
        {code}
      </SyntaxHighlighter>
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
