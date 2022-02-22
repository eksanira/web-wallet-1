require! {
    \react
    \react-dom
    \../navigate.ls
    \../get-primary-info.ls
    \react-copy-to-clipboard : { CopyToClipboard }
    \../copied-inform.ls
    \../copy.ls
    \../web3.ls
    \../get-lang.ls
    \../history-funcs.ls
    \./icon.ls
    \./switch-account.ls
    \../icons.ls
    \./epoch.ls
    \./alert-demo.ls
    \../components/burger.ls
    \prelude-ls : { find }
    \staking.2.0 : Staking
    'staking.2.0/lib/modules/staking-store.js' : { StakingStore }
}
.staking2
    $mobile: 500px
    @import scheme
    position: relative
    display: block
    width: auto
    margin-left: $left-margin
    top: 0
    height: auto
    min-height: 100vh
    padding-top: 5%
    box-sizing: border-box
    padding: 0px
    background: transparent
    text-align: left
    @media(max-width:$ipad)
        width: 100%
        margin: 0
    .staking
        top: 40%
        @media(max-width: $mobile)
            width: 100% !important
    .index-style-block-not-staked
        @media(max-width: $mobile)
            height: 460px !important
    .index-style-box
        @media(max-width:800px)
            width: 600px
        @media(max-width: $mobile)
            width: 90%
            top: 43%
            background: transparent
            border: none
    .style-container
        @media(max-width:$mobile)
            width: 90%
            top: 45%
    .css-5o0em1
        @media(max-width:$mobile)
            min-width: 90%
    .index-container-details
        @media(max-width:800px)
            margin: auto
    .index-width-container
        @media(max-width:800px)
            margin: auto
    .button-block-style-btn-green
        @media(max-width:$mobile)
            width: 45% !important
            margin-inline: 5px !important
            padding: 10px !important
    .button-block-style-btn-red
        @media(max-width:$mobile)
            width: 45% !important
            margin-inline: 5px !important
            padding: 10px !important
    .css-1qgma8u-MuiButtonBase-root-MuiTableSortLabel-root:hover
        color: #fff !important
    .css-1qgma8u-MuiButtonBase-root-MuiTableSortLabel-root.Mui-active
        color: #fff !important
    .css-1qgma8u-MuiButtonBase-root-MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon
        opacity: 1
        color: #fff !important
    .css-1mxz8qt-MuiPaper-root
        background-color: transparent !important
    >.title
        position: sticky
        position: -webkit-sticky
        z-index: 1
        background: var(--background)
        box-sizing: border-box
        top: 0
        width: 100%
        color: gray
        font-size: 22px
        padding: 10px
        height: 60px
        >.header
            margin: 5px
            @media(max-width:800px)
                text-align: center

staking2 = ({ store, web3t })->
    lang = get-lang store
    { go-back } = history-funcs store, web3t
    goto-search = ->
        navigate store, web3t, \search
    info = get-primary-info store
    action = ->
        store.current.active = not store.current.active
    active =
        if store.current.active then \active else \ ""
    style=
        background: info.app.wallet
        color: info.app.text
    border-style =
        color: info.app.text
        border-bottom: "1px solid #{info.app.border}"
        background: info.app.background
        background-color: info.app.bgspare
    resource =
        color: info.app.text
        border: "1px solid #{info.app.border}"
        background: info.app.header
        border-radius: info.app.border-btn
    show-class =
        if store.current.open-menu then \hide else \ ""


    /* Render */
    .pug.staking2
        .pug.title(style=border-style)
            .pug.header(class="#{show-class}") Staking
            .pug.close(on-click=goto-search)
                img.icon-svg.pug(src="#{icons.arrow-left}")
            burger store, web3t
            switch-account store, web3t
        .container.pug
            Staking.pug(stakingStore=store.stakingStore)


staking2.init = ({store, web3t}, cb)->
    wallet_native = store.current.account.wallets |> find (-> it.coin.token is \vlx_native)
    nativeData = wallet_native?network?api

    wallet_evm = store.current.account.wallets |> find (-> it.coin.token is \vlx_evm)
    evmData = wallet_evm?network?api

    config = {
        API_HOST: nativeData.apiUrl,
        evmAPI: evmData.web3Provider,
        nativeApi: nativeData.web3Provider,
        validatorsBackend: nativeData.validatorsBackend,
        publicKey: wallet_native.publicKey,
        evmAddress: wallet_evm.address,
        evmPrivateKey: wallet_evm.privateKey,
        network: store.current.network,
        nativePrivateKey: wallet_native.privateKey,
        fetchAccountsFromBackend: no
    }


    stakingStore = new StakingStore(config)
    store.stakingStore = stakingStore;
    cb null

module.exports = staking2