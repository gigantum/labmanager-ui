import validation from 'JS/validation/Validation'

test('test validation labbookName function correct input', () => {
  let isValid = validation.labbookName('demo-labbook')

  expect((isValid !== undefined) && (isValid !== null)).toBeTruthy()
})

test('test validation labbookName function incorrect input', () => {
  let isValid = validation.labbookName('demo-labbook---')

  expect(!((isValid !== undefined) && (isValid !== null))).toBeTruthy()
})
