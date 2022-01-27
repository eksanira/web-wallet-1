require! {
    \prelude-ls : { map, split, filter, find, foldl, drop, take, sum, unique, pairs-to-obj, sort-by, reverse, each }
    \./math.ls : { div, times, plus, minus }
    \./round-human.ls
    '../web3t/providers/superagent.js' : { get }
    "../web3t/providers/solana/index.cjs" : \velasWeb3
}
down = (it)->
  (it ? "").toLowerCase!
SIMULATION_COUNT = 14600
EPOCHS_PER_YEAR = 1460
VALIDATOR_COUNT = 19
as-callback = (p, cb)->
    p.catch (err) -> cb err
    p.then (data)->
        cb null, data
get-stakes-from-stakes-accounts = (store, item)->
    found = store.staking.accounts
        |> filter (it)->
            +it.activationEpoch < +it.deactivationEpoch and it?voter is item.key
    stakes =
        | found.length > 0 =>
            found |> map (-> {seed: it.seed, item: it, stake: it.stake})
        | _ => []
    return stakes
fill-pools = ({ store, web3t, on-progress}, on-finish, [item, ...rest]) ->
    if not item? then
        store.staking.all-pools-loaded = yes
        store.staking.pools-are-loading = no
        return on-finish null, []
    if (([\validators, \info, \account_details, \poolchoosing, \pool_details].index-of(store.current.page)) is -1) then
        store.staking.all-pools-loaded = no
        store.staking.pools-are-loading = no
        return on-finish null, []
#    store.staking.loadingValidatorIndex += 1
    item.activatedStake = item.activatedStake
    item.balanceRaw = item.activatedStake
    item.address = item.key
    item.stake = item.stake
    item.stake-initial = item.activatedStake
    item.status = status
    item.commission = item.commission
    item.credits_observed =
        item.epochCredits
            |> map (it)->
                it[1]
            |> foldl plus, 0
    item.delegators = store.staking.delegators[down(item.votePubkey)] ? 0
    stakes = get-stakes-from-stakes-accounts(store, item)
    item.stakes = stakes
    on-progress [item, ...rest] if on-progress?
    on-finish-local = (err, pools) ->
        on-finish err, [item, ...pools]
    on-progress-local = (pools) ->
        on-progress [item, ...pools]
    fill-pools { store, web3t, on-progress: on-progress-local}, on-finish-local, rest
load-validators-from-cache = ({store, web3t}, cb)->
    DEADLINE = 60000 # 1 minute
    last-time = store.staking.last-time ? new Date().getTime()
    now = new Date().getTime()
    network = store.current.network
    cachedNetwork = store.staking.cachedValidatorsNetwork
    if now `minus` last-time <= DEADLINE and store.staking.cachedValidators? and store.staking.cachedValidators.length
        if cachedNetwork is network then
            cache-result = store.staking.cachedValidators  
            return cb null, cache-result  
    err, validators <- as-callback web3t.velas.NativeStaking.getStakingValidators()
    console.error "GetStakingValidators err: " err if err?  
    return cb null, [] if err?
    store.staking.cachedValidators = validators  
    store.staking.cachedValidatorsNetwork = network
    store.staking.last-time = new Date().getTime()
    cb null, validators    
query-pools-web3t = ({store, web3t, on-progress}, on-finish) -> 
    err, validators <- load-validators-from-cache { store, web3t }
    store.staking.totalValidators = validators.length
    store.staking.pools-are-loading = yes
    fill-pools { store, web3t, on-progress}, on-finish, validators
query-pools = ({store, web3t, on-progress}, on-finish) ->
    fill-delegators(store, web3t)      
    err, pools <- query-pools-web3t {store, web3t, on-progress}
    return on-finish err if err?
    on-finish null, pools
fill-delegators = (store, web3t)->
    accounts = store.staking.parsedProgramAccounts
    Array.from(accounts, fill-delegator(store, web3t))

fill-delegator = (store, web3t, acc)-->
    return if not acc?
    { voter, activationEpoch, deactivationEpoch } = acc
    if (voter and (Number(deactivationEpoch) > Number(activationEpoch) or activationEpoch is web3t.velas.NativeStaking.max_epoch))
        store.staking.delegators[down(voter)] = if store.staking.delegators[down(voter)]? then (store.staking.delegators[down(voter)] + 1) else 1

