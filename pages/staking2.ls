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
    \../../../staking-npm/lib/index.js : Staking
}
.staking2
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
    @media(max-width:$ipad)
        width: 100%
        margin: 0
    .container
        padding: 40px 0
    #message
        background: red
        @media(max-width:800px)
            background: green
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
            text-align: center
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
    .pug.staking2
        .pug.title(style=border-style)
            .pug.header(class="#{show-class}") Staking
            .pug.close(on-click=goto-search)
                img.icon-svg.pug(src="#{icons.arrow-left}")
            burger store, web3t
            epoch store, web3t
            switch-account store, web3t
        .container.pug
            Staking.pug()



module.exports = staking2