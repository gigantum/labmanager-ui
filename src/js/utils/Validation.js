const validation = {
  labbookName: (input) =>{
    const isMatch =  input.match(/^(?!-)(?!.*--)[a-z0-9-]+(?!-)$/)
    return isMatch;
  }
}

export default validation
