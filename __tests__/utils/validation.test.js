import validation from 'JS/utils/Validation'

test('test validation of labbook name labbookNamet', () => {

  it('test validation labbookName function correct input', () => {
    let isValid = validation.labbookName('demo-labbook')
    console.log(isValid)
    expect(isValid).toBeTruthy()
  })

  it('test validation labbookName function incorrect input', () => {
    let isValid = validation.labbookName('demo-labbook---')
    console.log(isValid)
    expect(!isValid).toBeTruthy()
  })


  it('test validation labbookNameSend function correct input', () => {
    let isValid = validation.labookNameSend('demo-labbook')
    console.log(isValid)
    expect(isValid).toBeTruthy()
  })

  it('test validation labbookNameSend function incorrect input', () => {
    let isValid = validation.labookNameSend('demo-labbook---')
    console.log(isValid)
    expect(!isValid).toBeTruthy()
  })
})
