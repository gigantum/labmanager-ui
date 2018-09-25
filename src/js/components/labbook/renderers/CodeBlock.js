import React from 'react';
import PropTypes from 'prop-types';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import SyntaxHighlighterHLJS from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/styles/hljs';
import customizedStyling from './CodeBlockStyle';
import classNames from 'classnames';
// assets
import './CodeBlock.scss';


class CodeBlock extends React.PureComponent {
  constructor(props) {
    super(props);

    this.setRef = this.setRef.bind(this);
  }

  setRef(el) {
    this.codeEl = el;
  }

  render() {
    const code = this.props.value;
    const language = this.props.language ? this.props.language : 'python';
    const style = language === 'dockerfile' ? githubGist : customizedStyling;
    const codeCSS = classNames({
      CodeBlock: language !== 'dockerfile',
      'CodeBlock--docker': language === 'dockerfile',
    });
    if (language === 'dockerfile') {
      return (
        <SyntaxHighlighterHLJS
          className={codeCSS}
          language={language}
          style={style}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighterHLJS>
      );
    }
    return (
      <SyntaxHighlighter
        className={codeCSS}
        language={language}
        style={style}
      >
        {code}
      </SyntaxHighlighter>
    );
  }
}

CodeBlock.defaultProps = {
  language: '',
};

CodeBlock.propTypes = {
  value: PropTypes.string.isRequired,
  language: PropTypes.string,
};

export default CodeBlock;