# Accounts
query-accounts = (store, web3t, on-progress, on-finish) ->
    accountIndex = store.current.accountIndex
    network = store.current.network
    cachedNetwork = store.staking.cachedAccountsNetwork
    if (store.staking.getAccountsFromCashe is yes) and store.staking.accountsCached[accountIndex]? and store.staking.accountsCached[accountIndex].length > 0
        if cachedNetwork is network then
            #console.log "get accounts from cache"
            store.staking.all-accounts-loaded = yes
            store.staking.accounts-are-loading = no
            return on-finish null, store.staking.accountsCached[accountIndex]
    err, accounts <- query-accounts-web3t store, web3t, on-progress
    return on-finish err if err?
    store.staking.accountsCached[accountIndex] = accounts
    store.staking.cachedAccountsNetwork = network
    on-finish err, accounts

add-stake-account = (store, web3t, tx-info, on-progress, on-finish) ->
    accounts = store.staking.accounts

    { instructions } = tx-info?data?transaction?message

    if instructions[0]?parsed?type isnt "createAccountWithSeed" then
        return on-finish "Not expected transaction type. Expected 'createAccountWithSeed' type."

    info = instructions?0?parsed?info
    console.log {info}
    stakeAccount = info?newAccount
    staker       = info?source
    lamports     = info?lamports
    seed         = info?seed
    custodian    = staker

    account = {
        activationEpoch: "0"
        custodian
        deactivationEpoch: "0"
        epoch: 0
        lamports
        pubkey: stakeAccount
        rentExemptReserve: "2282880"
        staker
        voter: null
        withdrawer: staker
    }

    store.staking.parsedProgramAccounts.push(account)
    err, accs <- as-callback web3t.velas.NativeStaking.getOwnStakingAccounts(store.staking.parsedProgramAccounts)
    return on-finish err if err?
    web3t.velas.NativeStaking.setAccounts(accs);
    store.staking.totalOwnStakingAccounts = accs.length
    store.staking.accounts-are-loading = yes

    cb = (err, accounts)->
        return on-finish err if err?
        store.staking.accounts = accounts
        publicKey = new velasWeb3.PublicKey(stakeAccount)

        /* Subscribe to the changes of created stake account */
        store.staking.accounts
            |> filter (a)->
                a.address is stakeAccount
            |> each (it)->
                publicKey  = it.pubKey
                subscribe-to-stake-account({store, web3t, account: it, publicKey})
        on-finish null
    fill-accounts { store, web3t, on-progress, on-finish: cb }, accs

filter-pools = (pools)->
    store.staking.pools = convert-pools-to-view-model pools
        |> sort-by (-> it.myStake.length )
    delinquent = store.staking.pools |> filter (-> it.status is "delinquent")
    running = store.staking.pools
        |> filter (it)->
            delinquent.index-of(it) < 0
        |> reverse
    store.staking.pools = running ++ delinquent

updateStakeAccount = ({ store, account, updatedAccount })->
    console.log "updateStakeAccount" {account, updatedAccount}
    if not account?
        throw new Error("No account was found")
    { lamports, data } = updatedAccount
    if not data?parsed?info
        index = store.staking.accounts |> findIndex (-> it.pubkey is account.pubkey)
        store.staking.accounts.splice(index,1)
    else
        { meta, stake } = data?parsed?info
        { lockup, rentExemptReserve, authorized } = meta
        { creditsObserved, delegation } = stake
        { activationEpoch, deactivationEpoch, stake, voter } = delegation
        updates = { lamports, stake, validator: voter, voter, rentExemptReserve, creditsObserved, activationEpoch, deactivationEpoch }
        account <<<< updates
        account.account = {...account}
    on-progress = ->
        store.staking.pools = convert-pools-to-view-model [...it]
    err, pools <- query-pools { store, web3t, on-progress }
    filter-pools(pools)

/* If find set to true, then we first found account from store.staking.accounts by publicKey */
subscribe-to-stake-account = ({store, web3t, account, publicKey, find})->
    commitment = 'confirmed'
    #found-acc =
        #| find is yes =>
            #store.staking.accounts |> find (-> it.address is account.pubkey)
        #| _ => account
    callback   = (updatedAccount)->
        updateStakeAccount({ store, account, updatedAccount })
    web3t.velas.NativeStaking.connection.onAccountChange(publicKey, callback, commitment)

