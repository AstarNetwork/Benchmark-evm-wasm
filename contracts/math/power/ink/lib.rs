#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod power {
    #[ink(storage)]
    pub struct Contract {}

    impl Contract {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {}
        }

        #[ink(message)]
        pub fn power(&mut self, n: u128) -> u128 {
            let mut sum = 0;
            for i in 0..n {
                sum += 2u128.pow(i as u32);
            }
            sum
        }
    }
}