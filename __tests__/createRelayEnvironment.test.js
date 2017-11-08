import createRelayEnvironment from 'JS/createRelayEnvironment'
import {graphql} from 'react-relay'
const containerStatusQuery = graphql`
  query createRelayEnvironmentQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
    id
    description
    environment{
      containerStatus
    }
    notes(first: $first){
      edges{
        node{
          id
        }
      }
    }
  }
}`

let operation = {text: containerStatusQuery}
test('test create relay environment', () => {
  let envrionment = createRelayEnvironment;

  it('has source', async () => {
      let data = await envrionment._network.fetch(containerStatusQuery(), {name: 'demo-lab-book', owner: 'default', first: 3})

      expect(data).toBeDefined()

})
  it('has source', () => {
    expect(envrionment._store._recordSource !== undefined).toBeTruthy()
  })

  it('has a network', () => {
    expect(envrionment._network !== undefined).toBeTruthy()
  })

  it('has a fetch method', () => {
    expect(envrionment._network.fetch !== undefined).toBeTruthy()
  })

  it('has a fetch request', () => {
    expect(envrionment._network.request !== undefined).toBeTruthy()
  })

  it('test fetch method', () => {

  //  expect(envrionment._network.request !== undefined).toBeTruthy()
  })
  //expect(true).toBeTruthy()
})
