#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod arithmetic {
    #[ink(storage)]
    pub struct Contract {}

    impl Contract {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {}
        }

        #[ink(message)]
        pub fn perform_arithmetic(&mut self, n: u128) -> u128 {
            let mut y = 0u128;
            for i in 0..n {
                y = i + 1;
                y = (y + 1) / 2;
                y = y * 2;
                y = y - 2;
            }
            y
        }
    }
}