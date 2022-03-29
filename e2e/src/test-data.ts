export const data = {
  walletHosts: {
    local: '127.0.0.1:8080/main-index.html',
    devnet: '',
    testnet: 'https://wallet.testnet.velas.com/',
    prod: 'https://wallet.velas.com/',
  },
  wallets: {
    withFunds: {
      address: 'Dawj15q13fqzh4baHqmD2kbrRCyiFfkE6gkPcUZ21KUS',
      seed: 'with funds',
    },
    txSender: {
      address: '2DKco1JBu1zshWDLmCp34AVgE6YkAu9BPmgbbgRuCoGm',
      seed: 'swap shock angry lucky clip heart chair point humble release west heart market fix pledge gift north panther muffin badge leisure client awake bunker',
    },
    fundsReceiver: {
      address: 'FJWtmzRwURdnrgn5ZFWvYNfHvXMtHK1WS7VHpbnfG73s',
      seed: 'funds receiver',
    },
    payer: {
      publicKey: '9kMFdW1VENdVpMyG9NNadNTzwXghknj3iU7CUwYFP1GC',
      seed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below',
    },
    login: {
      seed: 'decade cargo toe library cycle furnace idea tourist fuel chimney fury actual cash scheme race reason finger pulp nature family language spring kidney ancient',
      seedArr: ['decade', 'cargo', 'toe', 'library', 'cycle', 'furnace', 'idea', 'tourist', 'fuel', 'chimney', 'fury', 'actual', 'cash', 'scheme', 'race', 'reason', 'finger', 'pulp', 'nature', 'family', 'language', 'spring', 'kidney', 'ancient'],
    },
    staking: {
      staker: {
        publicKey: '5Rv7YBtPikC15gHrfpdYBhn1nhpieqrGusbrKhAshYXW',
        seed: 'chase excite tomato luxury trash foster swamp scene dismiss one huge save lottery awesome throw hungry three correct door rib rib repair modify grass',
      },
      stakerEVM: {
        publicKey: 'D4k7p4AB5j3hiLgbUS164wAufBefVagVLX2oRJQQhbpK',
        seed: 'horse valley hub funny photo raw tragic final update stable method split pond absurd tray organ pink vocal joy cook monkey nerve street copy',
      },
      staker2_1: {
        publicKey: '5uGmgxE5ia4dYmeffAM4bbx9ZUMrCUR6obZbL7VZ7svW',
        seed: 'gallery runway scissors faculty grocery spatial business judge ball lobster pitch sock stand marble degree alert once away festival reunion logic coach rural license',
      },
      withoutStakeAccounts: {
        address: '59vpQgPoDEhux1G84jk6dbbARQqfUwYtohLU4fgdxFKG',
        seed: 'occur memory armor lemon wide slush risk gauge answer work small pluck inform hawk away zone robot flock flash owner fall about curve note',
        encryptedSeed: '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',
      },
      rewards: {
        address: 'D25HT9pVmScZjz3DfNUFRb6Ci786DxSsjqyEYGA7nm1f',
        seed: 'eye still focus olive brass know echo element industry tumble gloom harvest lens allow genuine fee crash raise approve scrub cattle magic either portion',
        encryptedSeed: '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',
      },
      useMax: {
        seed: 'angry tennis album example festival angry priority eight pride please snack rigid lonely badge stem tattoo mother ring pole draft gauge install junk polar',
        encryptedSeed: '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',
      },
    },
    swap: {
      address: '22VainsYdNmnre8XS91XoUipQ2YLNd4oPyobKvvN1zsu',
      seed: 'spin swamp chronic catalog lake retire vessel will truly assault rib few grocery able maple catalog dinner nice dance coast jelly swallow interest nothing',
    },
  },
  customTokens: {
    velas: {
      wag: '0x598491bEAdf07e27B7EF0090C6A7e8e5eE0F3AB7',
    },
    eth: {
      weenus: '0x101848d5c5bbca18e6b4431eedf6b95e9adf82fa',
    },
    bsc: {
      dai: '0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867',
    },
    heco: {
      dai: '0x60d64ef311a4f0e288120543a14e7f90e76304c6',
    },
  },
};
