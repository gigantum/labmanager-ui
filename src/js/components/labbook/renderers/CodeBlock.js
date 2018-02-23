import React from 'react'
import PropTypes from 'prop-types'
import CodeBlocks from 'gfm-code-blocks'

class CodeBlock extends React.PureComponent {
  constructor(props) {
    super(props)

    this.setRef = this.setRef.bind(this)
  }

  setRef(el) {
    this.codeEl = el
  }

  componentDidMount() {
    this.highlightCode()
  }

  componentDidUpdate() {
    this.highlightCode()
  }

  render() {

    return (
      <pre>
        <code ref={this.setRef} className={this.props.language}>
          {CodeBlocks(this.props.value)}
        </code>
      </pre>
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
