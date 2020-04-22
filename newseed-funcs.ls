require! {
    \./navigate.ls
    \./seed.ls : { set }
    \../web3t/providers/deps.ls : { bip39 }
    \./pages/confirmation.ls : { confirm }
    \prelude-ls : { words, map, filter, join }
    \./get-lang.ls
}
clean = ->
    it.match(/[a-z]+/)?0
fix =  
    words >> (map clean) >> (filter (?)) >> (join " ")
module.exports = (store, web3t)->
    return null if not store? or not web3t?
    lang = get-lang store
    generate-seed = ->
        seed = bip39.generate-mnemonic! + ' ' + bip39.generate-mnemonic!
        store.current.seed-words = seed.split(' ')
        store.current.seed-generated = yes
    next = ->
        navigate store, web3t, \:init
    save = ->
        store.current.seed = store.current.seed-words.map(-> it.part).join(' ')
        store.current.saved-seed = yes
        set store.current.seed
        next!
    has-issue = ->
        return no if store.current.seed.length is 0
        not store.current.seed.match(/^([a-z]+[ ]){0,11}([a-z]+)$/)? and not store.current.seed.match(/^([a-z]+[ ]){0,23}([a-z]+)$/)? 
    fix-issue = ->
        store.current.seed = fix store.current.seed
        store.current.seed-temp = store.current.seed
    { save, generate-seed, has-issue, fix-issue, next }