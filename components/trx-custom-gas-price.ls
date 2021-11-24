require! {
    \react
    \../get-primary-info.ls
    \../get-lang.ls
    \../pages/icon.ls
    \../icons.ls
    \../send-funcs.ls
    \../numbers.js : {parseNum}
    \../math.ls : { times, minus, div, plus }
    \../round-human.ls
    \./react-currency-input-field : { default: CurrencyInput }
}
.trx-custom-gas-price
    @import scheme
    $border-radius: var(--border-btn)
    &.disabled
        opacity:.2
    table
        margin-bottom: -1px
        border-radius: $border-radius $border-radius 0 0
    td
        cursor: pointer
        padding: 2px 5px 10px
        transition: all .5s
        position: relative
        &:first-child
            border-radius: $border-radius 0 0 0
        &:last-child
            text-align: left
            border-radius: 0 $border-radius 0 0
        &:hover
            background: var(--td-hover)
            transition: all .5s
        &.active
            background: var(--td-hover)
            .field
                &.type
                    color: orange
                    &:after
                        opacity: 1
                        filter: none
        .type
            &:after
                content: $check-xs
                position: absolute
                right: 5px
                opacity: .2
                filter: grayscale(1)
                margin-bottom: 20px
        .coin
            text-transform: uppercase
    label
        padding-top: 5px
        padding-left: 3px
        font-size: 13px
    table
        width: 100%
    input
        outline: none
        width: 100%
        box-sizing: border-box
        height: 36px
        line-height: 36px
        border-radius: 0px
        padding: 0px 10px
        font-size: 14px
        border: 0px
        box-shadow: none
        margin-bottom: -1px
DECIMAL_SEPARATOR = '.'
trx-fee = ({ store, web3t, wallet, fee-token })->
    style = get-primary-info store
    lang = get-lang store
    {send} = store.current
    active-cheap = send.gas-price-type is \cheap
    active-custom = send.gas-price-type is \custom
    active-auto = send.gas-price-type is \auto
    active-class= (gas-price-type) ->
        return null if gas-price-type isnt send.gas-price-type
        return \active
    decimalsLimit = 9
    { choose-custom-gas-price, choose-auto-gas-price, has-send-error} = send-funcs store, web3t
    disabled-class = if has-send-error! then "disabled" else ""
    
    select-custom-gas-price = ->
        return if has-send-error!
        choose-custom-gas-price send.gas-price-custom-amount
    
    get-number = (val)->
        number = (val ? "").toString!
        return \0 if number is ""
        val
    
    value-without-decimal-with-dot = (value)->
        value = (value ? "").toString()
        res = value.split(DECIMAL_SEPARATOR)
        value.index-of(DECIMAL_SEPARATOR) > -1 and (res.length > 1 and res[1] is "")
    
    on-change-internal = (it)->
        console.log "[on-change-internal]"
        value = it
        value = get-number(value)
        
        
        # Restrictions check #
        result = value.toString!.split(DECIMAL_SEPARATOR)
        groups = result.0
        decimals = result.1
        if +groups > 10^15 then 
            return
        if decimals? and (decimals.length > decimalsLimit) then
            value = round-number(value, {decimals: decimalsLimit})
        else
            decimalsLimit = 0
        # # # # # # # # # # #
        res = (value ? "0").toString().split(DECIMAL_SEPARATOR)
        parsed-left = parseNum(res?0)
        has-dot = res.length > 1
        value = "0" if not value? or value is ""
        str_val = (value ? "0").toString()
        $value = 
            | it is "" => 0
            | value-without-decimal-with-dot(value) =>
                left = res.0
                parseNum(left) + DECIMAL_SEPARATOR
            | has-dot and parsed-left is parseNum(it) =>
                parsed-left + DECIMAL_SEPARATOR + (res?1 ? "" )    
            | has-dot and (str_val.length isnt (+str_val).toString().length) and (+value is +str_val) =>
                parseNum(res.0) + DECIMAL_SEPARATOR + (res?1 ? "" )          
            | _ => parseNum(value)
        value = $value 
        if send.gas-price-type is \custom then
            send.gas-price-custom-amount = value 
            choose-custom-gas-price value 
#            if ((send.amount-buffer.gas-price ? "").toString() isnt \0) and (send.amount-buffer.gas-price ? "").toString() is (send.gasPriceCustomAmount ? "").toString()
#                return  
        else
            send.gas-price-auto = value    
        #choose-custom-gas-price value
        send.amount-buffer.gas-price = send.gasPriceCustomAmount 
    
    
    border-style = border: "1px solid #{style.app.border}"
    text = color: "#{style.app.icon}"
    input-style=
        background: style.app.input
        border: "1px solid #{style.app.border}"
        color: style.app.text
        
    gas-price-custom-amount_GWEI = send.gas-price-custom-amount
    gas-price-custom-amount = round-human(gas-price-custom-amount_GWEI)
    auto-gas-price =  round-human((send.gas-price-auto ? 0) `div` (10^9))

    custom-option = ->
        td.pug(on-click=select-custom-gas-price class="#{active-class \custom}")
            .pug.field.type #{lang.custom}
            .pug.field.coin #{gas-price-custom-amount + " GWEI"}
    auto-fee-display-field-class =
        | store.current.send.fee-calculating is yes and send.gas-price-type is \auto => "placeholder" 
        | _ => ""
    auto-option = ->
        td.pug(on-click=choose-auto-gas-price class="#{active-class \auto}")
            .pug.field.type #{lang.auto}
            .pug.field.coin(class="#{auto-fee-display-field-class}") #{auto-gas-price  + " GWEI"}
    .pug.trx-custom-gas-price(class="#{disabled-class}")
        label.pug(style=text) Gas Price
        table.pug.fee(style=border-style)
            tbody.pug
                tr.pug
                    custom-option!
                    auto-option!
        if store.current.send.gas-price-type is \custom       
            CurrencyInput.pug(class="textfield tx-fee" key="tx-fee-input" allowNegativeValue=no style=input-style defaultValue="0" allowDecimals=yes value="#{gas-price-custom-amount_GWEI}" decimalsLimit=decimalsLimit label="Send" decimalSeparator=DECIMAL_SEPARATOR groupSeparator="," onValueChange=on-change-internal)
module.exports = trx-fee
#???store.current.send.send.gas-price-custom-amountcheaon-change-xcon-change-custom-fee.send""store.current.send.send.fstore.current.send.gas-price-custom-amount