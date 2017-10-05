const validation = {
  labbookName: (input) =>{
    const isMatch =  input.match(/^(?!-)(?!.*--)[A-Za-z0-9-]+(?!-)$/)
    return isMatch;
  }
}

export default validation
