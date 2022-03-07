require! {
    \./api.ls : { get-balance }
    \./math.ls : { times, plus }
    \prelude-ls : { find, map, pairs-to-obj, foldl, filter }
    \./workflow.ls : { run, task }
    \./round5.ls
    \./round-human.ls
    #\./pending-tx.ls : { get-pending-amount }
}
calc-wallet = (store, cb)->
    return cb "Store is required" if not store?
    { wallets } = store.current.account
    { rates } = store
    build-loader = (wallet)-> task (cb)->
        { token } = wallet.coin
        #wallet.balance = \..
        #wallet.balance-usd = 0
        token = wallet.coin.token.to-lower-case!
        usd-rate = 
            | not rates[token]? =>  \..
            | rates[token] is "" => \..
            | _ => rates[token]
        # convert usd-rate to string because bigint does not like number type and can throw exception
        usd-rate = usd-rate + ''
        #coin =
        #    coins |> find (.token is wallet.coin.token)
        #return cb "Coin Not Found" if not coin?
        #coin.wallet = wallet
        wallet.usd-rate =
            | usd-rate is \.. => \..
            | _ => usd-rate
        eur-rate = \0.893191
        btc-rate = \0
        wallet.eur-rate =
            | usd-rate is \.. => \..
            | _ => round5 (usd-rate `times` eur-rate)
        wallet.btc-rate =
            | usd-rate is \.. => \..
            | _ => round5 (usd-rate `times` btc-rate)
        err, balance <- get-balance { wallet.address, wallet.network, token, account: { wallet.address, wallet.private-key } }
        console.error "#{token} get-balance error:" err if err?
        #balance = "0" if err?
        pending-sent = 0
        #    store.transactions.all
        #        |> filter (.token is token)
        #        |> filter (.pending is yes)
        #        |> map (.amount)
        #        |> foldl plus, 0
        #err, pending-sent <- get-pending-amount { store, token, wallet.network }
        #console.log { err, pending-sent }
        wallet.pending-sent = pending-sent
        wallet.balance = 
            | isNaN(balance) => ".."
            | _ => balance
        wallet.balance-usd =
            | isNaN(usd-rate) or isNaN(balance) => ".."
            | _ => balance `times` usd-rate
        balance-usd-current =
            | isNaN(wallet.balance-usd) => 0
            | _ => wallet.balance-usd
        cb!
    loaders =
        wallets |> map build-loader
    tasks =
        loaders
            |> map -> [loaders.index-of(it).to-string!, it]
            |> pairs-to-obj
    <- run [tasks] .then
    usdBalances = store.current.account.wallets
        |> filter (-> not isNaN(it.balanceUsd))
        |> map (-> it.balanceUsd)
        |> foldl plus, 0
    store.current.balanceUsd = round5(usdBalances)
    cb null
module.exports = calc-wallet