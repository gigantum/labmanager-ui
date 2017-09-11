const validation = {
  labbookName: (input) =>{
    console.log(input)
    const isMatch =  input.match(/^(?!-)(?!.*--)[A-Za-z0-9-]+(?!-)$/)
    console.log(isMatch)
    return isMatch
  }
}

export default validation
