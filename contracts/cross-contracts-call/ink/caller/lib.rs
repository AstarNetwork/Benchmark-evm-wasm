#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[openbrush::contract]
pub mod my_psp22 {
    use openbrush::{
        contracts::psp22::extensions::wrapper::*,
    };
    use ink::{
        env::{
            call::{
                build_call,
                ExecutionInput,
                Selector
            },
            DefaultEnvironment,
            CallFlags
        },
        prelude::vec::Vec,
    };

    #[ink(storage)]
    pub struct Contract {
    }

    impl Contract {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {}
        }

        #[ink(message)]
        pub fn ccall(&mut self, token: AccountId,  recipient: AccountId, amount: u128, n: u128) {
            for _i in 0..n {
                build_call::<DefaultEnvironment>()
                    .call(token)
                    .transferred_value(0)
                    .exec_input(
                        ExecutionInput::new(Selector::new([0xdb, 0x20, 0xf9, 0xf5].into()))
                            .push_arg(recipient)
                            .push_arg(amount)
                            .push_arg(Vec::<u8>::new())
                    )
                    .returns::<()>()
                    .invoke()
            }
        }
    }
}