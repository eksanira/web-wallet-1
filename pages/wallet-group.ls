require! {
    \react
    \../tools.ls : { money }
    \prelude-ls : { each, find, map }
    \../wallet-funcs.ls
    \../get-lang.ls
    \./icon.ls
    \../get-primary-info.ls
    \../../web3t/providers/superagent.js : { get }
    \../icons.ls
    \../round-human.ls
    \./confirmation.ls : { alert }
    \../components/button.ls
    \../components/address-holder.ls
}
.wallet-group
    @import scheme
    .group-name
        text-align: left
        padding: 5px 12px 5px 10px
        background: var(--bg-primary-light)
        color: #7f818a
        text-transform: uppercase
        font-size: 12px
        position: -webkit-sticky
        position: sticky
        top: 0
        z-index: 1
    .wallet
        @import scheme
        $cards-height: 324px
        $pad: 20px
        $radius: 15px
        position: relative
        cursor: pointer
        $card-height: 60px
        height: $card-height
        &.disabled-wallet-item
            opacity: 0.24
            cursor: no-drop
        &.last
            height: 60px
        $mt: 20px
        box-sizing: border-box
        overflow: hidden
        transition: height .5s
        border: 0px
        &:first-child
            margin-top: 0
            box-shadow: none
        &:last-child
            margin-bottom: 0px
        .pending
            color: orange
        &.over
            background: #CCC
        &.big
            height: 120px
        &.active
        .wallet-middle
            >.uninstall
                text-align: left
                font-size: 10px
                padding-top: 5px
            box-sizing: border-box
            width: 70%
            height: 85px
            float: left
            padding: 20px
            border-top: 1px solid rgb(107, 38, 142)
            border-right: 1px solid rgb(107, 38, 142)
            &:last-child
                display: block
            &:last-child
                width: 30%
                border-right: 0 !important
            .name
                color: #fff
                font-size: 16px
                font-weight: 700
                &.per
                    font-size: 10px
                    color: orange
                    font-weight: 100
                &:last-child
                    font-size: 10px
                    text-transform: uppercase
                    letter-spacing: 2px
                    margin-top: 5px
                    opacity: .8
            .title-balance
                color: #fff
                font-size: 14px
                text-align: left
            span
                padding-left: 10px
            a
                text-align: left
        >.wallet-top
            padding: 0 12px
            box-sizing: border-box
            $card-top-height: 55px
            width: 100%
            color: #677897
            font-size: 14px
            text-align: center
            overflow: hidden
            >*
                display: inline-block
                box-sizing: border-box
                vertical-align: top
                padding-top: 12px
                height: $card-top-height
                line-height: 16px
            >.top-left
                width: 30%
                text-align: left
                overflow: hidden
                text-overflow: ellipsis
                @media screen and (min-width: 801px)
                    padding-top: 5px
                @media screen and (max-width: 800px)
                    width: 15%
                >*
                    display: inline-block
                >.img
                    line-height: $card-top-height
                    vertical-align: top
                    margin-right: 10px
                    width: 40px
                    >img
                        vertical-align: top
                        max-width: 50px
                        $s: 35px
                        border-radius: 0
                        height: $s
                        @media screen and (min-width: 801px)
                            padding-top: 4px
                >.info
                    text-align: left
                    margin-left: 0px
                    text-overflow: ellipsis
                    overflow: hidden
                    width: auto
                    @media screen and (max-width: 390px)
                        display: none
                    >.name
                        padding-left: 3px
                    >.price
                        font-size: 11px
                        font-weight: bold
                        overflow: hidden
                        text-overflow: ellipsis
                        opacity: .5
                        padding: 0
                        letter-spacing: .4px
                        &.token
                            opacity: 1
                            font-size: 12px
            >.top-middle
                width: 30%
                text-align: center
                .label-coin
                    height: 16px
                    top: 3px
                    padding-left: 4px
                    position: relative
                @media screen and (max-width: 800px)
                    width: 50%
                    text-align: left
                >.balance
                    &:last-child
                        font-weight: bold
                        font-size: 13px
                    &.title
                        @media screen and (max-width: 220px)
                            display: none
                    .title-balance
                        display: none
            >.top-right
                width: 40%
                text-align: right
                .wallet-swap img
                    filter: invert(1)
                .icon
                    vertical-align: sub
                    .icon-svg-create
                        height: 9px
                        transform: rotate(-90deg)
                        vertical-align: inherit
                        opacity: .3
                @media screen and (max-width: 800px)
                    width: 35%
                    display: flex
                    float: right
                    flex-direction: row-reverse
                >button
                    outline: none
                    margin-bottom: 5px
                    margin-left: 5px
                    cursor: pointer
                    border: 0
                    $round: 36px
                    padding: 0
                    box-sizing: border-box
                    border-radius: $border
                    font-size: 10px
                    width: auto
                    padding: 0 6px
                    height: $round
                    color: #6CA7ED
                    text-transform: uppercase
                    font-weight: bold
                    background: transparent
                    transition: all .5s
                    text-overflow: ellipsis
                    overflow: hidden
                    width: 80px
                    .icon-svg
                        @media screen and (max-width: 800px)
                            padding: 0
                    .icon
                        position: relative
                        height: 16px
                        top: 2px
                    @media screen and (max-width: 800px)
                        width: 40px
                        line-height: 30px