query-accounts-web3t = (store, web3t, on-progress, on-finish) ->
    native-wallet = store.current.account.wallets |> find(-> it.coin.token is "vlx_native")
    validatorsBackend = native-wallet.network.api.validatorsBackend + \/v1/staking-accounts
    err, data <- get validatorsBackend .end
    return on-finish err if err?
    nativeAccountsFromBackendResult = data?body?stakingAccounts ? []
    console.error "[query-accounts-web3t] get parsedProgramAccounts err:", err if err?
    parsedProgramAccounts = nativeAccountsFromBackendResult ? []

    store.staking.parsedProgramAccounts = parsedProgramAccounts
    err, accs <- as-callback web3t.velas.NativeStaking.getOwnStakingAccounts(parsedProgramAccounts)
    accs = [] if err?
    web3t.velas.NativeStaking.setAccounts(accs);

    store.staking.totalOwnStakingAccounts = accs.length
    return on-finish err if err?
    store.staking.accounts-are-loading = yes
    fill-accounts { store, web3t, on-progress, on-finish }, accs
fill-accounts = ({ store, web3t, on-progress, on-finish }, [item, ...rest]) ->
    if not item? then
        store.staking.all-accounts-loaded = yes
        store.staking.accounts-are-loading = no
        return on-finish null, []
    if (([\validators, \info, \account_details, \pool_details].index-of(store.current.page)) is -1) then
        store.staking.all-accounts-loaded = no
        store.staking.accounts-are-loading = no
        return on-finish null, []
    store.staking.loadingAccountIndex += 1
    rent = item?rentExemptReserve
    #TODO: in future change seed with address and do not display this field
    err, seed <- as-callback web3t.velas.NativeStaking.checkSeed(item.pubkey)
    item.seed    = seed
    item.seed-index  = +((item.seed + "").split(":").1 )
    item.address = item.pubkey
    item.pubKey   = new velasWeb3.PublicKey(item.pubkey)
    item.key     = item.pubkey
    item.rentRaw = rent
    item.balanceRaw = if rent? then (item.lamports `minus` rent) else '-'
    item.balance = if rent? then (Math.round((item.lamports `minus` rent) `div` (10^9)) `times` 100) `div` 100  else "-"
    item.rent    = if rent? then (rent `div` (10^9)) else "-"
    item.credits_observed = item.creditsObserved ? 0
    item.status  = "inactive"
    item.validator = null
    item.account = {...item}
    { activationEpoch, deactivationEpoch, voter } = item
    if (activationEpoch and deactivationEpoch) then
        if (Number(deactivationEpoch) > Number(activationEpoch) or Number(activationEpoch) is web3t.velas.NativeStaking.max_epoch) then
            item.status    = "loading"
            item.validator = voter

    on-progress [item, ...rest] if on-progress?
    on-finish-local = (err, pools) ->
        on-finish err, [item, ...pools]
    on-progress-local = (pools) ->
        on-progress [item, ...pools]
    fill-accounts { store, web3t, on-progress: on-progress-local, on-finish: on-finish-local }, rest
###################    
convert-accounts-to-view-model = (accounts) ->
    res =
        accounts
            |> map -> {
                #account: it.account
                address: it.key ? '..'
                activationEpoch: it.activationEpoch,
                deactivationEpoch: it.deactivationEpoch,
                key: it.key
                pubKey: it.pubKey
                balanceRaw: it.balanceRaw ? 0
                balance: if it.balance? then round-human(it.balance) else '..'
                rent: if it.rent? then it.rent else "-"
                lastVote: it.lastVote ? '..'
                seed: it.seed ? '..'
                validator:  it?validator ? ""
                status: it.status ? "inactive"
                active_stake: it?active_stake ? 0
                inactive_stake: it?inactive_stake ? 0
                seed-index:  it.seed-index
                credits_observed: it.credits_observed
                voter: it.voter
            }
    res
##################
convert-pools-to-view-model = (pools) ->
    pools
        |> map -> {
            address: it.key ? '..',
            balanceRaw: it.activatedStake,
            checked: no,
            stake: if it.stake? then it.stake else '..',
            stake-initial: if it.activatedStake? then parse-float it.activatedStake `div` (10^9) else 0,
            commission: it.commission
            lastVote: if it.lastVote then round-human(it.lastVote) else '..'
            stakers: if it.delegators? then it.delegators else '..',
            is-validator:  (it?stakes? and it.stakes.length isnt 0) ? false,
            status: if it?delinquent is yes then "delinquent" else it.status,
            my-stake: if it?stakes then it.stakes else []
            credits_observed : it.credits_observed
        }
module.exports = { add-stake-account, filter-pools, subscribe-to-stake-account, query-pools, query-accounts, convert-accounts-to-view-model, convert-pools-to-view-model }