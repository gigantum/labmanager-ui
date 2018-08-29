import store from 'JS/redux/store'

export default (type, payload) => {
    store.dispatch({
        type,
        payload
    })
}