cb = console~log
module.exports = (store, web3t, wallets, wallets-groups, wallets-group)-->
    lang = get-lang store
    style = get-primary-info store
    label-uninstall =
        | store.current.refreshing => \...
        | _ => "#{lang.hide}"
    wallet-style=
        color: style.app.text
    border-style =
        border-bottom: "1px solid #{style.app.border}"
    border =
        border-top: "1px solid #{style.app.border}"
        border-right: "1px solid #{style.app.border}"
    button-primary3-style=
        border: "0"
        color: style.app.text2
        background: style.app.primary3
        background-color: style.app.primary3-spare
    address-input=
        color: style.app.color3
        background: style.app.bg-primary-light
    btn-icon =
        filter: style.app.btn-icon
    icon-color=
        filter: style.app.icon-filter
    custom-style=
        border: "1px solid #71f4c0"
        border-radius: "13px"
        padding: "2px 4px"
        font-size: "8px"
        color: "#71f4c0"
    placeholder =
        | store.current.refreshing => "placeholder"
        | _ => ""
    placeholder-coin =
        | store.current.refreshing => "placeholder-coin"
        | _ => ""
    is-loading = store.current.refreshing is yes
    group-name =
        | wallets-group?0? => wallets-group.0
        | _ => ''
    wallets = wallets-group.1
    .wallet-group.pug(id="wallet-group-switch-#{(group-name)}")
        .pug.group-name #{group-name} Network
        wallets |> map (wallet)->
            { wallet-icon, button-style, uninstall, wallet, active, big, balance, balance-usd, pending, send, receive, swap, expand, usd-rate, last } = wallet-funcs store, web3t, wallets, wallet, wallets-groups, group-name
            name = wallet.coin.name ? wallet.coin.token
            receive-click = receive(wallet)
            send-click = send(wallet)
            swap-click = swap(store, wallet)
            token = wallet.coin.token
            is-custom = wallet?coin?custom is yes
            token-display = 
                | is-custom is yes => (wallet.coin.name ? "").to-upper-case!
                | _ => (wallet.coin.nickname ? "").to-upper-case!
            makeDisabled = store.current.refreshing
            wallet-is-disabled  = isNaN(wallet.balance)
            disabled-class = if not is-loading and wallet-is-disabled then "disabled-wallet-item" else ""
            wallet-is-disabled = isNaN(wallet.balance)
            send-swap-disabled = wallet-is-disabled or is-loading
            is-custom = wallet.coin.custom is yes
            /* Render */
            .wallet.pug.wallet-item(class="#{big} #{disabled-class}" key="#{token}" style=border-style id="token-#{token}")
                .wallet-top.pug(on-click=expand)
                    .top-left.pug(style=wallet-style)
                        .img.pug(class="#{placeholder-coin}")
                            img.pug(src="#{wallet-icon}")
                        .info.pug
                            .balance.pug.title(class="#{placeholder}") #{name}
                            if store.current.device is \desktop
                                .price.token.pug(class="#{placeholder}" title="#{wallet.balance}")
                                    span.pug #{ round-human wallet.balance }
                                    span.pug #{ token-display }
                            if is-custom
                                .price.pug(class="#{placeholder}" title="#{balance-usd}")
                                    span.pug(style=custom-style) CUSTOM   
                            else
                                .price.pug(class="#{placeholder}" title="#{balance-usd}")
                                    span.pug #{ round-human balance-usd}
                                    span.pug USD
                    if store.current.device is \mobile
                        .top-middle.pug(style=wallet-style)
                            if +wallet.pending-sent is 0
                                .balance.pug.title(class="#{placeholder}") #{name}
                            .balance.pug(class="#{placeholder}")
                                span.pug(title="#{wallet.balance}") #{ round-human wallet.balance }
                                    img.label-coin.pug(class="#{placeholder-coin}" src="#{wallet.coin.image}")
                                    span.pug #{ token-display }
                                if +wallet.pending-sent >0
                                    .pug.pending
                                        span.pug -#{ pending }               